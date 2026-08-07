# Agência Pódio — estrutura do site

## Onde mexer em cada coisa

| Quero mudar... | Abro este arquivo |
|---|---|
| Número do WhatsApp e mensagens dos botões | `assets/js/config.js` |
| Cores da marca, fundo, holofote | `assets/css/00-config.css` |
| Tamanho de texto, vidro, botões, espaçamento | `assets/css/01-base.css` |
| Aparência de um bloco específico | `assets/css/02-blocos.css` |
| Textos, preços, perguntas do FAQ | `index.html` |

## Blocos do index.html

    01 · TOPO ................ logo, menu, botão do WhatsApp
    02 · ABERTURA ............ frase principal e chamadas
    03 · SERVIÇOS ............ as três frentes
    04 · ANTES / DEPOIS ...... interruptor da transformação
    05 · RESULTADOS .......... prints e números reais
    06 · COMO FUNCIONA ....... as quatro etapas
    07 · SITE INCLUSO ........ o brinde do plano Performance
    08 · PLANOS .............. os três preços
    09 · QUEM SOMOS .......... Daniel e João Vitor
    10 · DÚVIDAS ............. perguntas frequentes
    11 · CHAMADA FINAL ....... último convite
    12 · RODAPÉ .............. contatos, navegação e chamada
    13 · BOTÃO FLUTUANTE ..... acompanha a rolagem

Cada bloco começa e termina com uma faixa de `═══`. Para editar um,
basta pedir ao Claude Code: "altere o BLOCO 07 do index.html".

## Rodar em localhost

    cd podio
    python3 -m http.server 5173

Abrir em http://localhost:5173

## Antes de publicar

- [ ] Trocar `whatsapp` em `assets/js/config.js`
- [ ] Preencher o BLOCO 05 com prints e números reais
- [ ] Colocar as fotos no BLOCO 09
- [ ] Preencher os `<!-- TROCAR -->` do BLOCO 12 (cidade, Instagram, e-mail, horário)
- [ ] Criar `assets/img/preview.jpg` (1200x630) para a prévia no WhatsApp
