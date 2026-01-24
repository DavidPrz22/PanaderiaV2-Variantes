from django.core.management.base import BaseCommand
from django.core.management import call_command
import os
from django.conf import settings

class Command(BaseCommand):
    help = 'Exports data from current database to a fixture file (data_backup.json).'

    def handle(self, *args, **options):
        if getattr(settings, 'USE_SQLITE', False):
            self.stdout.write(self.style.WARNING('Warning: You are currently connected to SQLite. This will export the SQLite data.'))
        else:
            self.stdout.write('Connected to PostgreSQL. Exporting data...')
        
        output_file = 'data_backup.json'
        self.stdout.write(f'Exporting data to {output_file}...')
        
        try:
            with open(output_file, 'w') as f:
                call_command(
                    'dumpdata', 
                    exclude=['auth.permission', 'contenttypes', 'sessions', 'admin.logentry'], 
                    natural_foreign=True, 
                    natural_primary=True, 
                    indent=2, 
                    stdout=f
                )
            self.stdout.write(self.style.SUCCESS(f'Successfully exported data to {output_file}'))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f'Error exporting data: {str(e)}'))
