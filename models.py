from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import uuid

# Initialize database
db = SQLAlchemy()

class User(UserMixin, db.Model):
    """
    User model - stores account information
    
    Why these fields?
    - id: UUID (harder to guess than 1,2,3... more secure)
    - email: What people use to log in (unique identifier)
    - password_hash: NEVER store plain passwords!
    - created_at: When they joined (useful for analytics)
    """
    __tablename__ = 'users'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    is_admin = db.Column(db.Boolean, default=False, nullable=False)  # NEW: Admin role
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships - "this user has many calculations and chat messages"
    calculations = db.relationship('Calculation', backref='user', lazy=True, cascade='all, delete-orphan')
    chat_messages = db.relationship('ChatMessage', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def set_password(self, password):
        """
        Hash and store password securely
        
        Why we hash passwords:
        - NEVER store plain text passwords
        - Even if database is compromised, passwords are safe
        - Werkzeug uses bcrypt - industry standard
        """
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """
        Check if provided password matches stored hash
        
        How it works:
        - Takes plain text password from login form
        - Compares against stored hash
        - Returns True/False
        """
        return check_password_hash(self.password_hash, password)
    
    def is_administrator(self):
        """
        Check if user has admin privileges
        
        Why separate method:
        - Easy to extend with more complex role logic later
        - Clear, readable code: if user.is_administrator()
        - Future: could check multiple role types
        """
        return self.is_admin
    
    def __repr__(self):
        return f'<User {self.email}>'

class Calculation(db.Model):
    """
    Calculation model - stores calculator history
    
    Why store calculations?
    - Users can see their history
    - Analytics: which operations are popular?
    - Debugging: if something breaks, we can see what happened
    """
    __tablename__ = 'calculations'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    number1 = db.Column(db.Float, nullable=False)
    number2 = db.Column(db.Float, nullable=False)
    operation = db.Column(db.String(20), nullable=False)  # 'add', 'subtract', etc.
    result = db.Column(db.Float, nullable=False)
    calculated_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Calculation {self.number1} {self.operation} {self.number2} = {self.result}>'

class ChatMessage(db.Model):
    """
    Chat message model - stores AI conversations about Amsterdam
    
    Why store chat messages?
    - Users can continue conversations later
    - Learn what people ask about Amsterdam
    - Debug AI responses that don't work well
    """
    __tablename__ = 'chat_messages'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    user_message = db.Column(db.Text, nullable=False)  # What user asked
    ai_response = db.Column(db.Text, nullable=False)   # What AI responded
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<ChatMessage from {self.user_id} at {self.created_at}>'
