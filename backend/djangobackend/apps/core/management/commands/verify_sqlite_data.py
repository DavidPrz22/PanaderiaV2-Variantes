from django.core.management.base import BaseCommand
from django.apps import apps
from django.conf import settings

class Command(BaseCommand):
    help = 'Verifies data integrity by counting objects in key models.'

    def handle(self, *args, **options):
        db_name = 'SQLite' if getattr(settings, 'USE_SQLITE', False) else 'PostgreSQL'
        self.stdout.write(f'Verifying data on {db_name}...')
        
        models_to_check = [
            ('users', 'User'),
            ('inventario', 'MateriasPrimas'),
            ('inventario', 'ProductosElaborados'),
            ('produccion', 'Recetas'),
            ('ventas', 'OrdenVenta'),
            ('compras', 'OrdenesCompra'),
        ]
        
        for app_label, model_name in models_to_check:
            try:
                model = apps.get_model(app_label, model_name)
                count = model.objects.count()
                self.stdout.write(f'{model_name}: {count}')
            except LookupError:
                self.stderr.write(f'Model {model_name} in {app_label} not found.')
            except Exception as e:
                self.stderr.write(f'Error checking {model_name}: {str(e)}')
        
        self.stdout.write(self.style.SUCCESS('Verification complete.'))
