# Assets dos manuais — uma pasta por produto

Cada produto da Central de Manuais guarda as suas imagens em uma **pasta própria**,
nomeada pelo modelo:

```
assets/manuais/
 ├── a9plus/     ← imagens do A9 PLUS (fotos de estúdio, desenhos técnicos, vistas)
 ├── a10s/       ← cinco vistas originais, detalhes e desenhos técnicos do A10S
 └── s9/         ← reservada para o S9 (ainda sem mídia; estrutura usa fallbacks)
```

**Nunca** reutilize a pasta de um modelo para outro. Cada produto só referencia
imagens da sua própria pasta no `conteudo_json`.

## Fotos para o giro 360° (opcional)

O perfil **A9 PLUS** usa as quatro fotos de estúdio ortogonais do próprio produto:

| Arquivo | Vista |
|---------|-------|
| `foto-01-studio.png` | Frente |
| `foto-02-studio.png` | Lateral direita |
| `foto-03-studio.png` | Traseira |
| `foto-05-studio.png` | Lateral esquerda |

Sem essas quatro fotos, a seção mostra apenas a galeria de fotos (sem 360°) — o
que é o comportamento correto até o produto ter material próprio.

O perfil **A10S** usa exclusivamente as cinco vistas originais desta pasta:

| Arquivo | Vista |
|---------|-------|
| `frente.png` | Frente |
| `lateral-direita.png` | Lateral direita |
| `tras.png` | Traseira |
| `lateral-esquerda.png` | Lateral esquerda |
| `superior.png` | Superior |

`js/product360.js` contém geometrias e calibrações separadas para os dois modelos.
O A10S permite giro completo e inclinação de 0° a 26° para observar o topo sem
revelar a base não fotografada. Os PNGs são preservados; apenas os recortes de
projeção são definidos no código. Nenhum detalhe é gerado por IA ou por fotos
de outro equipamento.

Integração e prévia local: `scripts/product360-integration.md`.

Ver `ARQUITETURA-MANUAIS.md` na raiz do `osmos-site` para o procedimento completo
de cadastro de um novo produto.
