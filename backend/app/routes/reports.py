from datetime import datetime
from flask import Blueprint, request, jsonify, session
from models import db, Reports, User

reports = Blueprint('reports', __name__)


def require_login():
    """Sprawdza czy użytkownik jest zalogowany przez sesję"""
    user_id = session.get('user_id')
    if not user_id:
        return None

    # Sprawdź czy użytkownik nadal istnieje w bazie
    user = User.query.get(user_id)
    if not user:
        session.clear()
        return None

    return user_id


@reports.route('/reports', methods=['POST'])
def create_report():
    """Utwórz nowy raport czasu pracy"""
    user_id = require_login()
    if not user_id:
        return jsonify({'error': 'Not logged in. Please log in first.'}), 401

    data = request.get_json()
    work_start = data.get('work_start')
    work_end = data.get('work_end')
    project = data.get('project')

    # Walidacja wymaganych pól
    if not all([work_start, project]):
        return jsonify({'error': 'work_start and project are required'}), 400

    # Sprawdź limit 3 projektów na użytkownika
    user_projects = db.session.query(Reports.project).filter(
        Reports.user_id == user_id
    ).distinct().all()

    existing_projects = [p[0] for p in user_projects]

    if project not in existing_projects and len(existing_projects) >= 3:
        return jsonify({
            'error': f'Maximum 3 projects allowed. Your projects: {", ".join(existing_projects)}'
        }), 400

    # Parsowanie dat
    try:
        work_start_dt = datetime.fromisoformat(work_start.replace('Z', '+00:00'))
        work_end_dt = datetime.fromisoformat(work_end.replace('Z', '+00:00')) if work_end else None
    except ValueError as e:
        return jsonify(
            {'error': f'Invalid date format. Use ISO 8601 format (e.g., 2025-10-22T10:30:00). Error: {str(e)}'}), 400

    # Walidacja dat
    if work_end_dt and work_end_dt < work_start_dt:
        return jsonify({'error': 'work_end must be after work_start'}), 400

    # Utwórz raport
    new_report = Reports(
        user_id=user_id,
        work_start=work_start_dt,
        work_end=work_end_dt,
        project=project
    )

    try:
        db.session.add(new_report)
        db.session.commit()

        return jsonify({
            'success': 'Report created successfully',
            'report': new_report.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create report', 'details': str(e)}), 500


@reports.route('/reports', methods=['GET'])
def get_reports():
    """Pobierz wszystkie raporty zalogowanego użytkownika"""
    user_id = require_login()
    if not user_id:
        return jsonify({'error': 'Not logged in. Please log in first.'}), 401

    # Filtry opcjonalne
    project = request.args.get('project')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    query = Reports.query.filter_by(user_id=user_id)

    if project:
        query = query.filter(Reports.project == project)

    if start_date:
        try:
            start_dt = datetime.fromisoformat(start_date)
            query = query.filter(Reports.work_start >= start_dt)
        except ValueError:
            return jsonify({'error': 'Invalid start_date format. Use YYYY-MM-DD or ISO 8601 format'}), 400

    if end_date:
        try:
            end_dt = datetime.fromisoformat(end_date)
            query = query.filter(Reports.work_start <= end_dt)
        except ValueError:
            return jsonify({'error': 'Invalid end_date format. Use YYYY-MM-DD or ISO 8601 format'}), 400

    reports_list = query.order_by(Reports.work_start.desc()).all()

    return jsonify({
        'reports': [report.to_dict() for report in reports_list],
        'count': len(reports_list)
    }), 200


@reports.route('/reports/<int:report_id>', methods=['GET'])
def get_report(report_id):
    """Pobierz konkretny raport"""
    user_id = require_login()
    if not user_id:
        return jsonify({'error': 'Not logged in. Please log in first.'}), 401

    report = Reports.query.filter_by(id=report_id, user_id=user_id).first()

    if not report:
        return jsonify({'error': 'Report not found or you do not have permission to view it'}), 404

    return jsonify({'report': report.to_dict()}), 200


@reports.route('/reports/<int:report_id>', methods=['PUT'])
def update_report(report_id):
    """Zaktualizuj raport"""
    user_id = require_login()
    if not user_id:
        return jsonify({'error': 'Not logged in. Please log in first.'}), 401

    report = Reports.query.filter_by(id=report_id, user_id=user_id).first()

    if not report:
        return jsonify({'error': 'Report not found or you do not have permission to update it'}), 404

    data = request.get_json()

    # Aktualizuj pola jeśli są podane
    if 'work_start' in data:
        try:
            report.work_start = datetime.fromisoformat(data['work_start'].replace('Z', '+00:00'))
        except ValueError:
            return jsonify({'error': 'Invalid work_start format'}), 400

    if 'work_end' in data:
        try:
            if data['work_end']:
                report.work_end = datetime.fromisoformat(data['work_end'].replace('Z', '+00:00'))
            else:
                report.work_end = None
        except ValueError:
            return jsonify({'error': 'Invalid work_end format'}), 400

    if 'project' in data:
        # Sprawdź limit projektów przy zmianie projektu
        if data['project'] != report.project:
            user_projects = db.session.query(Reports.project).filter(
                Reports.user_id == user_id
            ).distinct().all()

            existing_projects = [p[0] for p in user_projects]

            if data['project'] not in existing_projects and len(existing_projects) >= 3:
                return jsonify({
                    'error': f'Maximum 3 projects allowed. Your projects: {", ".join(existing_projects)}'
                }), 400

        report.project = data['project']

    # Walidacja dat
    if report.work_end and report.work_end < report.work_start:
        return jsonify({'error': 'work_end must be after work_start'}), 400

    try:
        db.session.commit()
        return jsonify({
            'success': 'Report updated successfully',
            'report': report.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update report', 'details': str(e)}), 500


@reports.route('/reports/<int:report_id>', methods=['DELETE'])
def delete_report(report_id):
    """Usuń raport"""
    user_id = require_login()
    if not user_id:
        return jsonify({'error': 'Not logged in. Please log in first.'}), 401

    report = Reports.query.filter_by(id=report_id, user_id=user_id).first()

    if not report:
        return jsonify({'error': 'Report not found or you do not have permission to delete it'}), 404

    try:
        db.session.delete(report)
        db.session.commit()
        return jsonify({'success': 'Report deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete report', 'details': str(e)}), 500


@reports.route('/reports/projects', methods=['GET'])
def get_user_projects():
    """Pobierz listę projektów użytkownika"""
    user_id = require_login()
    if not user_id:
        return jsonify({'error': 'Not logged in. Please log in first.'}), 401

    projects = db.session.query(Reports.project).filter(
        Reports.user_id == user_id
    ).distinct().all()

    project_list = [p[0] for p in projects]

    return jsonify({
        'projects': project_list,
        'count': len(project_list),
        'slots_remaining': 3 - len(project_list)
    }), 200


@reports.route('/reports/summary', methods=['GET'])
def get_reports_summary():
    """Pobierz podsumowanie czasu pracy per projekt"""
    user_id = require_login()
    if not user_id:
        return jsonify({'error': 'Not logged in. Please log in first.'}), 401

    # Opcjonalne filtry dat
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    query = Reports.query.filter_by(user_id=user_id)

    if start_date:
        try:
            start_dt = datetime.fromisoformat(start_date)
            query = query.filter(Reports.work_start >= start_dt)
        except ValueError:
            return jsonify({'error': 'Invalid start_date format'}), 400

    if end_date:
        try:
            end_dt = datetime.fromisoformat(end_date)
            query = query.filter(Reports.work_start <= end_dt)
        except ValueError:
            return jsonify({'error': 'Invalid end_date format'}), 400

    reports_list = query.all()

    summary = {}
    total_hours = 0

    for report in reports_list:
        if report.work_start and report.work_end:
            duration = (report.work_end - report.work_start).total_seconds() / 3600  # hours

            if report.project not in summary:
                summary[report.project] = {
                    'total_hours': 0,
                    'report_count': 0,
                    'last_work_date': None
                }

            summary[report.project]['total_hours'] += duration
            summary[report.project]['report_count'] += 1
            total_hours += duration

            # Śledź ostatnią datę pracy
            if not summary[report.project]['last_work_date'] or report.work_start > datetime.fromisoformat(
                    summary[report.project]['last_work_date']):
                summary[report.project]['last_work_date'] = report.work_start.isoformat()

    return jsonify({
        'summary': summary,
        'projects': list(summary.keys()),
        'total_hours': round(total_hours, 2),
        'total_reports': len(reports_list)
    }), 200


@reports.route('/reports/stats', methods=['GET'])
def get_user_stats():
    """Pobierz statystyki użytkownika"""
    user_id = require_login()
    if not user_id:
        return jsonify({'error': 'Not logged in. Please log in first.'}), 401

    total_reports = Reports.query.filter_by(user_id=user_id).count()
    completed_reports = Reports.query.filter(
        Reports.user_id == user_id,
        Reports.work_end.isnot(None)
    ).count()
    active_reports = total_reports - completed_reports

    projects = db.session.query(Reports.project).filter(
        Reports.user_id == user_id
    ).distinct().count()

    return jsonify({
        'total_reports': total_reports,
        'completed_reports': completed_reports,
        'active_reports': active_reports,
        'projects_count': projects,
        'projects_remaining': 3 - projects
    }), 200