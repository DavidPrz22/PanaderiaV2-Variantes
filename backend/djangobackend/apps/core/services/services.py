import logging
from datetime import timedelta
from django.utils import timezone
from django.db.models import Model, F

from apps.inventario.models import (
    MateriasPrimas, 
    ProductosFinales,
    ProductosIntermedios,
    ProductosReventa,
    ProductosElaborados,
    ProductosElaboradosVariantes,
    MateriasPrimasVariantes,
    ProductosReventaVariantes,
    LotesMateriasPrimas,
    LotesProductosElaborados,
    LotesProductosReventa,
    LotesStatus
)

from apps.ventas.models import (
    OrdenVenta
)

from apps.core.models import (
    EstadosOrdenVenta, 
    TiposOrdenVenta,
    TiposNotificaciones,
    TiposPrioridades,
    TiposProductosNotificaciones,
    Notificaciones
)

logger = logging.getLogger(__name__)


class NotificationService:
    """
    Service to handle product and order notifications for stock levels,
    expiration dates, and delivery schedules.
    """

    # Alert tier mappings
    ALERT_TIER_DELIVERY = {
        7: TiposPrioridades.MEDIO,
        3: TiposPrioridades.ALTO,
        1: TiposPrioridades.CRITICO,
    }

    ALERT_TIER_LONG = {
        30: TiposPrioridades.BAJO,
        14: TiposPrioridades.MEDIO,
        7: TiposPrioridades.ALTO,
        3: TiposPrioridades.ALTO,
        1: TiposPrioridades.CRITICO,
    }

    ALERT_TIER_SHORT = {
        7: TiposPrioridades.MEDIO,
        3: TiposPrioridades.ALTO,
        1: TiposPrioridades.CRITICO,
    }

    @classmethod
    def get_delivery_thresholds(cls):
        """Get delivery date thresholds (recalculated dynamically)"""
        today = timezone.now().date()
        return {
            7: today + timedelta(days=7),
            3: today + timedelta(days=3),
            1: today + timedelta(days=1),
        }

    @classmethod
    def get_expiration_thresholds(cls):
        """Get expiration date thresholds (recalculated dynamically)"""
        today = timezone.now().date()
        return {
            30: today + timedelta(days=30),
            14: today + timedelta(days=14),
            7: today + timedelta(days=7),
            3: today + timedelta(days=3),
            1: today + timedelta(days=1),
        }

    @staticmethod
    def get_product_name(producto):
        """
        Safely get product name from different product types.
        Handles both 'nombre' and 'nombre_producto' attributes.
        """
        return getattr(producto, 'nombre', None) or getattr(producto, 'nombre_producto', 'Producto')

    @staticmethod
    def get_tipo_producto(producto):
        """Get the product type as a string for notifications"""
        if isinstance(producto, MateriasPrimas):
            return TiposProductosNotificaciones.MATERIA_PRIMA
        elif isinstance(producto, ProductosElaborados):
            return TiposProductosNotificaciones.PRODUCTOS_INTERMEDIOS if producto.es_intermediario else TiposProductosNotificaciones.PRODUCTOS_FINALES
        elif isinstance(producto, ProductosIntermedios):
            return TiposProductosNotificaciones.PRODUCTOS_INTERMEDIOS
        elif isinstance(producto, ProductosFinales):
            return TiposProductosNotificaciones.PRODUCTOS_FINALES
        elif isinstance(producto, ProductosReventa):
            return TiposProductosNotificaciones.PRODUCTOS_REVENTA
        else:
            logger.warning(f"Unknown product type: {type(producto)}")
            return "Producto"

    @classmethod
    def check_low_stock(cls, producto_class):
        """
        Check for products with low stock (below reorder point but not zero).
        
        Args:
            producto_class: The product model class (MateriasPrimas, ProductosFinales, etc.)
        
        Returns:
            dict: Summary of notifications created
        """
        # Validate input is a class, not an instance
        if not isinstance(producto_class, type) or not issubclass(
            producto_class, 
            (MateriasPrimas, ProductosElaborados, ProductosFinales, ProductosIntermedios, ProductosReventa)
        ):
            raise ValueError(
                'El parámetro debe ser una clase de producto válida '
                '(MateriasPrimas, ProductosElaborados, ProductosFinales, ProductosIntermedios, ProductosReventa)'
            )

        try:
            products_data = producto_class.objects.filter(stock_actual__lte=F('punto_reorden'), stock_actual__gt=0)
            productos_low_stock = []

            for producto in products_data:
                    productos_low_stock.append({
                        'producto_id': producto.id,
                        'tipo_producto': cls.get_tipo_producto(producto),
                        'prioridad': TiposPrioridades.ALTO,
                        'descripcion': (
                            f'¡El producto {cls.get_product_name(producto)} se encuentra por debajo '
                            f'del punto de reorden (Stock: {producto.stock_actual}, '
                            f'Punto de reorden: {producto.punto_reorden}) ⚠️!'
                        ),
                    })

            count = cls.create_notification(productos_low_stock, TiposNotificaciones.BAJO_STOCK)
            logger.info(f"Created {count} low stock notifications for {producto_class.__name__}")
            
            return {
                'created': count,
                'productos_afectados': len(productos_low_stock)
            }

        except Exception as e:
            logger.error(f"Error checking low stock for {producto_class.__name__}: {str(e)}")
            raise

    @classmethod
    def check_sin_stock(cls, producto_class):
        """
        Check for products with zero stock.
        
        Args:
            producto_class: The product model class (MateriasPrimas, ProductosFinales, etc.)
        
        Returns:
            dict: Summary of notifications created
        """
        # Validate input is a class, not an instance
        if not isinstance(producto_class, type) or not issubclass(
            producto_class, 
            (MateriasPrimas, ProductosElaborados, ProductosFinales, ProductosIntermedios, ProductosReventa)
        ):
            raise ValueError(
                'El parámetro debe ser una clase de producto válida '
                '(MateriasPrimas, ProductosElaborados, ProductosFinales, ProductosIntermedios, ProductosReventa)'
            )

        try:
            products_data = producto_class.objects.filter(stock_actual__lte=0)
            productos_sin_stock = []

            for producto in products_data:
                productos_sin_stock.append({
                        'producto_id': producto.id,
                        'tipo_producto': cls.get_tipo_producto(producto),
                        'prioridad': TiposPrioridades.CRITICO,
                        'descripcion': f'¡El producto {cls.get_product_name(producto)} se encuentra sin stock 🚨!',
                    })

            count = cls.create_notification(productos_sin_stock, TiposNotificaciones.SIN_STOCK)
            logger.info(f"Created {count} out-of-stock notifications for {producto_class.__name__}")
            
            return {
                'created': count,
                'productos_afectados': len(productos_sin_stock)
            }

        except Exception as e:
            logger.error(f"Error checking out-of-stock for {producto_class.__name__}: {str(e)}")
            raise

    @classmethod
    def check_expiration_date(cls, producto_class, lote_class):
        """
        Check for lots nearing expiration date.
        
        Args:
            producto_class: The product model class (MateriasPrimas, ProductosElaborados, ProductosReventa)
            lote_class: The lot model class (LotesMateriasPrimas, LotesProductosElaborados, LotesProductosReventa)
        
        Returns:
            dict: Summary of notifications created
        """
        # Validate product class
        if not isinstance(producto_class, type) or not issubclass(
            producto_class, 
            (MateriasPrimas, ProductosElaborados, ProductosReventa)
        ):
            raise ValueError(
                'El parámetro producto debe ser una clase válida '
                '(MateriasPrimas, ProductosElaborados, ProductosReventa)'
            )

        # Validate lot class
        if not isinstance(lote_class, type) or not issubclass(
            lote_class, 
            (LotesMateriasPrimas, LotesProductosElaborados, LotesProductosReventa)
        ):
            raise ValueError(
                'El parámetro lote debe ser una clase válida '
                '(LotesMateriasPrimas, LotesProductosElaborados, LotesProductosReventa)'
            )
        
        try:
            # Get all available lots
            lots_data = lote_class.objects.filter(estado=LotesStatus.DISPONIBLE).select_related()
            
            lots_expiration_date = []
            today = timezone.now().date()
            expiration_thresholds = cls.get_expiration_thresholds()

            for lot in lots_data:
                # Calculate days until expiration
                days_until_expiry = (lot.fecha_caducidad - today).days
                
                # Check if lot is within any threshold
                for days, threshold_date in expiration_thresholds.items():
                    if days_until_expiry == days:
                        # Determine alert tier based on lot type
                        if isinstance(lot, (LotesMateriasPrimas, LotesProductosReventa)):
                            alert_tier = cls.ALERT_TIER_LONG.get(days, TiposPrioridades.MEDIO)
                        else:  # LotesProductosElaborados
                            alert_tier = cls.ALERT_TIER_SHORT.get(days, TiposPrioridades.MEDIO)
                        
                        # Get the product from the lot
                        if isinstance(lot, LotesMateriasPrimas):
                            producto = lot.materia_prima
                        elif isinstance(lot, LotesProductosReventa):
                            producto = lot.producto_reventa
                        else:  # LotesProductosElaborados
                            producto = lot.producto_elaborado
                        
                        lots_expiration_date.append({
                            'tipo_producto': cls.get_tipo_producto(producto),
                            'producto_id': producto.id,
                            'descripcion': (
                                f'¡Lote #{lot.id} de {cls.get_product_name(producto)} '
                                f'EXPIRA en {days} día(s) (Stock: {lot.stock_actual_lote}) ⚠️!'
                            ),
                            'prioridad': alert_tier
                        })
                        break  # Only notify once per lot

            count = cls.create_notification(lots_expiration_date, TiposNotificaciones.EXPIRACION)
            logger.info(f"Created {count} expiration notifications for {lote_class.__name__}")
            
            return {
                'created': count,
                'lotes_afectados': len(lots_expiration_date)
            }

        except Exception as e:
            logger.error(f"Error checking expiration dates for {lote_class.__name__}: {str(e)}")
            raise

    @classmethod
    def check_order_date(cls):
        """
        Check for orders with upcoming delivery dates.
        
        Returns:
            dict: Summary of notifications created
        """
        try:
            estado = EstadosOrdenVenta.objects.filter(nombre_estado=TiposOrdenVenta.EN_PROCESO).first()
            
            if not estado:
                logger.warning(f"Estado '{TiposOrdenVenta.EN_PROCESO}' not found in database")
                return {'created': 0, 'ordenes_afectadas': 0}
            
            ordenes_en_proceso = OrdenVenta.objects.filter(estado_orden=estado).select_related('cliente')
            ordenes_notificar = []
            today = timezone.now().date()
            delivery_thresholds = cls.get_delivery_thresholds()

            for orden in ordenes_en_proceso:
                # Calculate days until delivery
                days_until_delivery = (orden.fecha_entrega - today).days
                
                # Check if order is within any delivery threshold
                for days, threshold_date in delivery_thresholds.items():
                    if days_until_delivery == days:
                        ordenes_notificar.append({
                            'producto_id': orden.id, 
                            'tipo_producto': TiposProductosNotificaciones.ORDENES_VENTA,
                            'descripcion': (
                                f"El pedido #{orden.id} para el cliente {orden.cliente.nombre_cliente} "
                                f"se entregará en {days} día(s) ⏳"
                            ),
                            'prioridad': cls.ALERT_TIER_DELIVERY.get(days, TiposPrioridades.MEDIO)
                        })
                        break  # Only notify once per order
            
            count = cls.create_notification(ordenes_notificar, TiposNotificaciones.ENTREGA_CERCANA)
            logger.info(f"Created {count} delivery notifications")
            
            return {
                'created': count,
                'ordenes_afectadas': len(ordenes_notificar)
            }

        except Exception as e:
            logger.error(f"Error checking order delivery dates: {str(e)}")
            raise

    @classmethod
    def create_notification(cls, elementos, tipo_notificacion):
        """
        Create notifications in bulk, avoiding duplicates.
        
        Args:
            elementos: List of notification data dictionaries
            tipo_notificacion: Type of notification (from TiposNotificaciones)
        
        Returns:
            int: Number of notifications created
        """
        if not elementos:
            return 0

        notification_bucket = []
        
        for elemento in elementos:
            producto_id = elemento.get('producto_id')
            tipo_producto = elemento.get('tipo_producto')
            prioridad = elemento.get('prioridad')
            descripcion = elemento.get('descripcion')
            # Check if unread notification already exists for this product/type
            notificacion_existente = Notificaciones.objects.filter(
                tipo_notificacion=tipo_notificacion,
                tipo_producto=tipo_producto,
                producto_id=producto_id,
                prioridad=prioridad,
                descripcion=descripcion,
                leida=False
            ).first()
            
            should_create = True
            
            if notificacion_existente:
                time_difference = timezone.now() - notificacion_existente.fecha_notificacion
                if time_difference.days >= 1:
                    # If older than 1 day, delete and recreate to refresh timestamp/description
                    notificacion_existente.delete()
                    should_create = True
                else:
                    # If recent, do not create duplicate
                    should_create = False
                
            if should_create:
                notification = Notificaciones(
                    tipo_notificacion=tipo_notificacion,
                    tipo_producto=tipo_producto,
                    producto_id=producto_id,
                    descripcion=descripcion,
                    prioridad=prioridad,
                )
                notification_bucket.append(notification)

        if notification_bucket:
            Notificaciones.objects.bulk_create(notification_bucket, ignore_conflicts=True)
        
        return len(notification_bucket)

    @classmethod
    def check_all_stock_notifications(cls):
        """
        Run all stock-related notification checks (low stock and out of stock).
        
        Returns:
            dict: Summary of all checks performed
        """
        try:
            results = {
                'low_stock': {},
                'out_of_stock': {},
                'total_created': 0
            }
            
            # Check low stock for all product types
            results['low_stock']['materias_primas'] = cls.check_low_stock(MateriasPrimas)
            results['low_stock']['productos_elaborados'] = cls.check_low_stock(ProductosElaboradosVariantes)
            results['low_stock']['productos_reventa'] = cls.check_low_stock(ProductosReventaVariantes)
            
            # Check out of stock for all product types
            results['out_of_stock']['materias_primas'] = cls.check_sin_stock(MateriasPrimas)
            results['out_of_stock']['productos_elaborados'] = cls.check_sin_stock(ProductosElaboradosVariantes)
            results['out_of_stock']['productos_reventa'] = cls.check_sin_stock(ProductosReventaVariantes)
            
            # Calculate total notifications created
            for category in ['low_stock', 'out_of_stock']:
                for product_type, result in results[category].items():
                    results['total_created'] += result.get('created', 0)
            
            logger.info(f"Batch stock check completed. Total notifications created: {results['total_created']}")
            return results
            
        except Exception as e:
            logger.error(f"Error in batch stock notification check: {str(e)}")
            raise

    @classmethod
    def check_all_expiration_notifications(cls):
        """
        Run all expiration-related notification checks.
        
        Returns:
            dict: Summary of all expiration checks performed
        """
        try:
            results = {
                'expirations': {},
                'total_created': 0
            }
            
            # Check expiration dates for all lot types
            results['expirations']['materias_primas'] = cls.check_expiration_date(
                MateriasPrimas, LotesMateriasPrimas
            )
            results['expirations']['productos_elaborados'] = cls.check_expiration_date(
                ProductosElaborados, LotesProductosElaborados
            )
            results['expirations']['productos_reventa'] = cls.check_expiration_date(
                ProductosReventa, LotesProductosReventa
            )
            
            # Calculate total notifications created
            for product_type, result in results['expirations'].items():
                results['total_created'] += result.get('created', 0)
            
            logger.info(f"Batch expiration check completed. Total notifications created: {results['total_created']}")
            return results
            
        except Exception as e:
            logger.error(f"Error in batch expiration notification check: {str(e)}")
            raise

    @classmethod
    def check_all_notifications_after_expiration(cls, force=False):
        """
        Comprehensive check after lot expiration operations.
        Runs all stock and expiration checks - perfect for calling after expirar_todos_lotes_viejos().
        
        Returns:
            dict: Summary of all checks performed
            
        """
        from django.core.cache import cache
        try:

            hoy = timezone.now().date()
            cache_key = f"expirar_todos_lotes_viejos_{hoy}"

            if not force and cache.get(cache_key):
                return

            results = {
                'stock_checks': {},
                'expiration_checks': {},
                'total_created': 0
            }
            
            # Run all stock checks
            stock_result = cls.check_all_stock_notifications()
            results['stock_checks'] = stock_result
            results['total_created'] += stock_result.get('total_created', 0)
            
            # Run all expiration checks
            expiration_result = cls.check_all_expiration_notifications()
            results['expiration_checks'] = expiration_result
            results['total_created'] += expiration_result.get('total_created', 0)
            
            logger.info(f"Comprehensive check after expiration completed. Total notifications: {results['total_created']}")
            
            cache.set(cache_key, True, 86400)  # Cache for 24 hours
            
            return results
            
        except Exception as e:
            logger.error(f"Error in comprehensive notification check: {str(e)}")
            raise