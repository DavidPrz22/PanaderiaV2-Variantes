from rest_framework import viewsets
from .models import (
    UnidadesDeMedida, 
    CategoriasMateriaPrima, 
    CategoriasProductosElaborados, 
    CategoriasProductosReventa, 
    MetodosDePago, 
    EstadosOrdenVenta, 
    EstadosOrdenCompra, 
    ConversionesUnidades, 
    Notificaciones,
    EmpaquetadoProductos
    )

from .serializers import (
    UnidadMedidaSerializer, 
    CategoriaMateriaPrimaSerializer, 
    CategoriaProductoSerializer, 
    CategoriaProductosReventaSerializer, 
    MetodosDePagoSerializer, 
    EstadosOrdenVentaSerializer, 
    EstadosOrdenCompraSerializer, 
    ConversionUnidadSerializer, 
    NotificacionesSerializer,
    EmpaquetadoProductosSerializer
    )

from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action
from djangobackend.permissions import IsAllUsersCRUD
from datetime import timedelta
from django.utils import timezone

from drf_spectacular.utils import extend_schema, extend_schema_view

@extend_schema_view(
    list=extend_schema(description='List all units of measure'),
    create=extend_schema(description='Create a new unit of measure'),
    retrieve=extend_schema(description='Get a unit of measure by ID'),
    update=extend_schema(description='Update a unit of measure by ID'),
    partial_update=extend_schema(description='Partial update of a unit of measure by ID'),
    destroy=extend_schema(description='Delete a unit of measure by ID'),
)
class UnidadMedidaViewSet(viewsets.ModelViewSet):
    queryset = UnidadesDeMedida.objects.all()
    serializer_class = UnidadMedidaSerializer


class ConversionUnidadViewSet(viewsets.ModelViewSet):
    queryset = ConversionesUnidades.objects.all()
    serializer_class = ConversionUnidadSerializer

@extend_schema_view(
    list=extend_schema(description='List all packaging products'),
    create=extend_schema(description='Create a new packaging products'),
    retrieve=extend_schema(description='Get a packaging products by ID'),
    update=extend_schema(description='Update a packaging products by ID'),
    partial_update=extend_schema(description='Partial update of a packaging products by ID'),
    destroy=extend_schema(description='Delete a packaging products by ID'),
)
class EmpaquetadoProductosViewSet(viewsets.ModelViewSet):
    queryset = EmpaquetadoProductos.objects.all()
    serializer_class = EmpaquetadoProductosSerializer

@extend_schema_view(
    list=extend_schema(description='List all raw material categories'),
    create=extend_schema(description='Create a new raw material category'),
    retrieve=extend_schema(description='Get a raw material category by ID'),
    update=extend_schema(description='Update a raw material category by ID'),
    partial_update=extend_schema(description='Partial update of a raw material category by ID'),
    destroy=extend_schema(description='Delete a raw material category by ID'),
)
class CategoriaMateriaPrimaViewSet(viewsets.ModelViewSet):
    queryset = CategoriasMateriaPrima.objects.all()
    serializer_class = CategoriaMateriaPrimaSerializer

@extend_schema_view(
    list=extend_schema(description='List all intermediate product categories'),
    create=extend_schema(description='Create a new intermediate product category'),
    retrieve=extend_schema(description='Get a intermediate product category by ID'),
    update=extend_schema(description='Update a intermediate product category by ID'),
    partial_update=extend_schema(description='Partial update of a intermediate product category by ID'),
    destroy=extend_schema(description='Delete a intermediate product category by ID'),
)
class CategoriaProductoIntermedioViewSet(viewsets.ModelViewSet):
    queryset = CategoriasProductosElaborados.objects.filter(es_intermediario=True)
    serializer_class = CategoriaProductoSerializer

@extend_schema_view(
    list=extend_schema(description='List all final product categories'),
    create=extend_schema(description='Create a new final product category'),
    retrieve=extend_schema(description='Get a final product category by ID'),
    update=extend_schema(description='Update a final product category by ID'),
    partial_update=extend_schema(description='Partial update of a final product category by ID'),
    destroy=extend_schema(description='Delete a final product category by ID'),
)
class CategoriaProductoFinalViewSet(viewsets.ModelViewSet):
    queryset = CategoriasProductosElaborados.objects.filter(es_intermediario=False)
    serializer_class = CategoriaProductoSerializer

@extend_schema_view(
    list=extend_schema(description='List all resale product categories'),
    create=extend_schema(description='Create a new resale product category'),
    retrieve=extend_schema(description='Get a resale product category by ID'),
    update=extend_schema(description='Update a resale product category by ID'),
    partial_update=extend_schema(description='Partial update of a resale product category by ID'),
    destroy=extend_schema(description='Delete a resale product category by ID'),
)
class CategoriaProductosReventaViewSet(viewsets.ModelViewSet):
    queryset = CategoriasProductosReventa.objects.all()
    serializer_class = CategoriaProductosReventaSerializer

@extend_schema_view(
    list=extend_schema(description='List all payment methods'),
    create=extend_schema(description='Create a new payment method'),
    retrieve=extend_schema(description='Get a payment method by ID'),
    update=extend_schema(description='Update a payment method by ID'),
    partial_update=extend_schema(description='Partial update of a payment method by ID'),
    destroy=extend_schema(description='Delete a payment method by ID'),
)
class MetodosDePagoViewSet(viewsets.ModelViewSet):
    queryset = MetodosDePago.objects.all()
    serializer_class = MetodosDePagoSerializer

@extend_schema_view(
    list=extend_schema(description='List all sales order statuses'),
    create=extend_schema(description='Create a new sales order status'),
    update=extend_schema(description='Update a sales order status by ID'),
    partial_update=extend_schema(description='Partial update of a sales order status by ID'),
    destroy=extend_schema(description='Delete a sales order status by ID'),
    get_estados_registro=extend_schema(description='Get sales order statuses for registration'),
)
class EstadosOrdenVentaViewSet(viewsets.ModelViewSet):
    queryset = EstadosOrdenVenta.objects.all()
    serializer_class = EstadosOrdenVentaSerializer

    @action(detail=False, methods=['get'], url_path='get-estados-registro')
    def get_estados_registro(self, request):
        estados = EstadosOrdenVenta.objects.filter(id__in=[1, 4])
        serializer = EstadosOrdenVentaSerializer(estados, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

@extend_schema_view(
    list=extend_schema(description='List all purchase order statuses'),
    create=extend_schema(description='Create a new purchase order status'),
    update=extend_schema(description='Update a purchase order status by ID'),
    partial_update=extend_schema(description='Partial update of a purchase order status by ID'),
    destroy=extend_schema(description='Delete a purchase order status by ID'),
    get_estados_registro=extend_schema(description='Get purchase order statuses for registration'),
)
class EstadosOrdenCompraViewSet(viewsets.ModelViewSet):
    queryset = EstadosOrdenCompra.objects.all()
    serializer_class = EstadosOrdenCompraSerializer

    @action(detail=False, methods=['get'], url_path='get-estados-registro')
    def get_estados_registro(self, request):
        estados = EstadosOrdenCompra.objects.filter(id__in=[1, 5])
        serializer = EstadosOrdenCompraSerializer(estados, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

@extend_schema_view(
    list=extend_schema(description='List all notifications while updating unread status'),
    create=extend_schema(description='Create a new notification'),
    update=extend_schema(description='Update a notification by ID'),
    partial_update=extend_schema(description='Partial update of a notification by ID'),
    destroy=extend_schema(description='Delete a notification by ID'),
)
class NotificacionesViewSet(viewsets.ModelViewSet):
    queryset = Notificaciones.objects.all()
    serializer_class = NotificacionesSerializer
    permission_classes = [IsAllUsersCRUD]

    def delete_old_notifications(self):
        """
        Delete notifications that are both read and older than 10 days.
        Returns the count of deleted notifications.
        """
        now = timezone.now()
        ten_days_ago = now - timedelta(days=30)

        # Filter notifications that are read AND older than 10 days
        old_notifications = Notificaciones.objects.filter(
            leida=True,
            fecha_notificacion__lt=ten_days_ago
        )

        # Get count before deletion
        count = old_notifications.count()
        
        # Delete the notifications if any exist
        if count > 0:
            old_notifications.delete()


    def list(self, request, *args, **kwargs):
        # Clean up old read notifications first
        self.delete_old_notifications()
        
        limit = 100
        min_notifications_to_show = 30
        
        # Fetch unread notifications and convert to list immediately to avoid lazy evaluation issues
        notificaciones_qs = Notificaciones.objects.filter(
            leida=False
        ).order_by('-fecha_notificacion')[:limit]
        
        notificaciones_sin_leer = list(notificaciones_qs)
        unread_notifications_count = len(notificaciones_sin_leer)
        unread_ids = [n.id for n in notificaciones_sin_leer]

        if unread_notifications_count == 0:
            data_to_serialize = list(Notificaciones.objects.filter(
                leida=True
            ).order_by('-fecha_notificacion')[:min_notifications_to_show])
        elif unread_notifications_count < min_notifications_to_show:
            notificaciones_leidas = Notificaciones.objects.filter(
                leida=True
            ).order_by('-fecha_notificacion')[:(min_notifications_to_show - unread_notifications_count)]
            
            data_to_serialize = notificaciones_sin_leer + list(notificaciones_leidas)
            data_to_serialize.sort(key=lambda x: x.fecha_notificacion, reverse=True)
        else:
            data_to_serialize = notificaciones_sin_leer
        
        serializer = NotificacionesSerializer(data_to_serialize, many=True)
        
        # Mark as read the notifications that were previously unread
        if unread_ids:
            Notificaciones.objects.filter(id__in=unread_ids).update(leida=True)

        return Response({"notificaciones": serializer.data}, status=status.HTTP_200_OK)
