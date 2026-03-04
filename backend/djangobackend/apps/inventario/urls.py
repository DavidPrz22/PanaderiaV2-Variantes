from rest_framework.routers import DefaultRouter
from apps.inventario.viewsets import ComponenteSearchViewSet, MateriaPrimaViewSet, LotesMateriaPrimaViewSet, ProductosFinalesDetallesViewSet, ProductosIntermediosViewSet, ProductosFinalesViewSet, ProductosIntermediosDetallesViewSet, ProductosElaboradosViewSet, ProductosFinalesSearchViewset, ProductosIntermediosSearchViewSet, ProductosFinalesListaTransformacionViewSet, LotesProductosElaboradosViewSet, ProductosReventaViewSet, ProductosReventaDetallesViewSet, LotesProductosReventaViewSet
from apps.inventario.views import ProductosPedidoSearchView, ProductosComprasSearchView, CategoriasProductosView, ProductosVentasListaView
from django.urls import include, path

router = DefaultRouter()
# Materias Primas
router.register('materiaprima', MateriaPrimaViewSet, basename='materiaprima')
router.register('lotesmateriaprima', LotesMateriaPrimaViewSet, basename='lotesmateriaprima')

# Componentes Receta
router.register('componentes-search', ComponenteSearchViewSet, basename='componentes-search')

# Productos Intermedios
router.register('productosintermedios', ProductosIntermediosViewSet, basename='productosintermedios')
router.register('productosintermedios-detalles', ProductosIntermediosDetallesViewSet, basename='productosintermedios-detalles')
router.register('productosintermedios-search', ProductosIntermediosSearchViewSet, basename='productosintermedios-search')

# Productos Finales
router.register('productosfinales', ProductosFinalesViewSet, basename='productosfinales')
router.register('productosfinales-detalles', ProductosFinalesDetallesViewSet, basename='productosfinales-detalles')
router.register('productosfinales-search', ProductosFinalesSearchViewset, basename='productosfinales-search')

# Productos Reventa
router.register('productosreventa', ProductosReventaViewSet, basename='productosreventa')
router.register('productosreventa-detalles', ProductosReventaDetallesViewSet, basename='productosreventa-detalles')
router.register('lotes-productos-reventa', LotesProductosReventaViewSet, basename='lotes-productos-reventa')

# Productos Elaborados
router.register('lotes-productos-elaborados', LotesProductosElaboradosViewSet, basename='lotes-productos-elaborados')
router.register('productoselaborados', ProductosElaboradosViewSet, basename='productoselaborados')


# Transformaciones
router.register('productosfinales-lista-transformacion', ProductosFinalesListaTransformacionViewSet, basename='productosfinales-lista-transformacion')

urlpatterns = [
    path('productos-pedidos-search/', ProductosPedidoSearchView.as_view(), name="productos-pedidos-search"),
    path('productos-compras-search/', ProductosComprasSearchView.as_view(), name="productos-compras-search"),
    path('caja-categorias/', CategoriasProductosView.as_view(), name="categorias"),
    path('caja-productos-lista/', ProductosVentasListaView.as_view(), name="caja-productos-lista"),
    path('', include(router.urls))
    ]
