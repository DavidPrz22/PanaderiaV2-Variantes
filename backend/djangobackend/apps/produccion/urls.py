from rest_framework.routers import DefaultRouter
from .viewsets import RecetasViewSet, ProduccionesViewSet, ProduccionDetallesViewSet

router = DefaultRouter()
router.register(r'recetas', RecetasViewSet)

# Replaced by action in RecetasViewSet
router.register(r'produccion', ProduccionesViewSet, basename='produccion')
router.register(r'produccion-detalles', ProduccionDetallesViewSet, basename='produccion-detalles')

urlpatterns = router.urls