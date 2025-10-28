from flask import Flask
from flask_mail import Mail
from models import db
from flask_cors import CORS

mail = Mail()


def create_app(config_class="config.Config"):
    app = Flask(__name__, template_folder="../templates")
    app.config.from_object(config_class)

    # CORS z credentials - WAŻNE dla sesji!
    CORS(app,
         supports_credentials=True,
         origins=["http://localhost:3000", "http://localhost:5000"],
         allow_headers=["Content-Type"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

    # Initialize extensions with app
    db.init_app(app)
    mail.init_app(app)

    with app.app_context():
        db.create_all()

    # Register blueprints
    from app.routes.main import main as main_blueprint
    app.register_blueprint(main_blueprint)

    from app.routes.auth import auth as auth_blueprint
    app.register_blueprint(auth_blueprint, url_prefix='/auth')

    from app.routes.reports import reports as reports_blueprint
    app.register_blueprint(reports_blueprint, url_prefix='/api')

    return app