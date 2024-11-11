from django.urls import path
from information import views as information_views  # Renomeie o import para evitar conflito
from denounces import views as denounces_views  # Renomeie o import para evitar conflito
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # ubhgybfyby
    path('enviar-dados/', information_views.enviar_dataframe_json, name='enviar-dados'),
    path('denuncias/', denounces_views.salvar_denuncia, name='salvar-denuncia'),
    # Outras URLs do seu projeto aqui
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)