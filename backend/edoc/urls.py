from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('django-admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/', include('appointments.urls')),
]

from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static
import os

# Serve React SPA
urlpatterns += [
    path('app/', TemplateView.as_view(template_name='index.html'), name='react_app'),
]
