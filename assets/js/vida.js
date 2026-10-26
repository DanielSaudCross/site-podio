/* ==========================================================
   VIDA DA PÁGINA (redesenho de outubro/2026)
   1. Seção do perfil: um vídeo feito com o próprio HTML. Começa do
      início quando a seção aparece, toca as cenas no tempo certo
      (digitar a busca, perfil completo, tocar em Rotas, mapa...) e se
      repete. Os botões de capítulo pulam para uma parte.
   2. O celular inclina de leve seguindo o mouse.
   3. Portfólio: o vídeo só roda quando está na tela.
   4. Formulário do fim: monta a mensagem e abre o WhatsApp.
   ========================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const querMenosMovimento = window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* 0 · Quebra de linha: palavra de uma letra (a, o, e, é, à), número e
     'R$' não ficam soltos no fim da linha. O espaço depois deles vira um
     espaço que não quebra, então eles descem junto com a palavra seguinte. */
  const PRENDE = /(?<=^|[\s(])([aeoàéAEOÀÉ]|R\$|\+|\d+[º%]?)[ \t\n]+(?=\S)/g;
  const colar = (texto) => texto.replace(PRENDE, '$1\u00a0');
  const andar = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (n.parentElement.closest('script,style,svg,textarea') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  });
  for (let n; (n = andar.nextNode());) {
    const novo = colar(n.data);
    if (novo !== n.data) n.data = novo;
  }
  /* e a última palavra de cada texto desce junto com a penúltima, para
     nunca sobrar uma palavra sozinha na última linha */
  document.querySelectorAll('p,li,dd,summary,h1,h2,h3,h4').forEach((el) => {
    const nos = [];
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let n; (n = w.nextNode());) if (n.data.trim()) nos.push(n);
    const ult = nos[nos.length - 1];
    if (ult) ult.data = ult.data.replace(/[ \t\n]+(?=\S+\s*$)/, '\u00a0');
  });

  /* 1 · Seção viva */
  const vida = document.querySelector('.vida');
  if (vida) {
    const tela = vida.querySelector('.cel-tela');
    const rolo = vida.querySelector('.g-rolo');
    const toque = vida.querySelector('.toque');
    const digita = vida.querySelector('.g-digita');
    const qtd = vida.querySelector('.g-qtd');
    const barras = vida.querySelectorAll('.vida-progresso i');
    const BUSCA = 'academia de jiu-jitsu perto de mim';

    /* O VÍDEO: cenas com duração (ms), tocadas em sequência quando a seção
       aparece na tela. p = parte do vídeo (texto da esquerda, palavra de fundo
       e segmento da barrinha); c = o que o celular mostra; toque = onde o dedo
       encosta; rolo = até onde o perfil desce; a = linha do texto que acende. */
    const VIDEO = [
      { p: 0, c: 'hoje', ms: 2100, digita: true },
      { p: 0, c: 'hoje', ms: 1900 },
      { p: 1, c: 'perfil', ms: 3600 },
      { p: 2, c: 'perfil', ms: 800, a: 'rota' },
      { p: 2, c: 'perfil', ms: 600, a: 'rota', toque: '.a-rota i' },
      { p: 2, c: 'mapa', ms: 2900, a: 'rota' },
      { p: 2, c: 'perfil', ms: 800, a: 'ligar' },
      { p: 2, c: 'perfil', ms: 600, a: 'ligar', toque: '.a-ligar i' },
      { p: 2, c: 'ligar', ms: 2600, a: 'ligar' },
      { p: 2, c: 'perfil', ms: 800, a: 'site' },
      { p: 2, c: 'perfil', ms: 600, a: 'site', toque: '.a-site i' },
      { p: 2, c: 'site', ms: 2700, a: 'site' },
      { p: 2, c: 'site', ms: 600, a: 'site', toque: '.s-btn' },
      { p: 2, c: 'site-zap', ms: 6300, a: 'site' },
      { p: 3, c: 'nfc', ms: 3600 },
      { p: 3, c: 'nfc', ms: 600, toque: '.nfc-notif' },
      { p: 3, c: 'avaliar', ms: 3900 },
      { p: 3, c: 'avaliar', ms: 600, toque: '.av-btn' },
      { p: 3, c: 'avals', ms: 6600 }
    ];
    /* Velocidade do vídeo, como no player: 1 = normal, 1.5 = uma vez e meia */
    const VELOCIDADE = 1.5;
    VIDEO.forEach((v) => { v.ms = Math.round(v.ms / VELOCIDADE); });
    /* Duração de cada parte e onde cada cena começa dentro da sua parte */
    const duracao = [0, 0, 0, 0];
    const inicioNaParte = VIDEO.map((v) => { const t = duracao[v.p]; duracao[v.p] += v.ms; return t; });

    /* Posição de um elemento dentro da tela do celular, sem contar a escala
       do celular no telefone (offset ignora transform, que é o que queremos). */
    const posicao = (el) => {
      let x = el.offsetWidth / 2, y = el.offsetHeight / 2;
      for (let n = el; n && n !== tela; n = n.offsetParent) { x += n.offsetLeft; y += n.offsetTop; }
      return { x, y };
    };
    const rolarAte = (seletor) => {
      const alvo = seletor && rolo.querySelector(seletor);
      rolo.style.setProperty('--rolo', alvo ? -Math.max(0, alvo.offsetTop - 6) + 'px' : '0px');
    };
    const tocar = (seletor) => {
      const alvo = tela.querySelector(seletor);
      if (!alvo) return;
      const { x, y } = posicao(alvo);
      toque.style.setProperty('--tx', x + 'px');
      toque.style.setProperty('--ty', y + 'px');
      toque.classList.remove('on'); void toque.offsetWidth; toque.classList.add('on');
    };

    const capitulos = vida.querySelectorAll('.vida-capitulos button');
    let atual = 0, relogio = null, letra = null, tocando = false;

    /* Barrinha: as partes anteriores cheias, as seguintes vazias e a atual
       enchendo durante a cena (a transição do CSS dura o mesmo que a cena). */
    const desenharBarra = (v, i) => {
      barras.forEach((b, p) => {
        const de = p < v.p ? 1 : p > v.p ? 0 : inicioNaParte[i] / duracao[v.p];
        const ate = p !== v.p ? de : (inicioNaParte[i] + v.ms) / duracao[v.p];
        b.style.setProperty('--dur', '0ms');
        b.style.setProperty('--cheio', de.toFixed(4));
        void getComputedStyle(b, '::after').transform;
        if (tocando && ate !== de) {
          b.style.setProperty('--dur', v.ms + 'ms');
          b.style.setProperty('--cheio', ate.toFixed(4));
        }
      });
    };

    const digitar = () => {
      let i = 0;
      clearInterval(letra);
      digita.textContent = '';
      letra = setInterval(() => {
        digita.textContent = BUSCA.slice(0, ++i);
        if (i >= BUSCA.length) clearInterval(letra);
      }, 45 / VELOCIDADE);
    };

    const cena = (i) => {
      atual = i % VIDEO.length;
      const v = VIDEO[atual];
      vida.dataset.passo = v.p;
      vida.dataset.cena = v.c;
      if (v.a) vida.dataset.acao = v.a; else delete vida.dataset.acao;
      rolarAte(v.rolo);
      qtd.textContent = v.mais ? '87' : '86';
      if (v.digita) digitar(); else if (v.p > 0) { clearInterval(letra); digita.textContent = BUSCA; }
      if (v.toque) tocar(v.toque);
      capitulos.forEach((b) => b.setAttribute('aria-current', b.dataset.ir === String(v.p)));
      desenharBarra(v, atual);
      clearTimeout(relogio);
      relogio = setTimeout(() => cena(atual + 1), v.ms);
    };

    const tocarVideo = (desde = 0) => {
      tocando = true;
      cena(desde);
    };
    const pausar = () => {
      tocando = false;
      clearTimeout(relogio); clearInterval(letra);
    };

    /* Botões de capítulo: pulam para o começo daquela parte do vídeo */
    capitulos.forEach((b) => b.addEventListener('click', () => {
      tocarVideo(VIDEO.findIndex((v) => v.p === Number(b.dataset.ir)));
    }));

    if (querMenosMovimento) {
      digita.textContent = BUSCA;
      vida.dataset.passo = '1';
      vida.dataset.cena = 'perfil';
    } else {
      /* Começa do início quando o celular aparece; pausa quando sai da tela.
         Medido na rolagem (e não só por IntersectionObserver) para funcionar
         também em janelas embutidas que atrasam esse aviso. */
      const caixa = vida.querySelector('.vida-cel');
      const conferir = () => {
        const r = caixa.getBoundingClientRect();
        const visivel = r.top < window.innerHeight * 0.7 && r.bottom > window.innerHeight * 0.3;
        if (visivel && !tocando) tocarVideo(0);
        else if (!visivel && tocando) pausar();
      };
      /* Trava suave só na primeira passagem: quando a pessoa já desceu além
         da seção, ela volta ao tamanho normal. O encolhimento acontece acima da
         tela; para nada pular de lugar, mede-se onde a próxima seção estava e
         corrige-se só o que faltar (o navegador às vezes já corrige sozinho). */
      const proxima = vida.nextElementSibling;
      const liberar = () => {
        if (vida.classList.contains('vista') || vida.getBoundingClientRect().bottom > 0) return;
        const antes = proxima.getBoundingClientRect().top;
        vida.classList.add('vista');
        const diferenca = proxima.getBoundingClientRect().top - antes;
        if (diferenca) window.scrollBy({ top: diferenca, behavior: 'instant' });
      };
      const aoRolar = () => { liberar(); conferir(); };
      conferir();
      window.addEventListener('scroll', aoRolar, { passive: true });
      window.addEventListener('resize', conferir);
    }

    /* 2 · Inclinação do celular (só com mouse) */
    const cel = vida.querySelector('.cel');
    const temMouse = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
    if (cel && temMouse && !querMenosMovimento) {
      vida.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth - 0.5;
        const y = e.clientY / window.innerHeight - 0.5;
        cel.style.setProperty('--ry', (x * 14).toFixed(2) + 'deg');
        cel.style.setProperty('--rx', (-y * 10).toFixed(2) + 'deg');
      });
      vida.addEventListener('mouseleave', () => {
        cel.style.setProperty('--ry', '0deg');
        cel.style.setProperty('--rx', '0deg');
      });
    }
  }

  /* 3 · Portfólio: roda só enquanto aparece (economiza bateria no celular) */
  const port = document.querySelector('.port');
  if (port && !querMenosMovimento) {
    new IntersectionObserver(([e]) => port.classList.toggle('in', e.isIntersecting), { threshold: 0.25 })
      .observe(port);
  }

  /* 3b · Serviços: abas que trocam o cartão. Enquanto a seção está na tela
     passam sozinhas a cada PL_MS. Mouse (ou foco do teclado) em cima do
     cartão pausa para ler (nas abas, não); ao sair, continua de onde parou. Clicar
     numa aba (ou numa seta do lado) abre ela e segue passando a partir dali.
     A luz do cartão segue
     o mouse. */
  const pl = document.querySelector('.pl');
  if (pl) {
    const PL_MS = 7000;
    const abas = [...pl.querySelectorAll('[role="tab"]')];
    const cartao = pl.querySelector('.pl-cartao');
    /* restante = quanto falta para trocar; visivel = seção na tela;
       pausado = mouse ou foco em cima */
    let atual = 0, timer = null, inicio = 0, restante = PL_MS, visivel = false, pausado = false;
    /* demo = demonstração aberta abaixo do cartão (as abas não trocam sozinhas) */
    let demo = null;
    const automatico = !querMenosMovimento;

    const abrir = (i, foco) => {
      if (demo) fecharDemo();
      atual = (i + abas.length) % abas.length;
      abas.forEach((aba, j) => {
        const sel = j === atual;
        aba.setAttribute('aria-selected', sel);
        aba.tabIndex = sel ? 0 : -1;
        const painel = document.getElementById(aba.getAttribute('aria-controls'));
        painel.hidden = !sel;
        painel.classList.remove('entra');
        if (sel) { void painel.offsetWidth; painel.classList.add('entra'); }
      });
      /* no celular as abas rolam de lado: traz a escolhida para a vista */
      const lista = abas[atual].parentElement;
      const dx = abas[atual].getBoundingClientRect().left - lista.getBoundingClientRect().left;
      lista.scrollTo({ left: lista.scrollLeft + dx - 16, behavior: querMenosMovimento ? 'auto' : 'smooth' });
      if (foco) abas[atual].focus({ preventScroll: true });
      restante = PL_MS;
      seguir();
    };
    /* roda o tempo que falta, se a seção está na tela e ninguém está lendo */
    const seguir = () => {
      clearTimeout(timer);
      const anda = automatico && visivel && !pausado && !demo;
      if (!anda) return;
      inicio = performance.now();
      timer = setTimeout(() => abrir(atual + 1), restante);
    };
    /* guarda quanto faltava e congela */
    const pausar = () => {
      if (!pausado && visivel && automatico) restante = Math.max(0, restante - (performance.now() - inicio));
      pausado = true;
      seguir();
    };
    const continuar = () => { pausado = false; seguir(); };

    /* Demonstração: o link do painel abre, logo abaixo do cartão, a demo
       daquele serviço (uma por vez) e leva a pessoa até ela. Clicar de novo,
       no 'Fechar' da demo ou em outra aba fecha. */
    const rolar = querMenosMovimento ? 'auto' : 'smooth';
    const links = [...pl.querySelectorAll('[data-demo]')];
    links.forEach((b) => { b.dataset.rotulo = b.textContent; });
    const fecharDemo = () => {
      if (!demo) return;
      demo.hidden = true;
      demo = null;
      links.forEach((b) => { b.setAttribute('aria-expanded', 'false'); b.textContent = b.dataset.rotulo; });
      seguir();
    };
    links.forEach((b) => b.addEventListener('click', () => {
      const alvo = document.getElementById(b.dataset.demo);
      if (demo === alvo) { fecharDemo(); return; }
      fecharDemo();
      demo = alvo;
      alvo.hidden = false;
      b.setAttribute('aria-expanded', 'true');
      b.textContent = 'Fechar a demonstração';
      seguir();
      alvo.scrollIntoView({ behavior: rolar, block: 'start' });
    }));
    document.querySelectorAll('.demo-fechar').forEach((b) => b.addEventListener('click', () => {
      fecharDemo();
      pl.scrollIntoView({ behavior: rolar, block: 'start' });
    }));

    abas.forEach((aba, i) => aba.addEventListener('click', () => abrir(i)));
    pl.querySelector('.pl-volta').addEventListener('click', () => abrir(atual - 1));
    pl.querySelector('.pl-vai').addEventListener('click', () => abrir(atual + 1));
    pl.querySelector('[role="tablist"]').addEventListener('keydown', (ev) => {
      const passo = { ArrowRight: 1, ArrowLeft: -1 }[ev.key];
      if (passo) { ev.preventDefault(); abrir(atual + passo, true); }
    });
    /* só o cartão pausa: passar o mouse nas abas não segura a troca */
    cartao.addEventListener('mouseenter', pausar);
    cartao.addEventListener('mouseleave', continuar);
    cartao.addEventListener('focusin', pausar);
    cartao.addEventListener('focusout', (ev) => { if (!cartao.contains(ev.relatedTarget)) continuar(); });
    if (automatico) {
      new IntersectionObserver(([e]) => {
        if (e.isIntersecting === visivel) return;
        if (!e.isIntersecting && !pausado) restante = Math.max(0, restante - (performance.now() - inicio));
        visivel = e.isIntersecting;
        seguir();
      }, { threshold: 0.4 }).observe(pl);
      seguir();
    }
    cartao.addEventListener('pointermove', (ev) => {
      const r = cartao.getBoundingClientRect();
      cartao.style.setProperty('--mx', ev.clientX - r.left + 'px');
      cartao.style.setProperty('--my', ev.clientY - r.top + 'px');
    });
  }

  /* 3c · Monte a estrutura: soma o pagamento único e o mensal separados.
     Desconto no único pela quantidade de serviços (2 = 10%, 3 = 18%,
     4 = 20%) e 10% quando as duas mensalidades vão juntas. O WhatsApp é
     um par: implantação e mensalidade entram e saem juntas. O botão leva
     a escolha e os valores na mensagem. */
  const est = document.querySelector('.est');
  if (est && typeof PODIO !== 'undefined') {
    const DESC_UNICO = { 2: 0.10, 3: 0.18, 4: 0.20 };
    const DESC_MENSAL = { 2: 0.10 };
    const caixas = [...est.querySelectorAll('input[type="checkbox"]')];
    const botao = est.querySelector('[data-wa="estrutura"]');
    const brl = (v) => 'R$ ' + Math.round(v).toLocaleString('pt-BR');
    /* Os valores são fixos (tabela de preços): o total novo entra direto,
       sem contagem. Só esmaece de leve quando muda, para o olho perceber
       a troca. */
    const deslizar = (tipo, ate, sufixo) => {
      const el = est.querySelector(`[data-total="${tipo}"]`);
      const novo = ate ? brl(ate) + sufixo
        : tipo === 'mensal' ? 'Sem mensalidade' : tipo === 'soma' ? 'R$ 0' : 'Nenhum serviço';
      el.classList.toggle('vazio', !ate);
      if (el.innerHTML === novo) return;
      el.innerHTML = novo;
      el.classList.remove('troca'); void el.offsetWidth; el.classList.add('troca');
    };

    const calcular = () => {
      const soma = { unico: 0, mensal: 0 }, qtd = { unico: 0, mensal: 0 }, nomes = { unico: [], mensal: [] };
      caixas.filter((c) => c.checked).forEach((c) => {
        soma[c.dataset.tipo] += +c.dataset.preco;
        qtd[c.dataset.tipo] += 1;
        nomes[c.dataset.tipo].push(c.dataset.nome);
      });
      const pct = { unico: DESC_UNICO[qtd.unico] || 0, mensal: DESC_MENSAL[qtd.mensal] || 0 };
      const total = { unico: Math.round(soma.unico * (1 - pct.unico)), mensal: Math.round(soma.mensal * (1 - pct.mensal)) };

      ['unico', 'mensal'].forEach((tipo) => {
        est.querySelector(`[data-de="${tipo}"]`).textContent = pct[tipo] ? brl(soma[tipo]) + (tipo === 'mensal' ? '/mês' : '') : '';
        const off = est.querySelector(`[data-off="${tipo}"]`);
        const novo = pct[tipo] ? '-' + Math.round(pct[tipo] * 100) + '%' : '';
        if (off.textContent !== novo) { off.textContent = novo; off.classList.remove('pisca'); void off.offsetWidth; off.classList.add('pisca'); }
        deslizar(tipo, total[tipo], tipo === 'mensal' ? '<small>/mês</small>' : '');
      });

      const ecoU = soma.unico - total.unico, ecoM = soma.mensal - total.mensal;
      est.querySelector('.est-eco').textContent = colar(ecoU || ecoM
        ? 'Você economiza ' + [ecoU && brl(ecoU), ecoM && brl(ecoM) + ' por mês'].filter(Boolean).join(' e ')
        : '');
      const prox = { 0: 'Escolha um serviço para começar.', 1: 'Junte mais 1 serviço e ganhe 10% de desconto.',
        2: 'Junte mais 1 serviço e o desconto sobe para 18%.', 3: 'Junte mais 1 serviço e o desconto sobe para 20%.',
        4: 'Desconto máximo: 20% nos serviços.' };
      est.querySelector('.est-dica').textContent = colar(qtd.unico + qtd.mensal === 0 ? prox[0]
        : qtd.unico === 0 ? 'Escolha os serviços de cima.' : prox[qtd.unico]);

      const vazio = !qtd.unico && !qtd.mensal;
      botao.setAttribute('aria-disabled', vazio);
      const texto = PODIO.mensagens.estrutura + '\n' +
        [...nomes.unico, ...nomes.mensal].map((n) => '- ' + n).join('\n') + '\n\n' +
        'Serviços (pagos uma vez): ' + (total.unico ? brl(total.unico) : 'nenhum') + '\n' +
        'Por mês (a partir da entrega): ' + (total.mensal ? brl(total.mensal) : 'nenhuma');
      botao.href = 'https://wa.me/' + String(PODIO.whatsapp).replace(/\D/g, '') + '?text=' + encodeURIComponent(texto);
    };

    /* o acompanhamento só faz sentido com algo para acompanhar: Perfil ou Site */
    const travarAcomp = () => {
      const acomp = est.querySelector('[name=acomp]');
      const pode = est.querySelector('[name=perfil]').checked || est.querySelector('[name=site]').checked;
      acomp.disabled = !pode;
      if (!pode) acomp.checked = false;
    };
    caixas.forEach((c) => c.addEventListener('change', () => {
      /* implantação e mensalidade do WhatsApp andam juntas */
      if (c.dataset.par) caixas.filter((o) => o !== c && o.dataset.par === c.dataset.par).forEach((o) => { o.checked = c.checked; });
      travarAcomp();
      calcular();
    }));
    travarAcomp();
    calcular();
  }

  /* 4 · Formulário: o que a pessoa preencheu vira a mensagem do WhatsApp */
  const form = document.getElementById('form-diag');
  if (form && typeof PODIO !== 'undefined') {
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const erro = form.querySelector('.form-erro');
      const academia = form.academia.value.trim();
      const local = form.local.value.trim();
      const nome = form.nome.value.trim();
      form.academia.setAttribute('aria-invalid', !academia);
      form.local.setAttribute('aria-invalid', !local);
      if (!academia || !local) {
        erro.textContent = 'Preencha o nome da academia e o bairro.';
        (academia ? form.local : form.academia).focus();
        return;
      }
      erro.textContent = '';
      /* Guarda o pedido no n8n antes de abrir o WhatsApp. sendBeacon entrega
         mesmo com a aba trocando e, como formulário simples, não esbarra
         em bloqueio entre domínios. Se falhar, o WhatsApp abre do mesmo jeito. */
      if (PODIO.registroDiagnostico && navigator.sendBeacon) {
        try {
          navigator.sendBeacon(PODIO.registroDiagnostico,
            new URLSearchParams({ academia, local, nome, pagina: location.href }));
        } catch (e) { /* segue para o WhatsApp */ }
      }
      const texto = `${VEIO} e quero o diagnóstico gratuito do meu perfil no Google.\n` +
        `Academia: ${academia}\nBairro e cidade: ${local}` + (nome ? `\nMeu nome: ${nome}` : '');
      const numero = String(PODIO.whatsapp).replace(/\D/g, '');
      window.open(`https://wa.me/${numero}?text=${encodeURIComponent(texto)}`, '_blank', 'noopener');
    });
  }
});
