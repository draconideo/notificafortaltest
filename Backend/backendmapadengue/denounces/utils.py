# denounces/utils.py

from django.core.mail import EmailMessage
from .models import Denuncia, Imagem
from email.mime.base import MIMEBase
from email import encoders
import mimetypes

def enviar_email_denuncia(denuncia):
    assunto = "Denúncia de local de risco - Dengue"
    mensagem_html = f"""
    <html>
    <body>
        <h2>Denúncia de Local de Risco - Dengue</h2>
        <p>Prezado(a) representante da Prefeitura de Fortaleza,</p>
        <p>Gostaríamos de informar uma nova denúncia de um local de risco para a proliferação do mosquito da dengue. Seguem os detalhes:</p>
        <ul>
            <li><strong>Bairro:</strong> {denuncia.bairro}</li>
            <li><strong>Rua:</strong> {denuncia.rua}</li>
            <li><strong>Número mais próximo:</strong> {denuncia.numero}</li>
            <li><strong>Cidade:</strong> {denuncia.cidade}</li>
            <li><strong>Estado:</strong> {denuncia.estado}</li>
        </ul>
        <p><strong>Descrição:</strong></p>
        <p>{denuncia.descricao}</p>
        <p>Segue abaixo imagens relacionadas à denúncia:</p>
        <p>Atenciosamente,</p>
        <p><em>Sistema de Notificação de Dengue</em></p>
    </body>
    </html>
    """

    # Cria a mensagem de e-mail
    email = EmailMessage(
        assunto,
        mensagem_html,
        'datasciencenotificafortal@gmail.com',  # De
        ['datasciencenotificafortal@gmail.com']  # Para
    )
    email.content_subtype = "html"  # Define o conteúdo como HTML

    # Anexar as imagens
    imagens = Imagem.objects.filter(denuncia=denuncia)
    for imagem in imagens:
        caminho_arquivo = imagem.caminho_arquivo.path
        content_type, encoding = mimetypes.guess_type(caminho_arquivo)
        if content_type is None:
            content_type = 'application/octet-stream'
        main_type, sub_type = content_type.split('/', 1)

        with open(caminho_arquivo, 'rb') as f:
            mime = MIMEBase(main_type, sub_type)
            mime.set_payload(f.read())
            encoders.encode_base64(mime)
            mime.add_header('Content-Disposition', 'attachment', filename=imagem.caminho_arquivo.name)
            email.attach(mime)

    # Enviar o e-mail
    email.send()

    # Atualizar o status da denúncia para 'sim'
    denuncia.enviada = 'sim'
    denuncia.save()
