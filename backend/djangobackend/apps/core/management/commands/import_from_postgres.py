from django.core.management.base import BaseCommand
from django.core.management import call_command
import os
from django.conf import settings

class Command(BaseCommand):
    help = 'Imports data from fixture (data_backup.json) to current database.'

    def handle(self, *args, **options):
        if not getattr(settings, 'USE_SQLITE', False):
             self.stdout.write(self.style.WARNING('WARNING: You are configured to use PostgreSQL. This will Overwrite/Merge data into PostgreSQL!'))
             confirm = input("Are you sure you want to continue? (yes/no): ")
             if confirm.lower() != 'yes':
                 self.stdout.write(self.style.ERROR('Operation cancelled.'))
                 return

        input_file = 'data_backup.json'
        if not os.path.exists(input_file):
            self.stderr.write(self.style.ERROR(f'File {input_file} not found. Run export_to_sqlite first.'))
            return

        self.stdout.write(f'Importing data from {input_file}...')
        try:
            call_command('loaddata', input_file)
            self.stdout.write(self.style.SUCCESS('Successfully imported data.'))
        except Exception as e:
             self.stderr.write(self.style.ERROR(f'Error importing data: {str(e)}'))
