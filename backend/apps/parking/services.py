import requests


API_URL = "https://jsonplaceholder.typicode.com/users"

# ESTOY USANDO UNA API DE PRUEBA
def obtener_usuarios():
    response = requests.get(API_URL)
    response.raise_for_status()


    return response.json()


