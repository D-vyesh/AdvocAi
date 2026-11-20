from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API endpoints mapped to local apps
    # Fallbacks and basic routes based on common setups
    path('api/auth/', include('authentication.urls')),
    path('api/summarizer/', include('document_summarizer.urls')),
    path('api/documents/', include('documents.urls')),
    path('api/ai/', include('ai_generator.urls')),
    path('api/utils/', include('utils.urls')),
    
    # We didn't find urls.py in 'generator' but if it exists, it can be added here
    # path('api/generator/', include('generator.urls')),
]
