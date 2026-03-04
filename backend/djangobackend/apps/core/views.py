from rest_framework.views import APIView
from rest_framework.response import Response
from apps.core.models import Notificaciones, AtributosProductos

class DashboardDataView(APIView):
    def get(self, request, *args, **kwargs):

        notification_count = Notificaciones.objects.filter(leida=False).count()

        return Response({"notificaciones": notification_count})


class AtributosProductosView(APIView):
    def get(self, request, *args, **kwargs):
        atributos = AtributosProductos.values
        return Response({"atributos": atributos})