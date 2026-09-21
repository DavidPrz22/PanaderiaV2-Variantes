import os
from decimal import Decimal
from pathlib import Path
import yaml
from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction
from apps.produccion.models import Recetas, RecetasDetalles, RelacionesRecetas
from apps.inventario.models import MateriasPrimas, ProductosElaboradosVariantes


class Command(BaseCommand):
    help = 'Register recipes from YAML BOM file'

    def add_arguments(self, parser):
        parser.add_argument(
            '--yaml-path',
            type=str,
            default='apps/produccion/seed/DataRecetas_BOM.yaml',
            help='Path to the YAML BOM file'
        )

    def handle(self, *args, **options):
        yaml_path = options['yaml_path']

        if not os.path.isabs(yaml_path):
            base_dir = Path(settings.BASE_DIR)
            yaml_path = base_dir / yaml_path

        if not os.path.exists(yaml_path):
            self.stdout.write(self.style.ERROR(f'YAML file not found: {yaml_path}'))
            return

        self.stdout.write(self.style.NOTICE(f'Reading recipes from: {yaml_path}'))

        try:
            with open(yaml_path, 'r', encoding='utf-8') as f:
                data = yaml.safe_load(f)

            recetas_data = data.get('recetas', [])
            self.stdout.write(self.style.NOTICE(f'Found {len(recetas_data)} recipes in YAML'))

            with transaction.atomic():
                created_count = 0
                skipped_count = 0
                recetas_creadas = {}

                for receta_data in recetas_data:
                    sku_receta = receta_data['sku_receta']
                    variante_sku = receta_data['producto_asociado']['variante_vinculada_sku']
                    nombre_receta = receta_data.get('nombre_receta', '')
                    rendimiento = receta_data.get('rendimiento', {}).get('cantidad')
                    notas = receta_data.get('notas', '')

                    try:
                        if Recetas.objects.filter(producto_elaborado_variante__SKU=variante_sku).exists():
                            self.stdout.write(self.style.WARNING(
                                f'Recipe for variant {variante_sku} already exists, skipping'
                            ))
                            skipped_count += 1
                            continue

                        try:
                            variante = ProductosElaboradosVariantes.objects.get(SKU=variante_sku)
                        except ProductosElaboradosVariantes.DoesNotExist:
                            self.stdout.write(self.style.ERROR(
                                f'Variant {variante_sku} not found, skipping recipe {sku_receta}'
                            ))
                            skipped_count += 1
                            continue

                        receta = Recetas.objects.create(
                            nombre=nombre_receta,
                            producto_elaborado_variante=variante,
                            rendimiento=Decimal(str(rendimiento)) if rendimiento else None,
                            notas=notas[:250] if notas else '',
                        )

                        recetas_creadas[sku_receta] = receta

                        componentes = receta_data.get('componentes', [])
                        componentes_count = 0

                        for componente in componentes:
                            tipo = componente['tipo']
                            cantidad = Decimal(str(componente['cantidad']))

                            if tipo == 'MateriaPrima':
                                sku_componente = componente['sku_componente']
                                try:
                                    materia_prima = MateriasPrimas.objects.get(SKU=sku_componente)
                                    RecetasDetalles.objects.create(
                                        receta=receta,
                                        componente_materia_prima=materia_prima,
                                        cantidad=cantidad,
                                    )
                                    componentes_count += 1
                                except MateriasPrimas.DoesNotExist:
                                    self.stdout.write(self.style.WARNING(
                                        f'Materia Prima {sku_componente} not found for recipe {sku_receta}'
                                    ))
                            elif tipo == 'ProductoIntermedio':
                                sku_variante = componente.get('sku_variante_intermedio')
                                if not sku_variante:
                                    self.stdout.write(self.style.WARNING(
                                        f'ProductoIntermedio {componente["sku_componente"]} has no sku_variante_intermedio in recipe {sku_receta}'
                                    ))
                                    continue
                                try:
                                    variante_intermedio = ProductosElaboradosVariantes.objects.get(SKU=sku_variante)
                                    RecetasDetalles.objects.create(
                                        receta=receta,
                                        componente_producto_intermedio=variante_intermedio,
                                        cantidad=cantidad,
                                    )
                                    componentes_count += 1
                                except ProductosElaboradosVariantes.DoesNotExist:
                                    self.stdout.write(self.style.WARNING(
                                        f'Producto Intermedio variant {sku_variante} not found for recipe {sku_receta}'
                                    ))

                        created_count += 1
                        self.stdout.write(self.style.SUCCESS(
                            f'Created recipe {sku_receta} ({variante_sku}) with {componentes_count} components'
                        ))

                    except Exception as e:
                        self.stdout.write(self.style.ERROR(
                            f'Error creating recipe for {sku_receta}: {str(e)}'
                        ))
                        skipped_count += 1
                        continue

                for receta_data in recetas_data:
                    sku_receta = receta_data['sku_receta']
                    recetas_rel = receta_data.get('recetas_relacionadas', [])

                    if not recetas_rel or sku_receta not in recetas_creadas:
                        continue

                    receta_principal = recetas_creadas[sku_receta]

                    for rel in recetas_rel:
                        sub_sku = rel.get('receta_subreceta_sku')
                        sub_variante_sku = rel.get('sku_variante')

                        try:
                            subreceta = Recetas.objects.filter(producto_elaborado_variante__SKU=sub_variante_sku).first()
                            if subreceta:
                                RelacionesRecetas.objects.create(
                                    receta_principal=receta_principal,
                                    subreceta=subreceta,
                                )
                            else:
                                self.stdout.write(self.style.WARNING(
                                    f'Sub-recipe variant {sub_variante_sku} not found for relation in {sku_receta}'
                                ))
                        except Exception as e:
                            self.stdout.write(self.style.WARNING(
                                f'Error creating relation {sku_receta} -> {sub_sku}: {str(e)}'
                            ))

                self.stdout.write(self.style.SUCCESS(f'\n=== Summary ==='))
                self.stdout.write(self.style.SUCCESS(f'Recipes created: {created_count}'))
                self.stdout.write(self.style.WARNING(f'Recipes skipped: {skipped_count}'))

                total_recipes = Recetas.objects.count()
                intermediate_recipes = Recetas.objects.filter(
                    producto_elaborado_variante__producto_elaborado__es_intermediario=True
                ).count()
                final_recipes = Recetas.objects.filter(
                    producto_elaborado_variante__producto_elaborado__es_intermediario=False
                ).count()

                self.stdout.write(self.style.SUCCESS(f'\n=== Verification ==='))
                self.stdout.write(self.style.SUCCESS(f'Total recipes in DB: {total_recipes}'))
                self.stdout.write(self.style.SUCCESS(f'Intermediate product recipes: {intermediate_recipes}'))
                self.stdout.write(self.style.SUCCESS(f'Final product recipes: {final_recipes}'))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error: {str(e)}'))
            raise
