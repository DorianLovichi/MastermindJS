from flask import Flask, render_template, request, redirect, url_for, flash
from flask_login import login_user, current_user, logout_user, login_required
from config import Config
from models import db, bcrypt, login_manager, User

app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)
bcrypt.init_app(app)
login_manager.init_app(app)

# Création de la base de données
@app.before_request
def create_tables():
    db.create_all()
# Page d'accueil
@app.route('/')
def home():
    return render_template('index.html')

# Page d'inscription
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = bcrypt.generate_password_hash(request.form['password']).decode('utf-8')

        user = User(username=username, email=email, password=password)
        db.session.add(user)
        db.session.commit()

        flash('Inscription réussie ! Connectez-vous.', 'success')
        return redirect(url_for('login'))

    return render_template('register.html')

# Page de connexion
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']

        user = User.query.filter_by(email=email).first()
        if user and bcrypt.check_password_hash(user.password, password):
            login_user(user)
            return redirect(url_for('home'))
        else:
            flash('Connexion échouée. Vérifiez vos informations.', 'danger')

    return render_template('login.html')

# Déconnexion
@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

# Gestion des scores
@app.route('/update_score', methods=['POST'])
@login_required
def update_score():
    new_score = request.json.get('score')
    current_user.score = new_score
    db.session.commit()
    return {'message': 'Score mis à jour'}, 200
