from rest_framework import viewsets
from drf_spectacular.utils import extend_schema
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Q, F
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

from apps.ventas.models import Ventas, DetalleVenta, OrdenVenta
from apps.compras.models import OrdenesCompra
from apps.produccion.models import Produccion
from apps.inventario.models import LotesMateriasPrimas, LotesProductosElaborados, LotesProductosReventa, LotesStatus

from .serializers import (
    SalesTodaySerializer,
    PendingOrdersSerializer,
    StockAlertsSerializer,
    RecentProductionsSerializer,
    SalesTrendDataSerializer,
    TopProductsDataSerializer,
    RecentPurchasesSerializer,
    RecentSalesSerializer,
)


class DashboardViewSet(viewsets.ViewSet):
    """
    ViewSet for dashboard data endpoints.
    All actions return aggregated data for dashboard display.
    """
    permission_classes = [IsAuthenticated]

    @extend_schema(responses=SalesTodaySerializer)
    @action(detail=False, methods=['get'], url_path='sales-today')
    def sales_today(self, request):
        """
        Get sales summary for today.
        Returns: total_sales, total_transactions, total_items_sold, percentage_vs_yesterday
        """
        today = timezone.now().date()
        yesterday = today - timedelta(days=1)

        # Today's sales
        today_sales = Ventas.objects.filter(
            fecha_venta=today
        ).aggregate(
            total_sales=Sum('monto_total_ves'),
            total_transactions=Count('id')
        )

        # Count total items sold today
        today_items = DetalleVenta.objects.filter(
            venta__fecha_venta=today
        ).aggregate(
            total_items=Sum('cantidad_vendida')
        )

        # Yesterday's sales for comparison
        yesterday_sales = Ventas.objects.filter(
            fecha_venta=yesterday
        ).aggregate(
            total_sales=Sum('monto_total_ves')
        )

        # Calculate percentage change
        percentage_vs_yesterday = None
        if yesterday_sales['total_sales'] and yesterday_sales['total_sales'] > 0:
            today_total = today_sales['total_sales'] or Decimal('0')
            yesterday_total = yesterday_sales['total_sales']
            percentage_vs_yesterday = (
                (today_total - yesterday_total) / yesterday_total * 100
            )

        data = {
            'total_sales': today_sales['total_sales'] or Decimal('0'),
            'total_transactions': today_sales['total_transactions'] or 0,
            'total_items_sold': int(today_items['total_items'] or 0),
            'percentage_vs_yesterday': percentage_vs_yesterday,
        }

        serializer = SalesTodaySerializer(data)
        return Response(serializer.data)

    @extend_schema(responses=PendingOrdersSerializer)
    @action(detail=False, methods=['get'], url_path='pending-orders')
    def pending_orders(self, request):
        """
        Get pending orders summary.
        Returns: total_pending, due_today, approaching_deadline
        """
        today = timezone.now().date()
        two_days_from_now = today + timedelta(days=2)

        # Get pending orders based on estado_orden
        pending_orders = OrdenVenta.objects.filter(
            estado_orden__nombre_estado__in=['Pendiente', 'En Proceso']
        )

        total_pending = pending_orders.count()
        due_today = pending_orders.filter(fecha_entrega_solicitada=today).count()
        approaching_deadline = pending_orders.filter(
            fecha_entrega_solicitada__lte=two_days_from_now,
            fecha_entrega_solicitada__gt=today
        ).count()

        data = {
            'total_pending': total_pending,
            'due_today': due_today,
            'approaching_deadline': approaching_deadline,
        }

        serializer = PendingOrdersSerializer(data)
        return Response(serializer.data)

    @extend_schema(responses=StockAlertsSerializer)
    @action(detail=False, methods=['get'], url_path='stock-alerts')
    def stock_alerts(self, request):
        """
        Get stock alerts summary.
        Returns: total_alerts, under_reorder_point, out_of_stock, expired, critical_count
        """
        today = timezone.now().date()

        # Count lots that are out of stock or expired
        out_of_stock_mp = LotesMateriasPrimas.objects.filter(
            stock_actual_lote=0,
            estado=LotesStatus.AGOTADO
        ).count()
        
        out_of_stock_pe = LotesProductosElaborados.objects.filter(
            stock_actual_lote=0,
            estado=LotesStatus.AGOTADO
        ).count()
        
        out_of_stock_pr = LotesProductosReventa.objects.filter(
            stock_actual_lote=0,
            estado=LotesStatus.AGOTADO
        ).count()

        out_of_stock = out_of_stock_mp + out_of_stock_pe + out_of_stock_pr

        # Count expired lots with stock
        expired_mp = LotesMateriasPrimas.objects.filter(
            fecha_caducidad__lt=today,
            stock_actual_lote__gt=0,
            estado=LotesStatus.EXPIRADO
        ).count()
        
        expired_pe = LotesProductosElaborados.objects.filter(
            fecha_caducidad__lt=today,
            stock_actual_lote__gt=0,
            estado=LotesStatus.EXPIRADO
        ).count()
        
        expired_pr = LotesProductosReventa.objects.filter(
            fecha_caducidad__lt=today,
            stock_actual_lote__gt=0,
            estado=LotesStatus.EXPIRADO
        ).count()

        expired = expired_mp + expired_pe + expired_pr

        # Count lots under reorder point (we'll assume a simple threshold)
        under_reorder = 0 

        total_alerts = under_reorder + out_of_stock + expired
        critical_count = out_of_stock + expired

        data = {
            'total_alerts': total_alerts,
            'under_reorder_point': under_reorder,
            'out_of_stock': out_of_stock,
            'expired': expired,
            'critical_count': critical_count,
        }

        serializer = StockAlertsSerializer(data)
        return Response(serializer.data)

    @extend_schema(responses=RecentProductionsSerializer)
    @action(detail=False, methods=['get'], url_path='recent-productions')
    def recent_productions(self, request):
        """
        Get recent productions summary (last 24 hours).
        Returns: total_productions, percentage_vs_previous, total_items_produced
        """
        now = timezone.now()
        last_24h = now - timedelta(hours=24)
        previous_24h = last_24h - timedelta(hours=24)

        # Last 24 hours
        recent_productions = Produccion.objects.filter(
            fecha_produccion__gte=last_24h.date()
        ).aggregate(
            count=Count('id'),
            total_items=Sum('cantidad_producida')
        )

        # Previous 24 hours for comparison
        previous_productions = Produccion.objects.filter(
            fecha_produccion__gte=previous_24h.date(),
            fecha_produccion__lt=last_24h.date()
        ).aggregate(
            count=Count('id')
        )

        # Calculate percentage change
        percentage_vs_previous = None
        if previous_productions['count'] and previous_productions['count'] > 0:
            current_count = recent_productions['count'] or 0
            previous_count = previous_productions['count']
            percentage_vs_previous = (
                (current_count - previous_count) / previous_count * 100
            )

        data = {
            'total_productions': recent_productions['count'] or 0,
            'percentage_vs_previous': percentage_vs_previous,
            'total_items_produced': int(recent_productions['total_items'] or 0),
        }

        serializer = RecentProductionsSerializer(data)
        return Response(serializer.data)

    @extend_schema(responses=SalesTrendDataSerializer)
    @action(detail=False, methods=['get'], url_path='sales-trends')
    def sales_trends(self, request):
        """
        Get sales trends for last 7 days.
        Returns: array of {date, total_sales}
        """
        today = timezone.now().date()
        seven_days_ago = today - timedelta(days=6)  # Including today = 7 days

        # Get sales grouped by date
        sales_by_date = Ventas.objects.filter(
            fecha_venta__gte=seven_days_ago,
            fecha_venta__lte=today
        ).values('fecha_venta').annotate(
            total_sales=Sum('monto_total_ves')
        ).order_by('fecha_venta')

        # Create a complete date range (fill missing dates with 0)
        date_range = [seven_days_ago + timedelta(days=i) for i in range(7)]
        sales_dict = {
            item['fecha_venta']: item['total_sales']
            for item in sales_by_date
        }

        trend_data = [
            {
                'date': date,
                'total_sales': sales_dict.get(date, Decimal('0'))
            }
            for date in date_range
        ]

        data = {'data': trend_data}
        serializer = SalesTrendDataSerializer(data)
        return Response(serializer.data)

    @extend_schema(responses=TopProductsDataSerializer)
    @action(detail=False, methods=['get'], url_path='top-products')
    def top_products(self, request):
        """
        Get top 10 most sold products (resale + finals).
        Returns: array of {product_name, quantity_sold, product_type}
        """
        # Get top resale products
        top_resale = DetalleVenta.objects.filter(
            producto_reventa__isnull=False
        ).values(
            'producto_reventa__producto_reventa__nombre_producto'
        ).annotate(
            quantity_sold=Sum('cantidad_vendida')
        ).order_by('-quantity_sold')[:10]

        # Get top final products
        top_final = DetalleVenta.objects.filter(
            producto_elaborado__isnull=False
        ).values(
            'producto_elaborado__producto_elaborado__nombre_producto'
        ).annotate(
            quantity_sold=Sum('cantidad_vendida')
        ).order_by('-quantity_sold')[:10]

        # Combine and format
        products = []
        
        for item in top_resale:
            products.append({
                'product_name': item['producto_reventa__producto_reventa__nombre_producto'],
                'quantity_sold': int(item['quantity_sold']),
                'product_type': 'resale'
            })
        
        for item in top_final:
            products.append({
                'product_name': item['producto_elaborado__producto_elaborado__nombre_producto'],
                'quantity_sold': int(item['quantity_sold']),
                'product_type': 'final'
            })

        # Sort by quantity and take top 10
        products.sort(key=lambda x: x['quantity_sold'], reverse=True)
        products = products[:10]

        data = {'data': products}
        serializer = TopProductsDataSerializer(data)
        return Response(serializer.data)

    @extend_schema(responses=RecentPurchasesSerializer)
    @action(detail=False, methods=['get'], url_path='recent-purchases')
    def recent_purchases(self, request):
        """
        Get last 10 purchase orders.
        Returns: array of purchase order details
        """
        recent_purchases = OrdenesCompra.objects.select_related(
            'proveedor', 'estado_oc'
        ).order_by('-fecha_emision_oc')[:10]

        purchases_data = [
            {
                'id': order.id,
                'order_number': f"OC-{order.id}",
                'supplier_name': order.proveedor.nombre_proveedor if order.proveedor else 'N/A',
                'order_date': order.fecha_emision_oc,
                'status': order.estado_oc.nombre_estado if order.estado_oc else 'N/A',
                'total_amount': order.monto_total_oc_ves or Decimal('0'),
            }
            for order in recent_purchases
        ]

        data = {'data': purchases_data}
        serializer = RecentPurchasesSerializer(data)
        return Response(serializer.data)

    @extend_schema(responses=RecentSalesSerializer)
    @action(detail=False, methods=['get'], url_path='recent-sales')
    def recent_sales(self, request):
        """
        Get last 10 sales from Ventas model.
        Returns: array of sale details
        """
        recent_sales = Ventas.objects.select_related(
            'cliente'
        ).prefetch_related(
            'pagos_set',
            'pagos_set__metodo_pago'
        ).order_by('-fecha_venta', '-id')[:10]

        sales_data = [
            {
                'id': sale.id,
                'sale_number': f"V-{sale.id}",
                'customer_name': sale.cliente.nombre_cliente if sale.cliente else None,
                'sale_datetime': timezone.datetime.combine(sale.fecha_venta, timezone.datetime.min.time()),
                'payment_method': self._get_payment_method_display(sale),
                'total_amount': sale.monto_total_ves or Decimal('0'),
            }
            for sale in recent_sales
        ]

        data = {'data': sales_data}
        serializer = RecentSalesSerializer(data)
        return Response(serializer.data)

    def _get_payment_method_display(self, sale):
        """
        Helper to determine primary payment method for a sale.
        """
        pagos = sale.pagos_set.all()
        if not pagos:
            return 'pendiente'
            
        methods = {p.metodo_pago.nombre_metodo.lower() for p in pagos}
        
        if len(methods) > 1:
            return 'mixto'
            
        method = list(methods)[0]
        
        # Normalize method names
        if 'efectivo' in method:
            return 'efectivo'
        elif 'pago m' in method or 'movil' in method or 'móvil' in method:
            return 'pago_movil'
        elif 'punto' in method or 'tarjeta' in method or 'debito' in method or 'débito' in method or 'credito' in method or 'crédito' in method:
            return 'tarjeta'
        elif 'transf' in method or 'zelle' in method:
            return 'transferencia'
            
        return method
