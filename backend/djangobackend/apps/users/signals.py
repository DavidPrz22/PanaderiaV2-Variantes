from django.contrib.auth.signals import user_logged_in
from django.dispatch import receiver
from apps.inventario.services import ExpirarLotesService
from apps.core.services.services import NotificationService
import logging

@receiver(user_logged_in)
def handle_login(sender, user, request, **kwargs):
    print("Login signal received")
    ExpirarLotesService.expirar_todos_lotes_viejos(force=True)
    # Check notifications after expiration
    try:
        NotificationService.check_all_notifications_after_expiration(force=True)
    except Exception as e:
        # Log error but don't fail the expiration process
        logger = logging.getLogger(__name__)
        logger.error(f"Failed to check notifications after expiration: {str(e)}")
