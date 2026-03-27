from django.contrib import admin
from django.urls import path, include
from apps.users.views import CustomTokenObtainPairView, CustomTokenRefreshView, CustomLogoutView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='get_token'),
    path('api/token/refresh/', CustomTokenRefreshView.as_view(), name='refresh'),
    path('api/logout/', CustomLogoutView.as_view(), name='logout'),
    path('api/', include('apps.users.urls')),
    path('api/inventario/', include('apps.inventario.urls')),
    path('api/core/', include('apps.core.urls')),
    path('api/compras/', include('apps.compras.urls')),
    path('api/produccion/', include('apps.produccion.urls')),
    path('api/ventas/', include('apps.ventas.urls')),
    path('api/transformacion/', include('apps.transformacion.urls')),
    path('api/reportes/', include('apps.reportes.urls')),
    path('api/dashboard/', include('apps.dashboard.urls')),
]
