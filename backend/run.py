from app import create_app

app = create_app()
# NIE dodawaj tutaj CORS(app) - już jest w __init__.py!

if __name__ == "__main__":
    app.run(debug=True)