from django.contrib.auth.signals import user_logged_in
from django.dispatch import receiver
from apps.inventario.services import ExpirarLotesService
from apps.core.services.services import NotificationService
import logging
import threading

logger = logging.getLogger(__name__)

@receiver(user_logged_in)
def handle_login(sender, user, request, **kwargs):
    print("Login signal received")
    
    def run_background_tasks():
        try:
            ExpirarLotesService.expirar_todos_lotes_viejos(force=True)
            NotificationService.check_all_notifications_after_expiration(force=True)
        except Exception as e:
            logger.error(f"Background task failed: {str(e)}")
    
    threading.Thread(target=run_background_tasks, daemon=True).start()
