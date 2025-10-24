import re
from flask_mail import Message
from flask import Blueprint, current_app as app, request, jsonify
from itsdangerous import URLSafeTimedSerializer
from app import mail
from flask_jwt_extended import create_access_token

from models import db, User

auth = Blueprint('auth', __name__)

class UnvalidMailException(Exception):
    def __init__(self, message):
        super(UnvalidMailException, self).__init__(message)


class UnvalidTokenException(Exception):
    def __init__(self, message):
        super(UnvalidTokenException, self).__init__(message)


def generate_confirmation_token(email):
    serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
    return serializer.dumps(email, salt=app.config['EMAIL_CONFIRM_SALT'])


def confirm_token(token, expiration=3600):
    serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
    try:
        email = serializer.loads(
            token,
            salt=app.config['EMAIL_CONFIRM_SALT'],
            max_age=expiration
        )
    except Exception as e:
        raise UnvalidTokenException("Can't authorize groupCode")
    return email


def is_valid_email(email):
    pattern = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    if not re.match(pattern, email):
        raise UnvalidMailException('Invalid email address')


@auth.route('/request-code', methods=['POST'])
def request_code():
    email = request.get_json().get('email')
    try:
        is_valid_email(email)
    except UnvalidMailException as ex:
        return jsonify({'error': 'Invalid email address'}), 400

    token = generate_confirmation_token(email)
    msg = Message(
        subject="Verify your registration code",
        sender=app.config['MAIL_USERNAME'],
        recipients=[email],
    )
    msg.body = token
    try:
        mail.send(msg)
        return jsonify({'Success': 'Email sent successfully'}), 200
    except Exception as ex:
        return jsonify({'Error': ex}), 400


@auth.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    login = data.get('login')
    password = data.get('password')
    email = data.get('email')
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    position = data.get('position')

    # Walidacja wymaganych pól
    if not all([login, password, email, first_name, last_name]):
        return jsonify({'error': 'Login, password, email, first_name and last_name are required'}), 400

    # Walidacja formatu emaila
    try:
        is_valid_email(email)
    except UnvalidMailException:
        return jsonify({'error': 'Invalid email address'}), 400

    # Sprawdź czy użytkownik z tym emailem już istnieje
    existing_user = db.session.query(User).filter(User.email == email).first()
    if existing_user:
        return jsonify({'error': 'User with this email already exists'}), 400

    # Sprawdź czy login jest unikalny
    existing_login = db.session.query(User).filter(User.login == login).first()
    if existing_login:
        return jsonify({'error': 'Login already taken'}), 400

    # Hashuj hasło
    try:
        import bcrypt
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        password_to_save = hashed_password.decode('utf-8')
    except ImportError:
        # Jeśli nie masz bcrypt (NIEZALECANE!)
        password_to_save = password

    # Utwórz nowego użytkownika
    new_user = User(
        login=login,
        password=password_to_save,
        email=email,
        first_name=first_name,
        last_name=last_name,
        position=position
    )

    try:
        db.session.add(new_user)
        db.session.commit()

        # Wyślij email z kodem potwierdzającym
        token = generate_confirmation_token(email)
        msg = Message(
            subject="Verify your email address",
            sender=app.config['MAIL_USERNAME'],
            recipients=[email],
        )
        msg.body = f"Your confirmation code: {token}"

        try:
            mail.send(msg)
        except Exception as mail_error:
            # Jeśli wysyłka się nie powiedzie, usuń użytkownika
            db.session.delete(new_user)
            db.session.commit()
            return jsonify({'error': 'Failed to send confirmation email', 'details': str(mail_error)}), 500

        return jsonify({
            'success': 'User registered successfully. Please check your email for confirmation code.',
            'user_id': new_user.id
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create user', 'details': str(e)}), 500


@auth.route('/confirm-code', methods=['POST'])
def confirm():
    data = request.get_json()
    token = data.get('token')

    if not token:
        return jsonify({'error': 'Token is required'}), 400

    try:
        email = confirm_token(token)
    except UnvalidTokenException:
        return jsonify({'error': 'Invalid or expired confirmation code'}), 400

    # Znajdź użytkownika po emailu
    user = db.session.query(User).filter(User.email == email).first()

    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Opcjonalnie: dodaj pole 'is_verified' do modelu User
    # user.is_verified = True
    # db.session.commit()

    # Utwórz token JWT
    access_token = create_access_token(identity=user.id)

    return jsonify({
        "token": access_token,
        "login": user.to_dict(),
        "message": "Email confirmed successfully"
    }), 200


@auth.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    # Walidacja wymaganych pól
    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    # Walidacja formatu emaila
    try:
        is_valid_email(email)
    except UnvalidMailException:
        return jsonify({'error': 'Invalid email address'}), 400

    # Znajdź użytkownika po emailu
    user = db.session.query(User).filter(User.email == email).first()

    if not user:
        return jsonify({'error': 'Invalid email or password'}), 401

    # Sprawdź hasło
    try:
        import bcrypt
        if not bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
            return jsonify({'error': 'Invalid email or password'}), 401
    except (ImportError, ValueError):
        # Fallback dla niezahashowanych haseł (NIEZALECANE!)
        if user.password != password:
            return jsonify({'error': 'Invalid email or password'}), 401

    # Utwórz token JWT
    access_token = create_access_token(identity=user.id)

    return jsonify({
        "token": access_token,
        "user": user.to_dict()
    }), 200