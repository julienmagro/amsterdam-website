#!/usr/bin/env python3
"""
Safe admin creation script for production

Usage:
1. SSH into your Render instance
2. Run: python create_admin.py your.email@example.com
3. Or set FIRST_ADMIN_EMAIL environment variable
"""

import os
import sys
from app import app, db, User

def create_first_admin(email):
    """
    Safely create the first admin user
    
    Security:
    - Only works if no admins exist
    - User must already be registered
    - Cannot be accessed via web routes
    """
    with app.app_context():
        try:
            # Check if any admins exist
            existing_admins = User.query.filter_by(is_admin=True).count()
            if existing_admins > 0:
                print(f"❌ Admin users already exist ({existing_admins}). Cannot create more.")
                return False
            
            # Find the user
            user = User.query.filter_by(email=email.lower()).first()
            if not user:
                print(f"❌ User {email} not found. They must register first.")
                return False
            
            # Make them admin
            user.is_admin = True
            db.session.commit()
            
            print(f"✅ {email} is now the first admin!")
            return True
            
        except Exception as e:
            print(f"❌ Error: {e}")
            db.session.rollback()
            return False

if __name__ == "__main__":
    # Get email from command line or environment
    if len(sys.argv) > 1:
        email = sys.argv[1]
    else:
        email = os.environ.get('FIRST_ADMIN_EMAIL')
    
    if not email:
        print("❌ Usage: python create_admin.py your.email@example.com")
        print("   Or set FIRST_ADMIN_EMAIL environment variable")
        sys.exit(1)
    
    create_first_admin(email)
