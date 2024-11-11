# denounces/views.py

from django.shortcuts import render
from django.http import JsonResponse
from .models import Denuncia, Imagem
from .utils import enviar_email_denuncia

def salvar_denuncia(request):
    if request.method == 'POST':
        # Extrair os dados da requisição POST
        data = request.POST
        imagens = request.FILES.getlist('imagens')

        # Criar um objeto de denúncia
        denuncia = Denuncia.objects.create(
            rua=data.get('rua'),
            bairro=data.get('bairro'),
            numero=data.get('numero'),
            cidade=data.get('cidade'),
            estado=data.get('estado'),
            descricao=data.get('descricao'),
            doenca=data.get('doenca'),
            enviada=data.get('enviada', 'não')  # Pega o valor de 'enviada' ou define como 'não' por padrão
        )

        # Salvar as imagens relacionadas à denúncia
        for imagem in imagens:
            Imagem.objects.create(denuncia=denuncia, caminho_arquivo=imagem)

        # Enviar e-mail se a denúncia não foi enviada
        if denuncia.enviada == 'não':
            enviar_email_denuncia(denuncia)

        return JsonResponse({'message': 'Denúncia salva com sucesso!'})

    # Se o método da requisição não for POST, retornar um erro
    return JsonResponse({'error': 'Método não permitido'}, status=405)
