from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema, inline_serializer, OpenApiParameter
from rest_framework import serializers
from apps.inventario.models import MateriasPrimas, ProductosElaborados, ProductosReventa, ProductosFinales, ProductosIntermedios
from django.db.models import Value, CharField
from apps.core.models import CategoriasProductosReventa, CategoriasProductosElaborados
from apps.inventario.serializers import CajaProductosSerializer
from apps.core.serializers import UnidadMedidaSerializer
from collections import defaultdict

class ComponenteRecetaItemSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    nombre = serializers.CharField()
    tipo = serializers.CharField()
    unidad_medida = serializers.CharField()
    stock = serializers.DecimalField(max_digits=10, decimal_places=3, required=False)

class ProductosPedidoSearchView(APIView):
    @extend_schema(
        parameters=[
            OpenApiParameter(name='search', description='Termino de búsqueda', required=True, type=str)
        ],
        responses={
            200: inline_serializer(
                name='ProductosPedidoSearchResponse',
                fields={
                    'productos': inline_serializer(
                        name='ProductoPedidoItem',
                        fields={
                            'id': serializers.IntegerField(),
                            'nombre_producto': serializers.CharField(),
                            'unidad_venta': inline_serializer(
                                name='UnidadVentaSimple',
                                fields={
                                    'id': serializers.IntegerField(),
                                    'abreviatura': serializers.CharField(),
                                }
                            ),
                            'SKU': serializers.CharField(),
                            'precio_venta_usd': serializers.DecimalField(max_digits=10, decimal_places=3),
                            'stock_actual': serializers.DecimalField(max_digits=10, decimal_places=3),
                            'tipo': serializers.CharField(),
                        },
                        many=True
                    )
                }
            ),
            400: inline_serializer(
                name='SearchErrorResponse',
                fields={'error': serializers.CharField()}
            )
        }
    )
    def get(self, request, *args, **kwargs):
        param = request.query_params.get('search')
        if not param:
            return Response(
                status=status.HTTP_400_BAD_REQUEST,
                data={"error": "El parámetro 'search' es requerido"}
            )
        
        # Get ProductosElaborados using .values()
        productos = ProductosElaborados.objects.filter(
            nombre_producto__icontains=param,
            es_intermediario=False  # Only final products
        ).values('id', 'nombre_producto', 'unidad_venta__id', 'unidad_venta__abreviatura', 'SKU', 'precio_venta_usd', 'stock_actual')

        # Get ProductosReventa using .values()
        productos_reventa = ProductosReventa.objects.filter(
            nombre_producto__icontains=param
        ).values('id', 'nombre_producto', 'unidad_venta__id', 'unidad_venta__abreviatura', 'SKU', 'precio_venta_usd', 'stock_actual')

        # Convert to list and add 'tipo' field
        productos_list = [
            {
                'id': p['id'],
                'nombre_producto': p['nombre_producto'],
                'unidad_venta': {
                    'id': p['unidad_venta__id'],
                    'abreviatura': p['unidad_venta__abreviatura']
                } if p['unidad_venta__id'] else None,
                'SKU': p['SKU'],
                'precio_venta_usd': p['precio_venta_usd'],
                'stock_actual': p['stock_actual'],
                'tipo': 'producto-final'
            }
            for p in productos
        ]

        reventa_list = [
            {
                'id': p['id'],
                'nombre_producto': p['nombre_producto'],
                'unidad_venta': {
                    'id': p['unidad_venta__id'],
                    'abreviatura': p['unidad_venta__abreviatura']
                } if p['unidad_venta__id'] else None,
                'SKU': p['SKU'],
                'precio_venta_usd': p['precio_venta_usd'],
                'stock_actual': p['stock_actual'],
                'tipo': 'producto-reventa'
            }
            for p in productos_reventa
        ]
        
        # Combine and sort
        combined = productos_list + reventa_list
        combined.sort(key=lambda x: x['nombre_producto'].lower())
        
        return Response({"productos": combined}, status=status.HTTP_200_OK)


class ProductosComprasSearchView(APIView):
    @extend_schema(
        parameters=[
            OpenApiParameter(name='search', description='Termino de búsqueda', required=True, type=str)
        ],
        responses={
            200: inline_serializer(
                name='ProductosComprasSearchResponse',
                fields={
                    'productos': inline_serializer(
                        name='ProductoCompraItem',
                        fields={
                            'id': serializers.IntegerField(),
                            'nombre': serializers.CharField(),
                            'unidad_medida_base': UnidadMedidaSerializer(),
                            'variantes': inline_serializer(
                                name='ProductoCompraVariante',
                                fields={
                                    'id': serializers.IntegerField(),
                                    'nombre': serializers.CharField(),
                                    'SKU': serializers.CharField(),
                                    'precio_compra_divisa': serializers.DecimalField(max_digits=10, decimal_places=3),
                                    'unidad_compra': UnidadMedidaSerializer(),
                                },
                                many=True
                            ),
                            'tipo': serializers.CharField(),
                        },
                        many=True
                    )
                }
            ),
            400: inline_serializer(
                name='ComprasSearchErrorResponse',
                fields={'error': serializers.CharField()}
            )
        }
    )
    def get(self, request, *args, **kwargs):
        param = request.query_params.get('search')
        if not param:
            return Response(
                status=status.HTTP_400_BAD_REQUEST,
                data={"error": "El parámetro 'search' es requerido"}
            )
        
        # Optimized search for Materias Primas - Search by base product name
        materias_primas = MateriasPrimas.objects.filter(
            nombre__icontains=param
        ).select_related('unidad_medida_base').prefetch_related(
            'variantes__unidad_compra'
        )
        
        # Optimized search for Productos Reventa - Search by base product name
        productos_reventa = ProductosReventa.objects.filter(
            nombre_producto__icontains=param
        ).select_related('unidad_venta', 'unidad_medida_base').prefetch_related(
            'variantes'
        )

        materia_prima_list = [
            {
                'id': mp.id,
                'nombre': mp.nombre,
                'unidad_medida_base': UnidadMedidaSerializer(mp.unidad_medida_base).data,
                'variantes': [
                    {
                        'id': v.id,
                        'nombre': v.nombre_variante,
                        'SKU': v.SKU_variante,
                        'precio_compra_divisa': v.precio_compra_divisa,
                        'unidad_compra': UnidadMedidaSerializer(v.unidad_compra).data if v.unidad_compra else UnidadMedidaSerializer(mp.unidad_medida_base).data,
                    }
                    for v in mp.variantes.all()
                ],
                'tipo': 'MateriaPrima'
            }
            for mp in materias_primas
        ]

        productos_reventa_list = [
            {
                'id': pr.id,
                'nombre': pr.nombre_producto,
                'unidad_medida_base': UnidadMedidaSerializer(pr.unidad_medida_base if pr.unidad_medida_base else pr.unidad_venta).data,
                'variantes': [
                    {
                        'id': v.id,
                        'nombre': v.nombre_variante,
                        'SKU': v.SKU,
                        'precio_compra_divisa': v.costo_divisa,  # Use cost instead of selling price
                        'unidad_compra': UnidadMedidaSerializer(pr.unidad_venta).data if pr.unidad_venta else None,
                    }
                    for v in pr.variantes.all()
                ],
                'tipo': 'ProductoReventa'
            }
            for pr in productos_reventa
        ]

        # Combine and sort
        combined = materia_prima_list + productos_reventa_list
        combined.sort(key=lambda x: x['nombre'].lower())
        
        return Response({"productos": combined}, status=status.HTTP_200_OK)

    
class ProductosVentasListaView(APIView):
    @extend_schema(
        responses={
            200: inline_serializer(
                name='ProductosVentasListaResponse',
                fields={
                    'productos': CajaProductosSerializer(many=True)
                }
            )
        }
    )
    def get(self, request, *args, **kwargs):

        pf = ProductosFinales.objects.filter(stock_actual__gt=0).select_related('categoria', 'unidad_venta')
        pr = ProductosReventa.objects.filter(stock_actual__gt=0).select_related('categoria', 'unidad_venta')
        
        productos_combinados = list(pf) + list(pr)
        productos_combinados.sort(key=lambda x: x.nombre_producto.lower())
        
        serializer = CajaProductosSerializer(productos_combinados, many=True)
        productos = serializer.data
        
        return Response({"productos": productos}, status=status.HTTP_200_OK)


class CategoriasProductosView(APIView):

    @extend_schema(
        responses={
            200: inline_serializer(
                name='CategoriasProductosResponse',
                fields={
                    'categorias': inline_serializer(
                        name='CategoriasMap',
                        fields={
                            'todos': serializers.ListField(child=serializers.CharField()),
                            'final': serializers.ListField(child=serializers.CharField()),
                            'reventa': serializers.ListField(child=serializers.CharField()),
                        }
                    )
                }
            )
        }
    )
    def get(self, request, *args, **kwargs):
        categorias_pf = CategoriasProductosElaborados.objects.filter(es_intermediario=False).values_list('nombre_categoria', flat=True)
        categorias_pr = CategoriasProductosReventa.objects.values_list('nombre_categoria', flat=True)
        
        categorias = { 
            'todos': list(set(list(categorias_pf) + list(categorias_pr))), 
            'final': list(categorias_pf), 
            'reventa': list(categorias_pr)
        }
        
        return Response({"categorias": categorias}, status=status.HTTP_200_OK)


class ComponenteRecetasView(APIView):
    
    @extend_schema(
        parameters=[
            OpenApiParameter(name='search', description='Termino de búsqueda', required=True, type=str),
            OpenApiParameter(name='stock', description='Incluir stock actual', required=False, type=str),
        ],
        responses={
            200: inline_serializer(
                name='ComponenteRecetasResponse',
                fields={
                    'nombre_categoria': ComponenteRecetaItemSerializer(many=True)
                }
            ),
            400: inline_serializer(
                name='RecetaSearchErrorResponse',
                fields={'error': serializers.CharField()}
            )
        }
    )
    def get(self, request, *args, **kwargs):
        search_query = request.query_params.get('search')
        stock_requested = request.query_params.get('stock')

        if not search_query:
            return Response(status=status.HTTP_400_BAD_REQUEST, data={"error": "El parámetro 'search' es requerido"})

        materia_primas = MateriasPrimas.objects.filter(
            nombre__icontains=search_query
        ).select_related('categoria')

        productos_intermedios = ProductosIntermedios.objects.filter(
            nombre_producto__icontains=search_query
        ).select_related('categoria')

        categorias_dict = defaultdict(list)
        for materia_prima in materia_primas:
            categoria = materia_prima.categoria.nombre_categoria
            componente_data = {
                'id': materia_prima.id, 
                'nombre': materia_prima.nombre,
                'tipo': 'MateriaPrima',
                'unidad_medida': materia_prima.unidad_medida_base.abreviatura
            }
            if stock_requested: 
                componente_data['stock'] = materia_prima.stock_actual

            categorias_dict[categoria].append(componente_data)

        for intermedio in productos_intermedios:
            categoria = intermedio.categoria.nombre_categoria
            componente_data = {
                'id': intermedio.id,
                'nombre': intermedio.nombre_producto,
                'tipo': 'ProductoIntermedio',
                'unidad_medida': intermedio.unidad_produccion.abreviatura
            }
            if stock_requested:
                componente_data['stock'] = intermedio.stock_actual

            categorias_dict[categoria].append(componente_data)

        return Response(categorias_dict)
