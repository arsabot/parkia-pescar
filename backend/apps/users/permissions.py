from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdminRole(BasePermission):
    """
    Permite acceso únicamente a usuarios con rol de administrador o superusuarios.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role == 'admin' or request.user.is_superuser or request.user.is_staff)
        )


class IsAdminOrReadOnly(BasePermission):
    """
    Lectura libre para cualquiera, modificación solo para Administradores.
    """
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role == 'admin' or request.user.is_superuser or request.user.is_staff)
        )


class IsOwnerOrAdmin(BasePermission):
    """
    Permite acceso solo al dueño del objeto o a un administrador.
    """
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin' or request.user.is_superuser:
            return True
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return False
