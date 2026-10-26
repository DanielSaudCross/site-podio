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

    01 · TOPO ................ logo, menu (Serviços, Preços, Cases, Dúvidas) e Contato
    02 · ABERTURA ............ frase principal e "Conheça nossas soluções"
    03 · SERVIÇOS ............ 5 cards (Perfil, Site, WhatsApp, Placa, Acompanhamento),
                               demonstrações que abrem pelo link e a calculadora (#precos)
    04 · CASES ............... academias atendidas
    05 · DÚVIDAS ............. perguntas frequentes (repetidas no FAQPage do <head>)
    06 · CHAMADA FINAL ....... formulário do diagnóstico gratuito
    07 · RODAPÉ .............. contatos, navegação e chamada
    08 · BOTÃO FLUTUANTE ..... acompanha a rolagem

Cada bloco começa e termina com uma faixa de `═══`. Para editar um,
basta pedir ao Claude Code: "altere o BLOCO 03 do index.html".

## Publicação

O site sai na Vercel a cada push na `main`. O `vercel.json` guarda os
cabeçalhos de segurança (CSP e afins): um endereço externo novo (fonte,
imagem, script ou webhook) precisa entrar lá, senão o navegador bloqueia.
O `.vercelignore` tira deste pacote os arquivos de trabalho, como este.

## Rodar em localhost

    cd podio
    python3 -m http.server 5173

Abrir em http://localhost:5173
