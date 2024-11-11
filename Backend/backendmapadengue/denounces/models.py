from django.db import models

class Denuncia(models.Model):
    bairro = models.CharField(max_length=255)
    rua = models.CharField(max_length=255)
    numero = models.CharField(max_length=50)
    cidade = models.CharField(max_length=255)
    estado = models.CharField(max_length=255)
    descricao = models.TextField()
    doenca = models.CharField(max_length=255)
    data_criacao = models.DateTimeField(auto_now_add=True)
    enviada = models.CharField(max_length=3, default='não')  # Adicionando o campo 'enviada'

    def __str__(self):
        return f"Denúncia {self.id} - {self.bairro}, {self.cidade}, {self.estado}"


class Imagem(models.Model):
    denuncia = models.ForeignKey('Denuncia', on_delete=models.CASCADE)
    caminho_arquivo = models.ImageField(upload_to='images/')

    def __str__(self):
        return f"Imagem da Denúncia {self.denuncia.id}"