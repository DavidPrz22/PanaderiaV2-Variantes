from django.core.cache import cache
from django.utils import timezone
from django.db import transaction
from apps.inventario.models import LotesMateriasPrimas, LotesProductosElaborados, LotesProductosReventa, LotesStatus
from apps.inventario.models import MateriasPrimas, ProductosElaborados, ProductosReventa

class ExpirarLotesService:
    def __init__(self):
        pass

    @classmethod
    def expirar_lotes_productos_reventa(cls, hoy=None):
        if not hoy:
            hoy = timezone.now().date()
        
        expired_lots = LotesProductosReventa.objects.filter(
            fecha_caducidad__lte=hoy,
            estado=LotesStatus.DISPONIBLE,
        ).select_related('producto_reventa_variante__producto_reventa')

        resumen = []
        for lote in expired_lots:
            if lote.stock_actual_lote > 0:
                resumen.append({
                    'lote_id': lote.id,
                    'tipo': 'Producto Reventa',
                    'componente': lote.producto_reventa_variante.producto_reventa.nombre_producto,
                    'variante': lote.producto_reventa_variante.nombre_variante,
                    'fecha_caducidad': lote.fecha_caducidad,
                    'stock_expirado': lote.stock_actual_lote
                })

        affected_ids = list(expired_lots.values_list('producto_reventa_variante__producto_reventa_id', flat=True).distinct())
        
        with transaction.atomic():
            count = expired_lots.update(estado=LotesStatus.EXPIRADO)
            for pr_id in affected_ids:
                pr = ProductosReventa.objects.get(id=pr_id)
                pr.actualizar_product_stock()
                
        return {"resumen": resumen, "count": count, "afectados_count": len(affected_ids)}

    @classmethod
    def expirar_lotes_productos_elaborados(cls, hoy=None):
        if not hoy:
            hoy = timezone.now().date()
            
        expired_lots = LotesProductosElaborados.objects.filter(
            fecha_caducidad__lte=hoy,
            estado=LotesStatus.DISPONIBLE,
        ).select_related('producto_elaborado_variante__producto_elaborado')

        resumen = []
        for lote in expired_lots:
            if lote.stock_actual_lote > 0:
                resumen.append({
                    'lote_id': lote.id,
                    'tipo': 'Producto Elaborado',
                    'componente': lote.producto_elaborado_variante.producto_elaborado.nombre_producto,
                    'variante': lote.producto_elaborado_variante.nombre_variante,
                    'fecha_caducidad': lote.fecha_caducidad,
                    'stock_expirado': lote.stock_actual_lote
                })

        affected_ids = list(expired_lots.values_list('producto_elaborado_variante__producto_elaborado_id', flat=True).distinct())

        with transaction.atomic():
            count = expired_lots.update(estado=LotesStatus.EXPIRADO)
            for pe_id in affected_ids:
                pe = ProductosElaborados.objects.get(id=pe_id)
                pe.actualizar_product_stock()

        return {"resumen": resumen, "count": count, "afectados_count": len(affected_ids)}

    @classmethod
    def expirar_lotes_materias_primas(cls, hoy=None):
        if not hoy:
            hoy = timezone.now().date()
            
        queryset = LotesMateriasPrimas.objects.filter(
            fecha_caducidad__lte=hoy,
            estado=LotesStatus.DISPONIBLE,
        )
        
        expired_lots = queryset.select_related('variante_materia_prima__materia_prima')

        resumen = []
        for lote in expired_lots:
            if lote.stock_actual_lote > 0:
                resumen.append({
                    'lote_id': lote.id,
                    'tipo': 'Materia Prima',
                    'componente': lote.variante_materia_prima.materia_prima.nombre if lote.variante_materia_prima else "Desconocido",
                    'variante': lote.variante_materia_prima.nombre_variante if lote.variante_materia_prima else "Desconocido",
                    'fecha_caducidad': lote.fecha_caducidad,
                    'stock_expirado': lote.stock_actual_lote
                })

        affected_ids = list(expired_lots.exclude(variante_materia_prima=None).values_list('variante_materia_prima__materia_prima_id', flat=True).distinct())

        with transaction.atomic():
            count = expired_lots.update(estado=LotesStatus.EXPIRADO)
            for mp_id in affected_ids:
                mp = MateriasPrimas.objects.get(id=mp_id)
                mp.actualizar_stock()

        return {"resumen": resumen, "count": count, "afectados_count": len(affected_ids)}

    @classmethod
    def expire_lots_materia_prima(cls, materia_prima_id, hoy=None):
        if not hoy:
            hoy = timezone.now().date()
            
        expired_lots = LotesMateriasPrimas.objects.filter(
            fecha_caducidad__lte=hoy,
            variante_materia_prima__materia_prima_id=materia_prima_id,
            estado=LotesStatus.DISPONIBLE,
        ).select_related('variante_materia_prima__materia_prima')

        resumen = []
        for lote in expired_lots:
            if lote.stock_actual_lote > 0:
                resumen.append({
                    'lote_id': lote.id,
                    'tipo': 'Materia Prima',
                    'componente': lote.variante_materia_prima.materia_prima.nombre if lote.variante_materia_prima else "Desconocido",
                    'variante': lote.variante_materia_prima.nombre_variante if lote.variante_materia_prima else "Desconocido",
                    'fecha_caducidad': lote.fecha_caducidad,
                    'stock_expirado': lote.stock_actual_lote
                })

        affected_ids = list(expired_lots.exclude(variante_materia_prima=None).values_list('variante_materia_prima__materia_prima_id', flat=True).distinct())

        with transaction.atomic():
            count = expired_lots.update(estado=LotesStatus.EXPIRADO)
            for mp_id in affected_ids:
                mp = MateriasPrimas.objects.get(id=mp_id)
                mp.actualizar_stock()

        return {"resumen": resumen, "count": count, "afectados_count": len(affected_ids)}

    @classmethod
    def expire_lots_producto_elaborado(cls, producto_id, hoy=None):
        if not hoy:
            hoy = timezone.now().date()
            
        expired_lots = LotesProductosElaborados.objects.filter(
            fecha_caducidad__lte=hoy,
            producto_elaborado_variante__producto_elaborado_id=producto_id,
            estado=LotesStatus.DISPONIBLE,
        ).select_related('producto_elaborado_variante__producto_elaborado')

        resumen = []
        for lote in expired_lots:
            if lote.stock_actual_lote > 0:
                resumen.append({
                    'lote_id': lote.id,
                    'tipo': 'Producto Elaborado',
                    'componente': lote.producto_elaborado_variante.producto_elaborado.nombre_producto,
                    'variante': lote.producto_elaborado_variante.nombre_variante,
                    'fecha_caducidad': lote.fecha_caducidad,
                    'stock_expirado': lote.stock_actual_lote
                })

        affected_ids = list(expired_lots.values_list('producto_elaborado_variante__producto_elaborado_id', flat=True).distinct())

        with transaction.atomic():
            count = expired_lots.update(estado=LotesStatus.EXPIRADO)
            for pe_id in affected_ids:
                pe = ProductosElaborados.objects.get(id=pe_id)
                pe.actualizar_product_stock()

        return {"resumen": resumen, "count": count, "afectados_count": len(affected_ids)}

    @classmethod
    def expire_lots_producto_reventa(cls, producto_id, hoy=None):
        if not hoy:
            hoy = timezone.now().date()
            
        expired_lots = LotesProductosReventa.objects.filter(
            fecha_caducidad__lte=hoy,
            producto_reventa_variante__producto_reventa_id=producto_id,
            estado=LotesStatus.DISPONIBLE,
        ).select_related('producto_reventa_variante__producto_reventa')

        resumen = []
        for lote in expired_lots:
            if lote.stock_actual_lote > 0:
                resumen.append({
                    'lote_id': lote.id,
                    'tipo': 'Producto Reventa',
                    'componente': lote.producto_reventa_variante.producto_reventa.nombre_producto,
                    'variante': lote.producto_reventa_variante.nombre_variante,
                    'fecha_caducidad': lote.fecha_caducidad,
                    'stock_expirado': lote.stock_actual_lote
                })

        affected_ids = list(expired_lots.values_list('producto_reventa_variante__producto_reventa_id', flat=True).distinct())

        with transaction.atomic():
            count = expired_lots.update(estado=LotesStatus.EXPIRADO)
            for pr_id in affected_ids:
                pr = ProductosReventa.objects.get(id=pr_id)
                pr.actualizar_product_stock()

        return {"resumen": resumen, "count": count, "afectados_count": len(affected_ids)}

    @classmethod
    def expirar_todos_lotes_viejos(cls, force=False):
        hoy = timezone.now().date()
        cache_key = f"expirar_todos_lotes_viejos_{hoy}"

        try:
            if not force and cache.get(cache_key):
                return {"resumen": [], "count": 0, "cached": True}

            cache.set(cache_key, True, 86400)  # Cache for 24 hours
        except Exception:
            # Fallback if cache table doesn't exist
            pass

        res_mp = cls.expirar_lotes_materias_primas(hoy)
        res_pe = cls.expirar_lotes_productos_elaborados(hoy)
        res_pr = cls.expirar_lotes_productos_reventa(hoy)

        return {
            "resumen": res_mp["resumen"] + res_pe["resumen"] + res_pr["resumen"],
            "count": res_mp["count"] + res_pe["count"] + res_pr["count"],
            "materias_primas_afectadas": res_mp["afectados_count"],
            "productos_elaborados_afectados": res_pe["afectados_count"],
            "productos_reventa_afectados": res_pr["afectados_count"]
        }
