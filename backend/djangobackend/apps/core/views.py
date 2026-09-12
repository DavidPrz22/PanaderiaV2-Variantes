from rest_framework.views import APIView
from rest_framework.response import Response
from apps.core.models import Notificaciones, AtributosProductos
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers

class DashboardDataView(APIView):
    @extend_schema(
        responses={
            200: inline_serializer(
                name='DashboardDataResponse',
                fields={'notificaciones': serializers.IntegerField()}
            )
        }
    )
    def get(self, request, *args, **kwargs):

        notification_count = Notificaciones.objects.filter(leida=False).count()

        return Response({"notificaciones": notification_count})


class AtributosProductosView(APIView):
    @extend_schema(
        responses={
            200: inline_serializer(
                name='AtributosProductosResponse',
                fields={'atributos': serializers.ListField(child=serializers.CharField())}
            )
        }
    )
    def get(self, request, *args, **kwargs):
        atributos = AtributosProductos.values
        return Response({"atributos": atributos})