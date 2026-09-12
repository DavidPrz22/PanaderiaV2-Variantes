from rest_framework import viewsets, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Sum, Q, F
from django.utils import timezone
from datetime import datetime
from django.http import HttpResponse
from decimal import Decimal

# ReportLab imports
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.colors import HexColor
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

from apps.inventario.models import (
    MateriasPrimas, 
    ProductosElaborados, 
    ProductosReventa,
    LotesMateriasPrimas,
    LotesProductosElaborados,
    LotesProductosReventa,
    LotesStatus
)
from apps.ventas.models import AperturaCierreCaja, Ventas, DetalleVenta
from .serializers import (
    InventoryItemSerializer,
    SessionReportSerializer,
    SessionDetailSerializer,
    ItemVendidoSerializer
)
from djangobackend.permissions import IsAllUsersCRUD
from drf_spectacular.utils import extend_schema, OpenApiTypes, inline_serializer, OpenApiParameter

class InventoryReportViewSet(viewsets.ViewSet):
    """ViewSet for inventory reports"""
    permission_classes = [IsAllUsersCRUD]
    
    @extend_schema(request=None, responses=InventoryItemSerializer(many=True))
    @action(detail=False, methods=['get'], url_path='materias-primas')
    def materias_primas(self, request):
        """Get inventory report for raw materials"""
        items = MateriasPrimas.objects.all()
        data = []
        
        for item in items:
            # Count available lots
            lotes_count = LotesMateriasPrimas.objects.filter(
                materia_prima=item,
                estado=LotesStatus.DISPONIBLE,
                fecha_caducidad__gt=timezone.now().date()
            ).count()
            
            # Determine status
            if item.stock_actual <= item.punto_reorden * Decimal('0.5'):
                estado = 'critico'
            elif item.stock_actual <= item.punto_reorden:
                estado = 'bajo'
            else:
                estado = 'ok'
            
            data.append({
                'id': item.id,
                'nombre': item.nombre,
                'unidad_medida': item.unidad_medida_base.nombre_completo,
                'stock_actual': item.stock_actual,
                'punto_reorden': item.punto_reorden,
                'lotes_disponibles': lotes_count,
                'precio_venta_usd': None,
                'fecha_ultima_actualizacion': item.fecha_ultima_actualizacion,
                'categoria': item.categoria.nombre_categoria,
                'estado': estado
            })
        
        serializer = InventoryItemSerializer(data, many=True)
        return Response(serializer.data)
    
    @extend_schema(request=None, responses=InventoryItemSerializer(many=True))
    @action(detail=False, methods=['get'], url_path='productos-finales')
    def productos_finales(self, request):
        """Get inventory report for finished products"""
        items = ProductosElaborados.objects.filter(es_intermediario=False)
        data = []
        
        for item in items:
            # Count available lots
            lotes_count = LotesProductosElaborados.objects.filter(
                producto_elaborado=item,
                estado=LotesStatus.DISPONIBLE,
                fecha_caducidad__gt=timezone.now().date()
            ).count()
            
            # Determine status
            if item.stock_actual <= item.punto_reorden * Decimal('0.5'):
                estado = 'critico'
            elif item.stock_actual <= item.punto_reorden:
                estado = 'bajo'
            else:
                estado = 'ok'
            
            data.append({
                'id': item.id,
                'nombre': item.nombre_producto,
                'unidad_medida': item.unidad_venta.nombre_completo if item.unidad_venta else 'N/A',
                'stock_actual': item.stock_actual,
                'punto_reorden': item.punto_reorden,
                'lotes_disponibles': lotes_count,
                'precio_venta_usd': item.precio_venta_usd,
                'fecha_ultima_actualizacion': item.fecha_modificacion_registro,
                'categoria': item.categoria.nombre_categoria,
                'estado': estado
            })
        
        serializer = InventoryItemSerializer(data, many=True)
        return Response(serializer.data)
    
    @extend_schema(request=None, responses=InventoryItemSerializer(many=True))
    @action(detail=False, methods=['get'], url_path='productos-intermedios')
    def productos_intermedios(self, request):
        """Get inventory report for intermediate products"""
        items = ProductosElaborados.objects.filter(es_intermediario=True)
        data = []
        
        for item in items:
            # Count available lots
            lotes_count = LotesProductosElaborados.objects.filter(
                producto_elaborado=item,
                estado=LotesStatus.DISPONIBLE,
                fecha_caducidad__gt=timezone.now().date()
            ).count()
            
            # Determine status
            if item.stock_actual <= item.punto_reorden * Decimal('0.5'):
                estado = 'critico'
            elif item.stock_actual <= item.punto_reorden:
                estado = 'bajo'
            else:
                estado = 'ok'
            
            data.append({
                'id': item.id,
                'nombre': item.nombre_producto,
                'unidad_medida': item.unidad_produccion.nombre_completo if item.unidad_produccion else 'N/A',
                'stock_actual': item.stock_actual,
                'punto_reorden': item.punto_reorden,
                'lotes_disponibles': lotes_count,
                'precio_venta_usd': None,
                'fecha_ultima_actualizacion': item.fecha_modificacion_registro,
                'categoria': item.categoria.nombre_categoria,
                'estado': estado
            })
        
        serializer = InventoryItemSerializer(data, many=True)
        return Response(serializer.data)
    
    @extend_schema(request=None, responses=InventoryItemSerializer(many=True))
    @action(detail=False, methods=['get'], url_path='productos-reventa')
    def productos_reventa(self, request):
        """Get inventory report for resale products"""
        items = ProductosReventa.objects.all()
        data = []
        
        for item in items:
            # Count available lots
            lotes_count = LotesProductosReventa.objects.filter(
                producto_reventa=item,
                estado=LotesStatus.DISPONIBLE,
                fecha_caducidad__gt=timezone.now().date()
            ).count()
            
            # Determine status
            punto_reorden = item.punto_reorden or 0
            if item.stock_actual <= punto_reorden * Decimal('0.5'):
                estado = 'critico'
            elif item.stock_actual <= punto_reorden:
                estado = 'bajo'
            else:
                estado = 'ok'
            
            data.append({
                'id': item.id,
                'nombre': item.nombre_producto,
                'unidad_medida': item.unidad_venta.nombre_completo if item.unidad_venta else 'N/A',
                'stock_actual': item.stock_actual,
                'punto_reorden': punto_reorden,
                'lotes_disponibles': lotes_count,
                'precio_venta_usd': item.precio_venta_usd,
                'fecha_ultima_actualizacion': item.fecha_modificacion_registro,
                'categoria': item.categoria.nombre_categoria,
                'estado': estado
            })
        
        serializer = InventoryItemSerializer(data, many=True)
        return Response(serializer.data)

    @extend_schema(
        request=None,
        responses={
            200: inline_serializer(
                name='InventoryResumenResponse',
                fields={
                    'materias_primas': serializers.IntegerField(),
                    'productos_finales': serializers.IntegerField(),
                    'productos_intermedios': serializers.IntegerField(),
                    'productos_reventa': serializers.IntegerField(),
                }
            )
        }
    )
    @action(detail=False, methods=['get'])
    def resumen(self, request):
        """Get counts for all inventory types"""
        counts = {
            'materias_primas': MateriasPrimas.objects.count(),
            'productos_finales': ProductosElaborados.objects.filter(es_intermediario=False).count(),
            'productos_intermedios': ProductosElaborados.objects.filter(es_intermediario=True).count(),
            'productos_reventa': ProductosReventa.objects.count(),
        }
        return Response(counts)

    @extend_schema(
        request=None,
        parameters=[
            OpenApiParameter(name='type', description='Tipo de reporte (materias-primas, productos-finales, productos-intermedios, productos-reventa)', required=False, type=str)
        ],
        responses={
            200: OpenApiTypes.BINARY,
            400: inline_serializer(
                name='PDFErrorResponse',
                fields={'error': serializers.CharField()}
            )
        }
    )
    @action(detail=False, methods=['get'], url_path='pdf')
    def pdf(self, request):
        """Generate PDF report for inventory"""
        report_type = request.query_params.get('type', 'materias-primas')
        
        # Determine items and title based on report_type
        if report_type == 'materias-primas':
            items_qs = MateriasPrimas.objects.all()
            title = "Reporte de Inventario - Materias Primas"
            show_price = False
            get_name = lambda x: x.nombre
            get_unit = lambda x: x.unidad_medida_base.nombre_completo
            get_mod_date = lambda x: x.fecha_ultima_actualizacion
            get_lots_count = lambda x: LotesMateriasPrimas.objects.filter(
                materia_prima=x, estado=LotesStatus.DISPONIBLE, fecha_caducidad__gt=timezone.now().date()
            ).count()
        elif report_type == 'productos-finales':
            items_qs = ProductosElaborados.objects.filter(es_intermediario=False)
            title = "Reporte de Inventario - Productos Finales"
            show_price = True
            get_name = lambda x: x.nombre_producto
            get_unit = lambda x: x.unidad_venta.nombre_completo if x.unidad_venta else 'N/A'
            get_mod_date = lambda x: x.fecha_modificacion_registro
            get_lots_count = lambda x: LotesProductosElaborados.objects.filter(
                producto_elaborado=x, estado=LotesStatus.DISPONIBLE, fecha_caducidad__gt=timezone.now().date()
            ).count()
        elif report_type == 'productos-intermedios':
            items_qs = ProductosElaborados.objects.filter(es_intermediario=True)
            title = "Reporte de Inventario - Productos Intermedios"
            show_price = False
            get_name = lambda x: x.nombre_producto
            get_unit = lambda x: x.unidad_produccion.nombre_completo if x.unidad_produccion else 'N/A'
            get_mod_date = lambda x: x.fecha_modificacion_registro
            get_lots_count = lambda x: LotesProductosElaborados.objects.filter(
                producto_elaborado=x, estado=LotesStatus.DISPONIBLE, fecha_caducidad__gt=timezone.now().date()
            ).count()
        elif report_type == 'productos-reventa':
            items_qs = ProductosReventa.objects.all()
            title = "Reporte de Inventario - Productos de Reventa"
            show_price = True
            get_name = lambda x: x.nombre_producto
            get_unit = lambda x: x.unidad_venta.nombre_completo if x.unidad_venta else 'N/A'
            get_mod_date = lambda x: x.fecha_modificacion_registro
            get_lots_count = lambda x: LotesProductosReventa.objects.filter(
                producto_reventa=x, estado=LotesStatus.DISPONIBLE, fecha_caducidad__gt=timezone.now().date()
            ).count()
        else:
            return Response({'error': 'Tipo de reporte no válido'}, status=status.HTTP_400_BAD_REQUEST)

        # Create PDF response
        response = HttpResponse(content_type='application/pdf')
        filename = f"reporte_{report_type}_{timezone.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        # Setup PDF
        doc = SimpleDocTemplate(response, pagesize=letter)
        elements = []
        # Custom styles
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle', 
            parent=styles['Heading1'], 
            fontSize=22, 
            textColor=HexColor('#2c3e50'),
            alignment=1, # Center
            spaceAfter=20,
            fontName='Helvetica-Bold'
        )
        
        subtitle_style = ParagraphStyle(
            'Subtitle',
            parent=styles['Normal'],
            fontSize=10,
            textColor=HexColor('#7f8c8d'),
            alignment=1, # Center
            spaceAfter=30,
        )

        elements.append(Paragraph(title, title_style))
        elements.append(Paragraph(f"Generado el: {timezone.now().strftime('%d/%m/%Y a las %H:%M')}", subtitle_style))
        
        # Table content
        headers = ['Producto', 'Unidad', 'Stock', 'Mínimo', 'Lotes']
        if show_price:
            headers.append('Precio (USD)')
        
        data = [headers]
        for item in items_qs:
            punto_reorden = item.punto_reorden if hasattr(item, 'punto_reorden') else 0
            row = [
                get_name(item),
                get_unit(item),
                f"{item.stock_actual:.2f}",
                f"{punto_reorden:.2f}" if punto_reorden is not None else "0.00",
                str(get_lots_count(item))
            ]
            if show_price:
                price = getattr(item, 'precio_venta_usd', 0)
                row.append(f"${price:.2f}" if price is not None else "-")
            data.append(row)
            
        # Modern Table Style
        table = Table(data, repeatRows=1)
        table.setStyle(TableStyle([
            # Fonts
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            
            # Alignment
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            
            # Header Style
            ('BACKGROUND', (0, 0), (-1, 0), HexColor('#2c3e50')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('TOPPADDING', (0, 0), (-1, 0), 12),
            
            # Row Style
            ('TEXTCOLOR', (0, 1), (-1, -1), HexColor('#2c3e50')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, HexColor('#f8f9fa')]),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
            ('TOPPADDING', (0, 1), (-1, -1), 8),
            
            # Borders (Horizontal lines only for cleaner look)
            ('LINEBELOW', (0, 0), (-1, 0), 2, HexColor('#34495e')), # Thicker below header
            ('LINEBELOW', (0, 1), (-1, -1), 0.5, HexColor('#bdc3c7')), # Thin below rows
        ]))
        
        elements.append(table)
        doc.build(elements)
        return response


class SalesReportViewSet(viewsets.ViewSet):
    """ViewSet for sales reports"""
    permission_classes = [IsAllUsersCRUD]
    queryset = AperturaCierreCaja.objects.all()
    
    @extend_schema(request=None, responses=SessionReportSerializer(many=True))
    @action(detail=False, methods=['get'], url_path='sesiones')
    def sesiones(self, request):
        """Get list of sales sessions with optional date filtering"""
        queryset = AperturaCierreCaja.objects.all().order_by('-fecha_apertura')
        
        # Date filtering
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if start_date:
            try:
                start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
                queryset = queryset.filter(fecha_apertura__date__gte=start_date_obj)
            except ValueError:
                pass
        
        if end_date:
            try:
                end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()
                queryset = queryset.filter(fecha_apertura__date__lte=end_date_obj)
            except ValueError:
                pass
        
        serializer = SessionReportSerializer(queryset, many=True)
        return Response(serializer.data)

    @extend_schema(
        responses={
            200: inline_serializer(
                    name='SalesResumenResponse',
                    fields={
                        'count': serializers.IntegerField(),
                    }
            )
        }
    )
    @action(detail=False, methods=['get'])
    def resumen(self, request):
        """Get summary count for sales sessions"""
        count = AperturaCierreCaja.objects.count()
        return Response({'count': count})
    
    @extend_schema(
        request=None, 
        responses={
            200: SessionDetailSerializer,
            404: inline_serializer(
                    name='NotFoundResponse',
                    fields={'error': serializers.CharField()}
                ), 
        }
    )
    @action(detail=True, methods=['get'], url_path='detalle')
    def session_detail(self, request, pk=None):
        """Get detailed information for a specific session"""
        try:
            session = AperturaCierreCaja.objects.get(pk=pk)
            serializer = SessionDetailSerializer(session)
            return Response(serializer.data)
        except AperturaCierreCaja.DoesNotExist:
            return Response(
                {'error': 'Sesión no encontrada'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @extend_schema(
        request=None,
        responses={
            200: ItemVendidoSerializer(many=True),
            404: inline_serializer(
                name='ItemVendidoNotFoundResponse',
                fields={'error': serializers.CharField()}
            )
        }
    )
    @action(detail=True, methods=['get'], url_path='items-vendidos')
    def items_vendidos(self, request, pk=None):
        """Get aggregated items sold for a specific session"""
        try:
            session = AperturaCierreCaja.objects.get(pk=pk)
            
            # Get all sale details for this session
            detalles = DetalleVenta.objects.filter(
                venta__apertura_caja=session
            ).select_related('producto_elaborado', 'producto_reventa')
            
            # Aggregate by product
            items_map = {}
            
            for detalle in detalles:
                if detalle.producto_elaborado:
                    key = f"elaborado_{detalle.producto_elaborado.id}"
                    if key not in items_map:
                        items_map[key] = {
                            'producto_id': detalle.producto_elaborado.id,
                            'producto_nombre': detalle.producto_elaborado.nombre_producto,
                            'tipo_producto': 'Producto Elaborado',
                            'cantidad_total': 0,
                            'subtotal_usd': 0,
                            'subtotal_ves': 0
                        }
                    items_map[key]['cantidad_total'] += detalle.cantidad_vendida
                    items_map[key]['subtotal_usd'] += detalle.subtotal_linea_usd
                    items_map[key]['subtotal_ves'] += detalle.subtotal_linea_ves
                
                elif detalle.producto_reventa:
                    key = f"reventa_{detalle.producto_reventa.id}"
                    if key not in items_map:
                        items_map[key] = {
                            'producto_id': detalle.producto_reventa.id,
                            'producto_nombre': detalle.producto_reventa.nombre_producto,
                            'tipo_producto': 'Producto Reventa',
                            'cantidad_total': 0,
                            'subtotal_usd': 0,
                            'subtotal_ves': 0
                        }
                    items_map[key]['cantidad_total'] += detalle.cantidad_vendida
                    items_map[key]['subtotal_usd'] += detalle.subtotal_linea_usd
                    items_map[key]['subtotal_ves'] += detalle.subtotal_linea_ves
            
            serializer = ItemVendidoSerializer(list(items_map.values()), many=True)
            return Response(serializer.data)
            
        except AperturaCierreCaja.DoesNotExist:
            return Response(
                {'error': 'Sesión no encontrada'},
                status=status.HTTP_404_NOT_FOUND
            )

    @extend_schema(
        request=None,
        parameters=[
            OpenApiParameter(name='start_date', description='Fecha de inicio (YYYY-MM-DD)', required=False, type=str),
            OpenApiParameter(name='end_date', description='Fecha de fin (YYYY-MM-DD)', required=False, type=str)
        ],
        responses={
            200: OpenApiTypes.BINARY
        }
    )
    @action(detail=False, methods=['get'], url_path='pdf')
    def pdf(self, request):
        """Generate PDF report for sales"""
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        # Filter data
        queryset = AperturaCierreCaja.objects.all().order_by('-fecha_apertura')
        
        title_date_range = "Todas las sesiones"
        
        if start_date:
            try:
                start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
                queryset = queryset.filter(fecha_apertura__date__gte=start_date_obj)
                title_date_range = f"Desde: {start_date}"
            except ValueError:
                pass
        
        if end_date:
            try:
                end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()
                queryset = queryset.filter(fecha_apertura__date__lte=end_date_obj)
                title_date_range += f" Hasta: {end_date}"
            except ValueError:
                pass
                
        # Create PDF response
        response = HttpResponse(content_type='application/pdf')
        filename = f"reporte_ventas_{timezone.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        # Setup PDF
        doc = SimpleDocTemplate(response, pagesize=letter)
        elements = []
        styles = getSampleStyleSheet()
        
        # Title
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=HexColor('#2c3e50'),
            alignment=1, # Center
            spaceAfter=10,
            fontName='Helvetica-Bold'
        )
        
        subtitle_style = ParagraphStyle(
            'Subtitle',
            parent=styles['Normal'],
            fontSize=11,
            textColor=HexColor('#7f8c8d'),
            alignment=1, # Center
            spaceAfter=30,
        )

        elements.append(Paragraph("Reporte de Ventas", title_style))
        elements.append(Paragraph(f"{title_date_range}", subtitle_style))
        
        # Summary Section
        summary_style = ParagraphStyle(
            'Summary',
            parent=styles['Normal'],
            fontSize=12,
            textColor=HexColor('#2c3e50'),
            spaceAfter=6,
            leftIndent=20
        )
        
        total_ventas = queryset.aggregate(
            total=Sum('total_ventas_usd')
        )['total'] or 0
        
        total_transacciones = Ventas.objects.filter(
            apertura_caja__in=queryset
        ).count()
        
        elements.append(Paragraph("<b>Resumen General:</b>", summary_style))
        elements.append(Paragraph(f"Total Ventas (USD): <b>${total_ventas:.2f}</b>", summary_style))
        elements.append(Paragraph(f"Total Transacciones: <b>{total_transacciones}</b>", summary_style))
        elements.append(Spacer(1, 25))
        
        # Table of sessions
        data = [['Fecha', 'Cajero', 'Efectivo', 'Tarjeta', 'Total']]
        
        for session in queryset:
            cajero_name = session.usuario_apertura.get_full_name() if session.usuario_apertura else "N/A"
            row = [
                session.fecha_apertura.strftime('%d/%m/%Y'),
                cajero_name,
                f"${session.total_efectivo_usd:.2f}",
                f"${session.total_tarjeta_usd:.2f}",
                f"${session.total_ventas_usd:.2f}"
            ]
            data.append(row)
            
        table = Table(data, repeatRows=1)
        table.setStyle(TableStyle([
            # Fonts
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            
            # Alignment
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            
            # Header Style
            ('BACKGROUND', (0, 0), (-1, 0), HexColor('#2c3e50')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('TOPPADDING', (0, 0), (-1, 0), 12),
            
            # Row Style
            ('TEXTCOLOR', (0, 1), (-1, -1), HexColor('#2c3e50')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, HexColor('#f8f9fa')]),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
            ('TOPPADDING', (0, 1), (-1, -1), 8),
            
            # Borders
            ('LINEBELOW', (0, 0), (-1, 0), 2, HexColor('#34495e')),
            ('LINEBELOW', (0, 1), (-1, -1), 0.5, HexColor('#bdc3c7')),
        ]))
        
        elements.append(table)
        
        doc.build(elements)
        return response
