from django.core.management.base import BaseCommand
from django.db import transaction
from apps.inventario.models import MateriasPrimas, ProductosReventa, ProductosElaborados

class Command(BaseCommand):
    help = 'Recalculates and updates the stock_actual field for all inventory items.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Starting inventory stock update...'))
        
        # Update MateriasPrimas
        mps = MateriasPrimas.objects.all()
        mp_count = mps.count()
        self.stdout.write(f'Updating {mp_count} Materias Primas...')
        with transaction.atomic():
            for mp in mps:
                mp.actualizar_stock()
        self.stdout.write(self.style.SUCCESS(f'Successfully updated {mp_count} Materias Primas.'))

        # Update Productos Reventa
        prs = ProductosReventa.objects.all()
        pr_count = prs.count()
        self.stdout.write(f'Updating {pr_count} Productos de Reventa...')
        with transaction.atomic():
            for pr in prs:
                pr.actualizar_product_stock()
        self.stdout.write(self.style.SUCCESS(f'Successfully updated {pr_count} Productos de Reventa.'))

        # Update Productos Elaborados
        pes = ProductosElaborados.objects.all()
        pe_count = pes.count()
        self.stdout.write(f'Updating {pe_count} Productos Elaborados...')
        with transaction.atomic():
            for pe in pes:
                pe.actualizar_product_stock()
        self.stdout.write(self.style.SUCCESS(f'Successfully updated {pe_count} Productos Elaborados.'))

        self.stdout.write(self.style.SUCCESS('--- All stock values have been synchronized ---'))
