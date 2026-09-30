from rest_framework.views import APIView
from rest_framework.response import Response
from .services import obtener_usuarios

class ParkingListView(APIView):

    def get(self, request):
        datos = obtener_usuarios()
        return Response(datos)

    