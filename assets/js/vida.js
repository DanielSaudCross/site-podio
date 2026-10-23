/* ==========================================================
   VIDA DA PÁGINA (redesenho de outubro/2026)
   1. Vitrine: quatro vídeos do perfil feitos com o próprio HTML,
      cada um no seu celular e com o seu tempo, repetindo sozinho.
   2. Portfólio: o vídeo só roda quando está na tela.
   3. Formulário do fim: monta a mensagem e abre o WhatsApp.
   ========================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const querMenosMovimento = window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* 1 · Vitrine: quatro vídeos do perfil, cada um no seu celular */
  const BUSCA = 'academia de jiu-jitsu perto de mim';
  /* Cenas de cada vídeo, com duração (ms). passo 0 = perfil cru, 1 = completo;
     c = o que a tela mostra; toque = onde o dedo encosta; rolo = até onde o
     perfil desce. Cada vídeo repete sozinho. */
  const VIDEOS = [
    [ /* Hoje */
      { passo: 0, c: 'hoje', ms: 2200, digita: true },
      { passo: 0, c: 'hoje', ms: 2600 }
    ],
    [ /* Perfil completo: mostra o de hoje e vira o completo */
      { passo: 0, c: 'hoje', ms: 1200 },
      { passo: 1, c: 'perfil', ms: 4600 }
    ],
    [ /* Contato */
      { passo: 1, c: 'perfil', ms: 900 },
      { passo: 1, c: 'perfil', ms: 600, toque: '.a-rota i' },
      { passo: 1, c: 'mapa', ms: 2900 },
      { passo: 1, c: 'perfil', ms: 800 },
      { passo: 1, c: 'perfil', ms: 600, toque: '.a-ligar i' },
      { passo: 1, c: 'ligar', ms: 2600 },
      { passo: 1, c: 'perfil', ms: 800 },
      { passo: 1, c: 'perfil', ms: 600, toque: '.a-site i' },
      { passo: 1, c: 'site', ms: 2000 },
      { passo: 1, c: 'site', ms: 600, toque: '.s-btn' },
      { passo: 1, c: 'site-zap', ms: 3300 }
    ],
    [ /* Avaliações */
      { passo: 1, c: 'nfc', ms: 3000 },
      { passo: 1, c: 'avaliar', ms: 3000 },
      { passo: 1, c: 'aval-nova', ms: 3600, rolo: '.g-avals', mais: true },
      { passo: 1, c: 'aval-nova', ms: 1200, mais: true }
    ]
  ];

  /* Um tocador por celular, cada um com o próprio relógio */
  const criarTocador = (raiz) => {
    const cenas = VIDEOS[Number(raiz.dataset.video)];
    const tela = raiz.querySelector('.cel-tela');
    const rolo = raiz.querySelector('.g-rolo');
    const toque = raiz.querySelector('.toque');
    const digita = raiz.querySelector('.g-digita');
    const qtd = raiz.querySelector('.g-qtd');
    const barra = raiz.querySelector('.vida-progresso i');
    const total = cenas.reduce((t, c) => t + c.ms, 0);
    const inicio = cenas.map((c, i) => cenas.slice(0, i).reduce((t, x) => t + x.ms, 0));
    let relogio = null, letra = null;

    /* Posição de um elemento dentro da tela, sem contar a escala do celular */
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
    const digitar = () => {
      let n = 0;
      clearInterval(letra);
      digita.textContent = '';
      letra = setInterval(() => {
        digita.textContent = BUSCA.slice(0, ++n);
        if (n >= BUSCA.length) clearInterval(letra);
      }, 45);
    };
    /* Barrinha: enche durante a cena (a transição do CSS dura o mesmo que ela) */
    const encher = (i) => {
      barra.style.setProperty('--dur', '0ms');
      barra.style.setProperty('--cheio', (inicio[i] / total).toFixed(4));
      void getComputedStyle(barra, '::after').transform;
      barra.style.setProperty('--dur', cenas[i].ms + 'ms');
      barra.style.setProperty('--cheio', ((inicio[i] + cenas[i].ms) / total).toFixed(4));
    };

    const cena = (i) => {
      const c = cenas[i];
      raiz.dataset.passo = c.passo;
      raiz.dataset.cena = c.c;
      rolarAte(c.rolo);
      qtd.textContent = c.mais ? '87' : '86';
      if (c.digita) digitar(); else if (!letra || digita.textContent.length === BUSCA.length) digita.textContent = BUSCA;
      if (c.toque) tocar(c.toque);
      encher(i);
      relogio = setTimeout(() => cena((i + 1) % cenas.length), c.ms);
    };
    return {
      tocar: () => { clearTimeout(relogio); cena(0); },
      parar: () => { clearTimeout(relogio); clearInterval(letra); letra = null; }
    };
  };

  const vitrine = document.querySelector('.vitrine');
  if (vitrine) {
    const tocadores = [...vitrine.querySelectorAll('.vida-video')].map(criarTocador);
    if (querMenosMovimento) {
      vitrine.querySelectorAll('.g-digita').forEach((d) => { d.textContent = BUSCA; });
    } else {
      /* Os quatro começam do início quando a vitrine aparece e param quando ela
         sai da tela. Medido na rolagem para funcionar também em janelas
         embutidas que atrasam o IntersectionObserver. */
      let tocando = false;
      const conferir = () => {
        const r = vitrine.getBoundingClientRect();
        const visivel = r.top < window.innerHeight * 0.8 && r.bottom > window.innerHeight * 0.2;
        if (visivel && !tocando) { tocando = true; tocadores.forEach((t) => t.tocar()); }
        else if (!visivel && tocando) { tocando = false; tocadores.forEach((t) => t.parar()); }
      };
      conferir();
      window.addEventListener('scroll', conferir, { passive: true });
      window.addEventListener('resize', conferir);
    }
  }

  /* 2 · Portfólio: roda só enquanto aparece (economiza bateria no celular) */
  const port = document.querySelector('.port');
  if (port && !querMenosMovimento) {
    new IntersectionObserver(([e]) => port.classList.toggle('in', e.isIntersecting), { threshold: 0.25 })
      .observe(port);
  }

  /* 3 · Formulário: o que a pessoa preencheu vira a mensagem do WhatsApp */
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
      const texto = `${VEIO} e quero o diagnóstico gratuito do meu perfil no Google.\n` +
        `Academia: ${academia}\nBairro e cidade: ${local}` + (nome ? `\nMeu nome: ${nome}` : '');
      const numero = String(PODIO.whatsapp).replace(/\D/g, '');
      window.open(`https://wa.me/${numero}?text=${encodeURIComponent(texto)}`, '_blank', 'noopener');
    });
  }
});
