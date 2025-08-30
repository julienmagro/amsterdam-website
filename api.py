from flask import Flask, request, jsonify, session, url_for, redirect, make_response, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from flask_mail import Mail, Message
from flask_dance.contrib.google import make_google_blueprint, google
from flask_dance.consumer.storage.sqla import OAuthConsumerMixin, SQLAlchemyStorage
from flask_dance.consumer import oauth_authorized
from functools import wraps
from models import db, User, Calculation, ChatMessage, OAuthToken
import os
import random
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# ===================== ENVIRONMENT CONFIGURATION =====================

def get_environment():
    """Detect current environment"""
    env = os.environ.get('ENVIRONMENT', 'local')
    if env in ['local', 'development']:
        return 'local'
    elif env in ['staging', 'test']:
        return 'staging'
    else:
        return 'production'

def get_frontend_url():
    """Get frontend URL based on environment"""
    env = get_environment()
    
    if env == 'local':
        return 'http://localhost:3000'
    elif env == 'staging':
        # Use the same domain as the backend for staging
        return os.environ.get('FRONTEND_URL', 'https://amsterdam-site-staging.onrender.com')
    else:
        # Production
        return os.environ.get('FRONTEND_URL', 'https://pirateship.nl')

# Environment-specific configuration
current_env = get_environment()
frontend_url = get_frontend_url()

print(f"🌍 Environment: {current_env}")
print(f"🌐 Frontend URL: {frontend_url}")

# Allow OAuth over HTTP ONLY for local development
if current_env == 'local':
    os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
    print("🔓 OAuth over HTTP enabled for local development")

# Enable CORS for React frontend (environment-aware)
cors_origins = [frontend_url]
if current_env == 'local':
    # Allow both localhost variations for local development
    cors_origins.extend(['http://localhost:3000', 'http://127.0.0.1:3000'])

CORS(app, origins=cors_origins, supports_credentials=True)
print(f"🌐 CORS enabled for: {cors_origins}")

# Database configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///amsterdam.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# JWT Configuration
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

# Email configuration for MFA
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False
app.config['MAIL_USERNAME'] = os.environ.get('GMAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.environ.get('GMAIL_APP_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('GMAIL_USERNAME')

# Google OAuth Configuration
app.config['GOOGLE_OAUTH_CLIENT_ID'] = os.environ.get('GOOGLE_CLIENT_ID')
app.config['GOOGLE_OAUTH_CLIENT_SECRET'] = os.environ.get('GOOGLE_CLIENT_SECRET')

# Initialize extensions
db.init_app(app)
mail = Mail(app)
jwt = JWTManager(app)

# Flask-Login setup (for compatibility with existing auth)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'auth.login'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Create Google OAuth blueprint
google_bp = make_google_blueprint(
    client_id=app.config['GOOGLE_OAUTH_CLIENT_ID'],
    client_secret=app.config['GOOGLE_OAUTH_CLIENT_SECRET'],
    scope=['https://www.googleapis.com/auth/userinfo.profile', 
           'https://www.googleapis.com/auth/userinfo.email', 
           'openid'],
    storage=SQLAlchemyStorage(OAuthToken, db.session)
)
app.register_blueprint(google_bp, url_prefix='/auth')

# ===================== GOOGLE OAUTH CALLBACK =====================

@oauth_authorized.connect_via(google_bp)
def google_logged_in(blueprint, token):
    """Handle Google OAuth success using Flask-Dance signals"""
    if not token:
        return False
    
    try:
        # Get user info from Google
        resp = blueprint.session.get('/oauth2/v2/userinfo')
        if not resp.ok:
            return False
        
        google_info = resp.json()
        
        # Check if user exists with this Google ID
        user = User.query.filter_by(google_id=google_info['id']).first()
        
        if not user:
            # Check if user exists with this email
            user = User.query.filter_by(email=google_info['email']).first()
            if user:
                # Link Google account to existing user
                user.google_id = google_info['id']
                user.profile_picture = google_info.get('picture')
                user.email_verified = True
            else:
                # Create new user from Google info
                user = User(
                    email=google_info['email'],
                    first_name=google_info.get('given_name', ''),
                    last_name=google_info.get('family_name', ''),
                    google_id=google_info['id'],
                    profile_picture=google_info.get('picture'),
                    email_verified=True,
                    user_age=25  # Default age for Google users
                )
                db.session.add(user)
        
        db.session.commit()
        
        # Store user info in session for the redirect route
        session['oauth_user_id'] = user.id
        
        # Redirect to our success page
        return redirect(url_for('google_success'))
        
    except Exception as e:
        print(f"Google OAuth error: {e}")
        return False

@app.route('/auth/google/success')
def google_success():
    """Redirect endpoint after successful OAuth"""
    user_id = session.get('oauth_user_id')
    
    if not user_id:
        return f'''
        <html>
        <head><title>Login Failed</title></head>
        <body>
        <script>
            window.location.href = "{frontend_url}/login?error=oauth_failed";
        </script>
        <p>Login failed. Redirecting...</p>
        </body>
        </html>
        '''
    
    # Clear the session
    session.pop('oauth_user_id', None)
    
    # Create access token
    access_token = create_access_token(identity=user_id)
    
    # Create a Flask response with the token as a cookie and redirect
    response = make_response(f'''
    <html>
    <head><title>Login Successful</title></head>
    <body>
    <script>
        // Store token in cookie and redirect
        document.cookie = "access_token={access_token}; path=/; max-age=86400; SameSite=Lax";
        setTimeout(function() {{
            window.location.href = "/auth/callback";
        }}, 500);
    </script>
    <p>Login successful! Redirecting in 1 second...</p>
    </body>
    </html>
    ''')
    
    # Also set the cookie server-side for reliability
    response.set_cookie(
        'access_token', 
        access_token, 
        max_age=86400,  # 1 day
        secure=False,   # Will be True in production HTTPS
        httponly=False, # Allow JavaScript access
        samesite='Lax'
    )
    
    return response

# ===================== API ROUTES =====================

# Health check endpoint
@app.route('/api/health')
def health_check():
    return jsonify({'status': 'healthy', 'message': 'Amsterdam API is running!'})

# ===================== AUTHENTICATION API =====================

@app.route('/api/auth/register', methods=['POST'])
def api_register():
    try:
        data = request.get_json()
        
        # For local development, only require email and password
        required_fields = ['email', 'password']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Check if user already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered'}), 400
        
        # Create new user with optional fields
        user = User(
            email=data['email'],
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', ''),
            user_age=data.get('age', 25) if data.get('age') else 25  # Use correct field name
        )
        user.set_password(data['password'])
        
        # For local development, skip email verification
        user.email_verified = True  # Auto-verify for local testing
        
        db.session.add(user)
        db.session.commit()
        
        # Create access token immediately for local testing
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'message': 'Registration successful!',
            'access_token': access_token,
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_admin': user.is_admin  # Use correct field name
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Registration error: {e}")  # Debug output
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500

@app.route('/api/auth/verify-email', methods=['POST'])
def api_verify_email():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        verification_code = data.get('verification_code')
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if user.email_verified:
            return jsonify({'message': 'Email already verified'}), 200
        
        if user.verification_code != verification_code:
            return jsonify({'error': 'Invalid verification code'}), 400
        
        if user.verification_expires < datetime.utcnow():
            return jsonify({'error': 'Verification code has expired'}), 400
        
        # Verify email
        user.email_verified = True
        user.verification_code = None
        user.verification_expires = None
        db.session.commit()
        
        # Create access token
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'message': 'Email verified successfully!',
            'access_token': access_token,
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_admin': user.is_admin
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Verification failed'}), 500

@app.route('/api/auth/login', methods=['POST'])
def api_login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        user = User.query.filter_by(email=email).first()
        
        if not user or not user.check_password(password):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # For local development, skip email verification check
        # if not user.email_verified:
        #     return jsonify({'error': 'Please verify your email first'}), 401
        
        # Create access token
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_admin': user.is_admin,  # Use correct field name
                'user_age': user.user_age  # Use correct field name
            }
        }), 200
        
    except Exception as e:
        print(f"Login error: {e}")  # Debug output
        return jsonify({'error': f'Login failed: {str(e)}'}), 500



@app.route('/api/auth/logout', methods=['POST'])
@jwt_required()
def api_logout():
    # With JWT, logout is handled client-side by removing the token
    return jsonify({'message': 'Logout successful'}), 200

@app.route('/api/auth/profile')
@jwt_required()
def api_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'user': {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'age': user.user_age,
            'is_admin': user.is_admin,
            'profile_picture': user.profile_picture,
            'email_verified': user.email_verified,
            'calculations_count': len(user.calculations)
        }
    }), 200

# ===================== CALCULATOR API =====================

@app.route('/api/calculator', methods=['POST'])
@jwt_required()
def api_calculator():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        num1 = float(data.get('num1', 0))
        num2 = float(data.get('num2', 0))
        operation = data.get('operation', '+')
        
        # Perform calculation
        if operation == '+':
            result = num1 + num2
        elif operation == '-':
            result = num1 - num2
        elif operation == '*':
            result = num1 * num2
        elif operation == '/':
            if num2 == 0:
                return jsonify({'error': 'Cannot divide by zero'}), 400
            result = num1 / num2
        else:
            return jsonify({'error': 'Invalid operation'}), 400
        
        # Save calculation to database
        calculation = Calculation(
            user_id=user_id,
            number1=num1,
            number2=num2,
            operation=operation,
            result=result
        )
        db.session.add(calculation)
        db.session.commit()
        
        return jsonify({
            'result': result,
            'expression': f"{num1} {operation} {num2} = {result}",
            'calculation_id': calculation.id,
            'timestamp': calculation.calculated_at.isoformat()
        }), 200
        
    except ValueError:
        return jsonify({'error': 'Invalid number format'}), 400
    except Exception as e:
        return jsonify({'error': 'Calculation failed'}), 500

@app.route('/api/calculator/history')
@jwt_required()
def api_calculation_history():
    user_id = get_jwt_identity()
    
    # Get user's calculations
    calculations = Calculation.query.filter_by(user_id=user_id).order_by(Calculation.calculated_at.desc()).all()
    
    calculations_data = []
    for calc in calculations:
        calculations_data.append({
            'id': calc.id,
            'expression': f"{calc.number1} {calc.operation} {calc.number2} = {calc.result}",
            'result': calc.result,
            'timestamp': calc.calculated_at.isoformat()
        })
    
    # Calculate statistics
    total_calculations = len(calculations)
    operations_count = {}
    for calc in calculations:
        operations_count[calc.operation] = operations_count.get(calc.operation, 0) + 1
    
    return jsonify({
        'calculations': calculations_data,
        'statistics': {
            'total': total_calculations,
            'operations': operations_count
        }
    }), 200

# ===================== ADMIN API =====================

def admin_required(f):
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated_function

@app.route('/api/admin/users')
@admin_required
def api_admin_users():
    users = User.query.all()
    users_data = []
    
    for user in users:
        users_data.append({
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'age': user.user_age,
            'is_admin': user.is_admin,
            'email_verified': user.email_verified,
            'google_id': user.google_id,
            'calculations_count': len(user.calculations),
            'created_at': user.timestamp.isoformat() if hasattr(user, 'timestamp') else None
        })
    
    return jsonify({
        'users': users_data,
        'total_users': len(users_data)
    }), 200

@app.route('/api/admin/stats')
@admin_required
def api_admin_stats():
    total_users = User.query.count()
    total_calculations = Calculation.query.count()
    verified_users = User.query.filter_by(email_verified=True).count()
    google_users = User.query.filter(User.google_id.isnot(None)).count()
    
    return jsonify({
        'total_users': total_users,
        'total_calculations': total_calculations,
        'verified_users': verified_users,
        'google_users': google_users
    }), 200

# ===================== CONTENT API =====================

@app.route('/api/content/history')
def api_history_content():
    # Static content for Amsterdam history
    facts = [
        {
            'title': 'Canal Ring UNESCO World Heritage',
            'content': 'Amsterdam\'s 17th-century canal ring was designated a UNESCO World Heritage Site in 2010, recognizing its outstanding universal value as an example of hydraulic engineering and urban planning.'
        },
        {
            'title': 'Golden Age Architecture', 
            'content': 'The narrow houses along the canals were built during the Dutch Golden Age (17th century). Their distinctive gabled facades were designed to maximize space on expensive canal-front property.'
        },
        {
            'title': 'Venice of the North',
            'content': 'Amsterdam has 165 canals with a total length of over 100 kilometers, more than Venice! The city has 1,281 bridges connecting its 90 islands.'
        },
        {
            'title': 'Anne Frank House',
            'content': 'The Anne Frank House, where Anne Frank hid during World War II, is one of Amsterdam\'s most visited museums, preserving an important piece of history from the darkest period of the 20th century.'
        }
    ]
    
    return jsonify({'facts': facts}), 200

@app.route('/api/content/water')
def api_water_content():
    # Static content for Amsterdam water life
    content = {
        'intro': 'Amsterdam\'s canals are home to a diverse ecosystem of aquatic life, despite being in an urban environment.',
        'fish_species': [
            {
                'name': 'Pike (Snoek)',
                'description': 'Large predatory fish commonly found in Amsterdam\'s larger canals and the Amstel river.'
            },
            {
                'name': 'Perch (Baars)',
                'description': 'A popular fish among local anglers, easily recognizable by its distinctive stripes.'
            },
            {
                'name': 'Roach (Voorn)',
                'description': 'One of the most common fish in Amsterdam\'s waterways, well-adapted to urban environments.'
            },
            {
                'name': 'Bream (Brasem)',
                'description': 'Large, deep-bodied fish that can be found in the deeper parts of the canal system.'
            }
        ],
        'ecosystem_facts': [
            'The canals are cleaned regularly to maintain water quality for both fish and urban use.',
            'Many canals connect to the North Sea, allowing for some saltwater fish to enter the system.',
            'Water quality has improved significantly over the past decades due to environmental efforts.',
            'The canal system supports not just fish, but also birds, plants, and other aquatic life.'
        ]
    }
    
    return jsonify(content), 200

# ===================== ERROR HANDLERS =====================

@app.errorhandler(404)
def api_not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def api_internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

# ===================== APPLICATION STARTUP =====================

# ===================== SERVE REACT APP IN PRODUCTION =====================

import os

# Check if we have a React build directory
react_build_path = os.path.join(os.path.dirname(__file__), 'frontend', 'out')
react_build_exists = os.path.exists(react_build_path)

if react_build_exists:
    # Serve React static files
    @app.route('/')
    @app.route('/<path:path>')
    def serve_react(path=''):
        """Serve React app for all non-API routes"""
        # Skip API routes
        if path.startswith('api/') or path.startswith('auth/'):
            return jsonify({'error': 'Endpoint not found'}), 404
        
        # Try to serve the specific file
        if path and os.path.exists(os.path.join(react_build_path, path)):
            return send_from_directory(react_build_path, path)
        
        # For all other routes, serve index.html (React routing)
        return send_from_directory(react_build_path, 'index.html')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5001)
