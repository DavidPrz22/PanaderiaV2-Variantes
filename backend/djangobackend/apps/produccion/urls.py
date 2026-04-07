from rest_framework.routers import DefaultRouter
from .viewsets import RecetasViewSet, ProduccionesViewSet

router = DefaultRouter()
router.register(r'recetas', RecetasViewSet)

# Replaced by action in RecetasViewSet
router.register(r'produccion', ProduccionesViewSet, basename='produccion')

urlpatterns = router.urls