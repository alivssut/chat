from urllib.parse import parse_qs
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
from channels.db import database_sync_to_async

User = get_user_model()

@database_sync_to_async
def get_user(user_id):
    try:
        return User.objects.get(id=user_id)
    except User.DoesNotExist:
        return None

class JWTAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    def __call__(self, scope):
        return JWTAuthMiddlewareInstance(scope, self)

class JWTAuthMiddlewareInstance:
    def __init__(self, scope, middleware):
        self.scope = dict(scope)
        self.middleware = middleware

    async def __call__(self, receive, send):
        query_string = self.scope.get("query_string", b"").decode()
        qs = parse_qs(query_string)
        token = qs.get("token")

        self.scope["user"] = None
        if token:
            try:
                access_token = AccessToken(token[0])
                user = await get_user(access_token["user_id"])
                self.scope["user"] = user
            except Exception as e:
                print("JWT ERROR:", e)

        inner = self.middleware.inner(self.scope)
        return await inner(receive, send)
