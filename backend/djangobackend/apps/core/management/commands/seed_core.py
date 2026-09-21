import json
import os
from django.core.management.base import BaseCommand
from django.core.management import call_command

class Command(BaseCommand):
    help = 'Seeds core models using core_initial_data.json'

    def add_arguments(self, parser):
        parser.add_argument(
            '--file',
            type=str,
            help='Path to the json data file',
            default=None
        )

    def handle(self, *args, **options):
        file_path = options['file']
        if not file_path:
            core_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            file_path = os.path.join(core_dir, 'seed/core_initial_data.json')

        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f'File not found: {file_path}'))
            return

        self.stdout.write(self.style.SUCCESS(f'Loading core data from {file_path}...'))
        try:
            call_command('loaddata', file_path)
            self.stdout.write(self.style.SUCCESS('Successfully seeded core models!'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error loading data: {e}'))
