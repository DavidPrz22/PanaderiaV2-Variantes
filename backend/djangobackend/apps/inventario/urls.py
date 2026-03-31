from rest_framework.routers import DefaultRouter
from apps.inventario.viewsets import (
    MateriaPrimaViewSet, 
    LotesMateriaPrimaViewSet, 
    ProductosIntermediosViewSet, 
    ProductosFinalesViewSet,
    ProductosFinalesListaTransformacionViewSet, 
    ProductosElaboradosViewSet, 
    LotesProductosElaboradosViewSet, 
    ProductosReventaViewSet, 
    LotesProductosReventaViewSet
    )
from apps.inventario.views import (
    ProductosPedidoSearchView, 
    ProductosComprasSearchView, 
    CategoriasProductosView, 
    ProductosVentasListaView,
    ComponenteRecetasView
    )
from django.urls import include, path

router = DefaultRouter()
# Materias Primas
router.register('materiaprima', MateriaPrimaViewSet, basename='materiaprima')
router.register('lotesmateriaprima', LotesMateriaPrimaViewSet, basename='lotesmateriaprima')

# Productos Intermedios
router.register('productos-intermedios', ProductosIntermediosViewSet, basename='productosintermedios')

# Productos Finales
router.register('productosfinales', ProductosFinalesViewSet, basename='productosfinales')

# Productos Reventa
router.register('productosreventa', ProductosReventaViewSet, basename='productosreventa')
router.register('lotes-productos-reventa', LotesProductosReventaViewSet, basename='lotes-productos-reventa')

# Productos Elaborados
router.register('lotes-productos-elaborados', LotesProductosElaboradosViewSet, basename='lotes-productos-elaborados')
router.register('productos-elaborados', ProductosElaboradosViewSet, basename='productos-elaborados')


# Transformaciones
router.register('productosfinales-lista-transformacion', ProductosFinalesListaTransformacionViewSet, basename='productosfinales-lista-transformacion')

urlpatterns = [
    path('productos-pedidos-search/', ProductosPedidoSearchView.as_view(), name="productos-pedidos-search"),
    path('productos-compras-search/', ProductosComprasSearchView.as_view(), name="productos-compras-search"),
    path('caja-categorias/', CategoriasProductosView.as_view(), name="categorias"),
    path('caja-productos-lista/', ProductosVentasListaView.as_view(), name="caja-productos-lista"),
    path('componentes-recetas/', ComponenteRecetasView.as_view(), name="componentes-recetas"),
    path('', include(router.urls))
    ]
