from django.core.exceptions import ValidationError
from django.db import transaction
from apps.inventario.models import (
    ProductosIntermedios, ProductosFinales, LotesProductosElaborados, LotesStatus,
    ProductosElaboradosVariantes
    )
from apps.produccion.models import Produccion

class ProductionValidationService:
    @staticmethod
    def validate_production_data(serializer_data):
        """Validate production input data"""
        product_variante_id = serializer_data.get('producto_variante_id')
        cantidad = serializer_data.get('cantidadProduction')
        
        if cantidad <= 0:
            raise ValidationError("La cantidad de producción debe ser mayor a 0")
        
        producto_variante = ProductosElaboradosVariantes.objects.filter(id=product_variante_id).first()

        if not producto_variante:
            raise ValidationError("Producto no encontrado")
            
        return producto_variante

    @staticmethod
    def validate_component_availability(materias_primas, productos_intermedios, mp_map, pi_map):
        """Validate that all components have sufficient stock"""
        unavailable_items = []
        
        for mp in materias_primas:
            cantidad = mp_map[mp.id]
            if not mp.checkAvailability(cantidad):
                unavailable_items.append(f"Materia prima: {mp.nombre}")
        
        for pi in productos_intermedios:
            cantidad = pi_map[pi.id]
            if not pi.checkAvailability(cantidad):
                unavailable_items.append(f"Producto intermedio: {pi.producto_elaborado.nombre_producto}")
        
        if unavailable_items:
            raise ValidationError(f"Stock insuficiente para: {', '.join(unavailable_items)}")


class ProductionService:
    """Main service for handling production operations"""
    
    @staticmethod
    @transaction.atomic
    def create_production_record(producto_variante, cantidad_produccion, fecha_expiracion, user):
        """Create the main production record"""
        producto = producto_variante.producto_elaborado
        unidad_medida = producto.unidad_produccion
        
        return Produccion.objects.create(
            producto_elaborado=producto,
            producto_elaborado_variante=producto_variante,
            cantidad_producida=cantidad_produccion,
            fecha_expiracion=fecha_expiracion,
            usuario_creacion=user,
            costo_total_componentes_divisa=0,
            costo_total_componentes_local=0,
            unidad_medida=unidad_medida
        )
    
    @staticmethod
    def create_product_lot(produccion, producto_variante, cantidad, fecha_expiracion, costo_total_divisa, costo_total_local, peso=None, volumen=None):
        """Create product lot after production"""
        return LotesProductosElaborados.objects.create(
            produccion_origen=produccion,
            producto_elaborado_variante=producto_variante,
            cantidad_inicial_lote=cantidad,
            stock_actual_lote=cantidad,
            fecha_caducidad=fecha_expiracion,
            coste_total_lote_divisa=costo_total_divisa,
            coste_total_lote_local=costo_total_local,
            peso_total_lote_gramos=peso,
            volumen_total_lote_ml=volumen,
            estado=LotesStatus.DISPONIBLE
        )