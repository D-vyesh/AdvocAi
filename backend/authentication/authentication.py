"""
Custom JWT Authentication for MongoEngine and Django ORM
"""
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from .models import User

class MongoEngineJWTAuthentication(JWTAuthentication):
    """
    Custom JWT authentication that works with MongoEngine User model,
    falling back to standard Django User if needed.
    """
    
    def get_user(self, validated_token):
        """
        Get user from MongoEngine using the user_id from JWT token.
        Falls back to Django ORM User if not found in MongoEngine.
        """
        user_id = validated_token.get('user_id')
        if not user_id:
            raise InvalidToken('Token contained no recognizable user identification')
        
        # 1. Try finding in MongoEngine User model (MongoDB)
        try:
            user = User.objects(id=str(user_id)).first()
            if user:
                return user
        except Exception:
            pass
        
        # 2. Fallback to standard Django ORM User model
        try:
            return super().get_user(validated_token)
        except Exception:
            pass

        raise InvalidToken('User not found')
