import re
import bcrypt
from flask_mail import Message
from flask import Blueprint, current_app as app, request, jsonify, session
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature
from app import mail
from models import db, User

auth = Blueprint('auth', __name__)


class UnvalidMailException(Exception):
    pass


class UnvalidTokenException(Exception):
    pass


def generate_confirmation_token(email):
    """Generuje token potwierdzający email"""
    serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
    return serializer.dumps(email, salt=app.config['EMAIL_CONFIRM_SALT'])


def confirm_token(token, expiration=3600):
    """Weryfikuje token potwierdzający"""
    serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
    try:
        email = serializer.loads(
            token,
            salt=app.config['EMAIL_CONFIRM_SALT'],
            max_age=expiration
        )
        return email
    except (SignatureExpired, BadSignature):
        raise UnvalidTokenException("Invalid or expired token")


def is_valid_email(email):
    """Waliduje format email"""
    pattern = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    if not re.match(pattern, email):
        raise UnvalidMailException('Invalid email address')
    return True


def send_verification_email(email, token):
    """Wysyła email z kodem weryfikacyjnym"""
    msg = Message(
        subject="Verify your email address",
        sender=app.config['MAIL_USERNAME'],
        recipients=[email],
    )
    msg.body = f"""
Hello!

Thank you for registering. Please use the following code to verify your email:

{token}

This code will expire in 1 hour.

If you didn't register, please ignore this email.
    """
    mail.send(msg)


@auth.route('/register', methods=['POST'])
def register():
    """Rejestracja nowego użytkownika"""
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
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({'error': 'User with this email already exists'}), 400

    # Sprawdź czy login jest unikalny
    existing_login = User.query.filter_by(login=login).first()
    if existing_login:
        return jsonify({'error': 'Login already taken'}), 400

    # Hashuj hasło
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    password_to_save = hashed_password.decode('utf-8')

    # Utwórz nowego użytkownika (niezweryfikowanego)
    new_user = User(
        login=login,
        password=password_to_save,
        email=email,
        first_name=first_name,
        last_name=last_name,
        position=position,
        is_verified=False
    )

    try:
        db.session.add(new_user)
        db.session.commit()

        # Wyślij email z kodem potwierdzającym
        token = generate_confirmation_token(email)

        try:
            send_verification_email(email, token)
        except Exception as mail_error:
            # Jeśli wysyłka się nie powiedzie, usuń użytkownika
            db.session.delete(new_user)
            db.session.commit()
            return jsonify({'error': 'Failed to send confirmation email', 'details': str(mail_error)}), 500

        return jsonify({
            'success': 'User registered successfully. Please check your email for confirmation code.',
            'email': email
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create user', 'details': str(e)}), 500


@auth.route('/verify-email', methods=['POST'])
def verify_email():
    """Weryfikacja emaila za pomocą tokena"""
    data = request.get_json()
    token = data.get('token')

    if not token:
        return jsonify({'error': 'Token is required'}), 400

    try:
        email = confirm_token(token)
    except UnvalidTokenException:
        return jsonify({'error': 'Invalid or expired confirmation code'}), 400

    # Znajdź użytkownika po emailu
    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({'error': 'User not found'}), 404

    if user.is_verified:
        return jsonify({'message': 'Email already verified'}), 200

    # Zweryfikuj użytkownika
    user.is_verified = True
    db.session.commit()

    return jsonify({
        'success': 'Email verified successfully. You can now log in.',
        'email': user.email
    }), 200


@auth.route('/resend-verification', methods=['POST'])
def resend_verification():
    """Ponowne wysłanie kodu weryfikacyjnego"""
    data = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({'error': 'Email is required'}), 400

    try:
        is_valid_email(email)
    except UnvalidMailException:
        return jsonify({'error': 'Invalid email address'}), 400

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({'error': 'User not found'}), 404

    if user.is_verified:
        return jsonify({'message': 'Email already verified'}), 200

    # Wygeneruj i wyślij nowy token
    token = generate_confirmation_token(email)

    try:
        send_verification_email(email, token)
        return jsonify({'success': 'Verification email sent'}), 200
    except Exception as e:
        return jsonify({'error': 'Failed to send email', 'details': str(e)}), 500


@auth.route('/login', methods=['POST'])
def login():
    """Logowanie użytkownika - BEZ JWT, tylko sesja"""
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
    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({'error': 'Invalid email or password'}), 401

    # Sprawdź czy email jest zweryfikowany
    if not user.is_verified:
        return jsonify({'error': 'Please verify your email before logging in'}), 403

    # Sprawdź hasło
    if not bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
        return jsonify({'error': 'Invalid email or password'}), 401

    # Zapisz użytkownika w sesji - BEZ JWT!
    session.clear()  # Wyczyść starą sesję
    session['user_id'] = user.id
    session['email'] = user.email
    session.permanent = False  # Sesja wygasa po zamknięciu przeglądarki

    return jsonify({
        'success': 'Logged in successfully',
        'user': user.to_dict()
    }), 200


@auth.route('/logout', methods=['POST'])
def logout():
    """Wylogowanie użytkownika"""
    session.clear()
    return jsonify({'success': 'Logged out successfully'}), 200


@auth.route('/me', methods=['GET'])
def get_current_user():
    """Pobierz informacje o zalogowanym użytkowniku"""
    user_id = session.get('user_id')

    if not user_id:
        return jsonify({'error': 'Not logged in'}), 401

    user = User.query.get(user_id)

    if not user:
        session.clear()
        return jsonify({'error': 'User not found'}), 404

    return jsonify({'user': user.to_dict()}), 200


@auth.route('/check-session', methods=['GET'])
def check_session():
    """Sprawdź czy użytkownik jest zalogowany"""
    user_id = session.get('user_id')

    if user_id:
        user = User.query.get(user_id)
        if user:
            return jsonify({
                'authenticated': True,
                'user': user.to_dict()
            }), 200

    return jsonify({'authenticated': False}), 200