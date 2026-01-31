from django.contrib.auth.signals import user_logged_in
from django.dispatch import receiver
from apps.inventario.models import ComponentesStockManagement
from apps.core.services.services import NotificationService
import logging

# @receiver(user_logged_in)
# def handle_login(sender, user, request, **kwargs):
#     print("Login signal received")
#     ComponentesStockManagement.expirar_todos_lotes_viejos()
#     # Check notifications after expiration
#     try:
#         NotificationService.check_all_notifications_after_expiration()
#     except Exception as e:
#         # Log error but don't fail the expiration process
#         logger = logging.getLogger(__name__)
#         logger.error(f"Failed to check notifications after expiration: {str(e)}")
