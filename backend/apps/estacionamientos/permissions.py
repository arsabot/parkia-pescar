from rest_framework.permissions import BasePermission, SAFE_METHODS


class LecturaPublicaEscrituraStaff(BasePermission):


    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        return bool(user and user.is_authenticated and user.is_active
                    and (user.is_staff or user.is_superuser))
