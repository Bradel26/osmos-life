# Assets dos manuais — uma pasta por produto

Cada produto da Central de Manuais guarda as suas imagens em uma **pasta própria**,
nomeada pelo modelo:

```
assets/manuais/
 ├── a9plus/     ← imagens do A9 PLUS (fotos de estúdio, desenhos técnicos, vistas)
 └── a10s/       ← criar quando o manual do A10S chegar (vazia até lá)
```

**Nunca** reutilize a pasta de um modelo para outro. Cada produto só referencia
imagens da sua própria pasta no `conteudo_json`.

## Fotos para o giro 360° (opcional)

O visualizador 360° só liga quando existem as **quatro fotos de estúdio
ortogonais do próprio produto**, com estes nomes:

| Arquivo | Vista |
|---------|-------|
| `foto-01-studio.png` | Frente |
| `foto-02-studio.png` | Lateral direita |
| `foto-03-studio.png` | Traseira |
| `foto-05-studio.png` | Lateral esquerda |

Sem essas quatro fotos, a seção mostra apenas a galeria de fotos (sem 360°) — o
que é o comportamento correto até o produto ter material próprio.

> Observação: a geometria de reconstrução do 360° em `js/product360.js` foi
> modelada para a carcaça do **A9 PLUS**. Um produto com formato diferente
> precisa do seu próprio perfil de geometria/recortes antes de ativar o 360°.

Ver `ARQUITETURA-MANUAIS.md` na raiz do `osmos-site` para o procedimento completo
de cadastro de um novo produto.
