/* ==========================================================
   VIDA DA PÁGINA (redesenho de outubro/2026)
   1. Seção do perfil: a ROLAGEM é o controle do vídeo. Cada trecho
      da seção é uma cena completa (digitar a busca, perfil completo,
      mapa, WhatsApp...). Rolar para cima volta a cena, como rebobinar;
      nada depende de relógio, então nada é cortado no meio.
   2. O celular inclina de leve seguindo o mouse.
   3. Portfólio: o vídeo só roda quando está na tela.
   4. Formulário do fim: monta a mensagem e abre o WhatsApp.
   ========================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const querMenosMovimento = window.matchMedia('(prefers-reduced-motion:reduce)').matches;

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

    /* As cenas, na ordem da rolagem. passo = qual texto e qual palavra de
       fundo; cena = o que o celular mostra; toque = onde o dedo encosta antes
       de abrir a cena; antes = o que fica na tela enquanto o dedo toca;
       rolo = até onde o perfil desce; acao = linha do texto que acende. */
    const CENAS = [
      { passo: 0, cena: 'hoje', digita: true },
      { passo: 1, cena: 'perfil' },
      { passo: 1, cena: 'perfil', rolo: '.g-info' },
      { passo: 1, cena: 'perfil', rolo: '.g-servicos' },
      { passo: 2, cena: 'mapa', acao: 'rota', toque: '.a-rota i' },
      { passo: 2, cena: 'ligar', acao: 'ligar', toque: '.a-ligar i' },
      { passo: 2, cena: 'site', acao: 'site', toque: '.a-site i' },
      { passo: 2, cena: 'site-zap', acao: 'site', toque: '.s-btn', antes: 'site' },
      { passo: 3, cena: 'nfc' },
      { passo: 3, cena: 'avaliar' },
      { passo: 3, cena: 'aval-nova', rolo: '.g-avals', mais: true }
    ];
    /* Quantas cenas cada passo tem: é o tamanho de cada segmento da barrinha */
    const porPasso = [0, 0, 0, 0];
    CENAS.forEach((c) => porPasso[c.passo]++);

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

    let atual = -1, espera = null;
    const mostrar = (i) => {
      if (i === atual) return;
      const indo = i > atual;
      atual = i;
      clearTimeout(espera);
      const c = CENAS[i];
      vida.dataset.passo = c.passo;
      if (c.acao) vida.dataset.acao = c.acao; else delete vida.dataset.acao;
      qtd.textContent = c.mais ? '87' : '86';
      /* Indo para frente, o dedo toca o botão e só então a tela abre.
         Voltando (rebobinando), a cena aparece direto. */
      if (c.toque && indo) {
        vida.dataset.cena = c.antes || 'perfil';
        rolarAte(null);
        tocar(c.toque);
        espera = setTimeout(() => { vida.dataset.cena = c.cena; rolarAte(c.rolo); }, 420);
      } else {
        vida.dataset.cena = c.cena;
        rolarAte(c.rolo);
      }
    };

    if (querMenosMovimento) {
      digita.textContent = BUSCA;
      vida.dataset.passo = '1';
      vida.dataset.cena = 'perfil';
    } else {
      /* Uma leitura de posição por evento de rolagem é barata, e chamar direto
         (sem esperar o próximo quadro) garante a troca mesmo em aba sem foco. */
      const medir = () => {
        const r = vida.getBoundingClientRect();
        const curso = r.height - window.innerHeight;
        const feito = Math.min(0.9999, Math.max(0, -r.top / curso));
        const pos = feito * CENAS.length;
        const i = Math.floor(pos);
        mostrar(i);
        /* A busca vai sendo digitada conforme a rolagem da primeira cena */
        const letras = i === 0 ? Math.round(Math.min(1, (pos - i) / 0.7) * BUSCA.length) : BUSCA.length;
        if (digita.textContent.length !== letras) digita.textContent = BUSCA.slice(0, letras);
        /* Barrinha de progresso: um segmento por passo, enchendo com a rolagem */
        let antes = 0;
        barras.forEach((b, p) => {
          const cheio = Math.min(1, Math.max(0, (pos - antes) / porPasso[p]));
          b.style.setProperty('--cheio', cheio.toFixed(3));
          antes += porPasso[p];
        });
      };
      medir();
      window.addEventListener('scroll', medir, { passive: true });
      window.addEventListener('resize', medir);
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
      const texto = `${VEIO} e quero o diagnóstico gratuito do meu perfil no Google.\n` +
        `Academia: ${academia}\nBairro e cidade: ${local}` + (nome ? `\nMeu nome: ${nome}` : '');
      const numero = String(PODIO.whatsapp).replace(/\D/g, '');
      window.open(`https://wa.me/${numero}?text=${encodeURIComponent(texto)}`, '_blank', 'noopener');
    });
  }
});
