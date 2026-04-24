from rest_framework.routers import DefaultRouter
from apps.compras.viewsets import ProveedoresViewSet, OrdenesCompraViewSet, ComprasViewSet, PagosProveedoresViewSet, OrdenesCompraTableViewSet

router = DefaultRouter()
router.register('proveedores', ProveedoresViewSet, basename='proveedores')
router.register('ordenes-compra', OrdenesCompraViewSet, basename='ordenes-compra')
router.register('ordenes-compra-lista', OrdenesCompraTableViewSet, basename='ordenes-compra-lista')
router.register('recepciones', ComprasViewSet, basename='recepciones')
router.register('pagos-proveedores', PagosProveedoresViewSet, basename='pagos-proveedores')
urlpatterns = router.urls