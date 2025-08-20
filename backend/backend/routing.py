import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()


from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.sessions import SessionMiddlewareStack
from channels.security.websocket import OriginValidator, AllowedHostsOriginValidator

import django
from django.core.asgi import get_asgi_application

from c_chats import routing as chat_routing
django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    'websocket': AllowedHostsOriginValidator(
        SessionMiddlewareStack(
            AuthMiddlewareStack(
                URLRouter(
                    chat_routing.websocket_urlpatterns
                )
            )
        )
    )
})

# from channels.routing import ProtocolTypeRouter, URLRouter
# from channels.security.websocket import AllowedHostsOriginValidator

# def get_application():
#     from c_chats.routing import websocket_urlpatterns
#     from .middleware import JWTAuthMiddleware

#     return ProtocolTypeRouter({
#         "websocket": AllowedHostsOriginValidator(
#             JWTAuthMiddleware(
#                 URLRouter(
#                     websocket_urlpatterns
#                 )
#             )
#         ),
#     })

# application = get_application()
