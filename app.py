from flask import Flask, render_template, request, redirect, url_for, flash, abort
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from functools import wraps
from models import db, User, Calculation, ChatMessage
import os

app = Flask(__name__)

# Database configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///amsterdam.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # Saves memory

# Production security settings
if os.environ.get('FLASK_ENV') == 'production':
    app.config['SESSION_COOKIE_SECURE'] = True  # HTTPS only cookies
    app.config['SESSION_COOKIE_HTTPONLY'] = True  # No JS access to cookies
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'  # CSRF protection

# Initialize database with app
db.init_app(app)

# Initialize Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'  # Where to redirect when login required
login_manager.login_message = 'Please log in to access this page.'

@login_manager.user_loader
def load_user(user_id):
    """
    Required by Flask-Login
    
    What it does:
    - Loads user from database by ID
    - Called on every request to check if user is logged in
    - Returns User object or None
    """
    return db.session.get(User, user_id)

# Admin protection decorator
def admin_required(f):
    """
    Decorator to protect admin-only routes
    
    How it works:
    1. @login_required: Must be logged in
    2. Check if user.is_administrator()
    3. If not admin: return 403 Forbidden
    4. If admin: continue to route
    
    Usage: @admin_required above route function
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            return redirect(url_for('login'))
        if not current_user.is_administrator():
            abort(403)  # Forbidden
        return f(*args, **kwargs)
    return decorated_function

# Create database tables (runs once when app starts)
with app.app_context():
    db.create_all()
    print("📊 Database tables created!")

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/history")
def history():
    return render_template("history.html")

@app.route("/water")
def water():
    return render_template("water.html")

@app.route("/calculator", methods=["GET", "POST"])
def calculator():
    result = None
    error = None
    
    if request.method == "POST":
        try:
            # Get form data (this is where Python magic happens!)
            num1 = float(request.form["number1"])
            num2 = float(request.form["number2"]) 
            operation = request.form["operation"]
            
            # Python calculation happens here
            if operation == "add":
                result = num1 + num2
            elif operation == "subtract":
                result = num1 - num2
            elif operation == "multiply":
                result = num1 * num2
            elif operation == "divide":
                if num2 != 0:
                    result = num1 / num2
                else:
                    error = "Cannot divide by zero!"
            else:
                error = "Invalid operation!"
            
            # NEW: Save calculation to database
            if result is not None:
                try:
                    # Create a new calculation record
                    calculation = Calculation(
                        user_id=current_user.id if current_user.is_authenticated else 'anonymous',
                        number1=num1,
                        number2=num2,
                        operation=operation,
                        result=result
                    )
                    
                    # Save to database
                    db.session.add(calculation)
                    db.session.commit()
                    
                    print(f"📊 Saved calculation: {num1} {operation} {num2} = {result}")
                    
                except Exception as e:
                    print(f"❌ Error saving calculation: {e}")
                    # Don't show error to user - calculation still works
                    db.session.rollback()
            
        except ValueError:
            error = "Please enter valid numbers!"
        except KeyError:
            error = "Missing form data!"
    
    return render_template("calculator.html", result=result, error=error)

# NEW: Calculation history route
@app.route("/calculation-history")
@login_required  # Must be logged in to see history
def calculation_history():
    """
    Show user's saved calculations
    Now: filter by logged-in user only
    Security: Users only see THEIR calculations
    """
    try:
        # Get current user's calculations only, newest first
        calculations = Calculation.query.filter_by(user_id=current_user.id).order_by(Calculation.calculated_at.desc()).all()
        
        return render_template("calculation_history.html", calculations=calculations)
        
    except Exception as e:
        print(f"❌ Error loading calculation history: {e}")
        return render_template("calculation_history.html", calculations=[], error="Could not load calculation history")

# NEW: Authentication routes
@app.route("/register", methods=["GET", "POST"])
def register():
    """
    User registration
    
    Security considerations:
    - Check if email already exists
    - Hash password before storing
    - Validate password strength (basic)
    """
    if request.method == "POST":
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")
        confirm_password = request.form.get("confirm_password", "")
        
        # Basic validation
        if not email or not password:
            flash("Email and password are required!", "error")
        elif len(password) < 6:
            flash("Password must be at least 6 characters long!", "error")
        elif password != confirm_password:
            flash("Passwords do not match!", "error")
        elif User.query.filter_by(email=email).first():
            flash("An account with this email already exists!", "error")
        else:
            try:
                # Create new user
                user = User(email=email)
                user.set_password(password)  # Hash the password
                
                # Save to database
                db.session.add(user)
                db.session.commit()
                
                flash("Account created successfully! Please log in.", "success")
                return redirect(url_for("login"))
                
            except Exception as e:
                print(f"❌ Registration error: {e}")
                db.session.rollback()
                flash("An error occurred. Please try again.", "error")
    
    return render_template("register.html")

@app.route("/login", methods=["GET", "POST"])
def login():
    """
    User login
    
    Security:
    - Check email exists
    - Verify password hash
    - Create secure session
    """
    if request.method == "POST":
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")
        
        if not email or not password:
            flash("Email and password are required!", "error")
        else:
            user = User.query.filter_by(email=email).first()
            
            if user and user.check_password(password):
                login_user(user)
                flash(f"Welcome back, {user.email}!", "success")
                
                # Redirect to where they were trying to go, or home
                next_page = request.args.get('next')
                return redirect(next_page) if next_page else redirect(url_for('home'))
            else:
                flash("Invalid email or password!", "error")
    
    return render_template("login.html")

@app.route("/logout")
@login_required
def logout():
    """
    User logout
    
    What happens:
    - Clear user session
    - Redirect to home page
    """
    logout_user()
    flash("You have been logged out.", "info")
    return redirect(url_for("home"))

# NEW: Admin Dashboard Routes
@app.route("/admin")
@admin_required
def admin_dashboard():
    """
    Admin dashboard - overview of site statistics
    
    What we show:
    - Total users, calculations, recent activity
    - Quick stats for monitoring site health
    - Links to management tools
    """
    try:
        # Get statistics
        total_users = User.query.count()
        total_calculations = Calculation.query.count()
        admin_users = User.query.filter_by(is_admin=True).count()
        recent_users = User.query.order_by(User.created_at.desc()).limit(5).all()
        recent_calculations = Calculation.query.order_by(Calculation.calculated_at.desc()).limit(10).all()
        
        stats = {
            'total_users': total_users,
            'total_calculations': total_calculations,
            'admin_users': admin_users,
            'regular_users': total_users - admin_users
        }
        
        return render_template("admin/dashboard.html", 
                             stats=stats, 
                             recent_users=recent_users,
                             recent_calculations=recent_calculations)
        
    except Exception as e:
        print(f"❌ Admin dashboard error: {e}")
        flash("Error loading admin dashboard.", "error")
        return redirect(url_for("home"))

@app.route("/admin/users")
@admin_required
def admin_users():
    """
    User management page
    
    Features:
    - List all users with details
    - Search/filter users
    - Quick actions (delete, make admin)
    """
    try:
        users = User.query.order_by(User.created_at.desc()).all()
        return render_template("admin/users.html", users=users)
    
    except Exception as e:
        print(f"❌ Admin users error: {e}")
        flash("Error loading users.", "error")
        return redirect(url_for("admin_dashboard"))

@app.route("/admin/users/<user_id>/delete", methods=["POST"])
@admin_required
def admin_delete_user(user_id):
    """
    Delete a user account
    
    Security:
    - Admin only
    - POST request only (no accidental GET deletes)
    - Cascade delete (removes user's calculations)
    - Can't delete yourself
    """
    try:
        user = User.query.get_or_404(user_id)
        
        # Prevent self-deletion
        if user.id == current_user.id:
            flash("You cannot delete your own account!", "error")
            return redirect(url_for("admin_users"))
        
        user_email = user.email  # Store for flash message
        db.session.delete(user)
        db.session.commit()
        
        print(f"🗑️ Admin {current_user.email} deleted user {user_email}")
        flash(f"User {user_email} has been deleted.", "success")
        
    except Exception as e:
        print(f"❌ Delete user error: {e}")
        db.session.rollback()
        flash("Error deleting user.", "error")
    
    return redirect(url_for("admin_users"))

@app.route("/admin/users/<user_id>/toggle-admin", methods=["POST"])
@admin_required
def admin_toggle_admin(user_id):
    """
    Toggle admin status for a user
    
    Security:
    - Admin only
    - Can't remove your own admin status
    """
    try:
        user = User.query.get_or_404(user_id)
        
        # Prevent removing own admin status
        if user.id == current_user.id:
            flash("You cannot modify your own admin status!", "error")
            return redirect(url_for("admin_users"))
        
        user.is_admin = not user.is_admin
        db.session.commit()
        
        status = "promoted to admin" if user.is_admin else "removed from admin"
        print(f"👑 Admin {current_user.email} {status} user {user.email}")
        flash(f"User {user.email} has been {status}.", "success")
        
    except Exception as e:
        print(f"❌ Toggle admin error: {e}")
        db.session.rollback()
        flash("Error updating user admin status.", "error")
    
    return redirect(url_for("admin_users"))

# SECURITY: Removed make-admin route for production
# To create first admin, use Flask shell or database directly

# NEW: Database testing route (temporary - we'll remove this later)
# SECURITY: Removed db-test route for production
# Database stats now available in admin dashboard
# Debug functions removed for production security

if __name__ == "__main__":
    # Local development only - gunicorn handles production
    app.run(debug=True, port=5001)