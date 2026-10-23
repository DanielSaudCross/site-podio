/* ==========================================================
   VIDA DA PÁGINA (redesenho de outubro/2026)
   1. Seção do perfil: a rolagem escolhe o passo (0 a 3) e, dentro
      de cada passo, um roteiro com tempo troca a cena (digitar a
      busca, tocar em Rotas, abrir o mapa...).
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
    const BUSCA = 'academia de jiu-jitsu perto de mim';

    /* Posição de um elemento dentro da tela do celular, sem contar a escala
       do celular no telefone (offset ignora transform, que é o que queremos). */
    const posicao = (el) => {
      let x = el.offsetWidth / 2, y = el.offsetHeight / 2;
      for (let n = el; n && n !== tela; n = n.offsetParent) { x += n.offsetLeft; y += n.offsetTop; }
      return { x, y };
    };
    const rolarAte = (seletor) => {
      if (!seletor) { rolo.style.setProperty('--rolo', '0px'); return; }
      const alvo = rolo.querySelector(seletor);
      if (alvo) rolo.style.setProperty('--rolo', -Math.max(0, alvo.offsetTop - 6) + 'px');
    };
    const tocar = (seletor) => {
      const alvo = tela.querySelector(seletor);
      if (!alvo) return;
      const { x, y } = posicao(alvo);
      toque.style.setProperty('--tx', x + 'px');
      toque.style.setProperty('--ty', y + 'px');
      toque.classList.remove('on'); void toque.offsetWidth; toque.classList.add('on');
    };

    /* O roteiro de cada passo. ms = quanto a cena fica na tela.
       toque = onde o dedo encosta; rolo = até onde o perfil rola; acao = linha
       do texto que acende. O roteiro se repete enquanto o passo estiver na tela. */
    const ROTEIRO = {
      1: [
        { cena: 'perfil', ms: 2600 },
        { cena: 'perfil', ms: 2600, rolo: '.g-info' },
        { cena: 'perfil', ms: 2600, rolo: '.g-servicos' },
        { cena: 'perfil', ms: 1200 }
      ],
      2: [
        { cena: 'perfil', ms: 700, acao: 'rota' },
        { cena: 'perfil', ms: 550, acao: 'rota', toque: '.a-rota i' },
        { cena: 'mapa', ms: 2700, acao: 'rota' },
        { cena: 'perfil', ms: 600, acao: 'ligar' },
        { cena: 'perfil', ms: 550, acao: 'ligar', toque: '.a-ligar i' },
        { cena: 'ligar', ms: 2300, acao: 'ligar' },
        { cena: 'perfil', ms: 600, acao: 'site' },
        { cena: 'perfil', ms: 550, acao: 'site', toque: '.a-site i' },
        { cena: 'site', ms: 1500, acao: 'site' },
        { cena: 'site-toque', ms: 550, acao: 'site', toque: '.s-btn' },
        { cena: 'site-zap', ms: 3000, acao: 'site' }
      ],
      3: [
        { cena: 'nfc', ms: 2600 },
        { cena: 'avaliar', ms: 2600 },
        { cena: 'aval-nova', ms: 3400, rolo: '.g-avals', mais: 1 }
      ]
    };

    let passoAtual = -1, relogio = null, letra = null;
    const parar = () => { clearTimeout(relogio); clearInterval(letra); };

    const digitar = () => {
      let i = 0;
      digita.textContent = '';
      letra = setInterval(() => {
        digita.textContent = BUSCA.slice(0, ++i);
        if (i >= BUSCA.length) clearInterval(letra);
      }, 55);
    };

    const rodar = (passo, i = 0) => {
      const roteiro = ROTEIRO[passo];
      if (!roteiro) return;
      const c = roteiro[i % roteiro.length];
      vida.dataset.cena = c.cena;
      if (c.acao) vida.dataset.acao = c.acao; else delete vida.dataset.acao;
      rolarAte(c.rolo);
      if (c.toque) tocar(c.toque);
      qtd.textContent = c.mais ? '87' : '86';
      relogio = setTimeout(() => rodar(passo, i + 1), c.ms);
    };

    const entrarNoPasso = (passo) => {
      if (passo === passoAtual) return;
      passoAtual = passo;
      parar();
      vida.dataset.passo = passo;
      vida.dataset.cena = 'perfil';
      delete vida.dataset.acao;
      rolarAte(null);
      qtd.textContent = '86';
      if (passo === 0) digitar(); else digita.textContent = BUSCA;
      rodar(passo);
    };

    if (querMenosMovimento) {
      digita.textContent = BUSCA;
      vida.dataset.passo = '1';
    } else {
      let pedido = false;
      const medir = () => {
        pedido = false;
        const r = vida.getBoundingClientRect();
        const curso = r.height - window.innerHeight;
        const feito = Math.min(1, Math.max(0, -r.top / curso));
        entrarNoPasso(feito < 0.16 ? 0 : feito < 0.40 ? 1 : feito < 0.72 ? 2 : 3);
      };
      const aoRolar = () => { if (!pedido) { pedido = true; requestAnimationFrame(medir); } };
      /* A digitação começa quando a seção aparece, não ao abrir a página */
      new IntersectionObserver(([e]) => { if (e.isIntersecting) { passoAtual = -1; medir(); } }, { threshold: 0.3 })
        .observe(vida.querySelector('.vida-cel'));
      window.addEventListener('scroll', aoRolar, { passive: true });
      window.addEventListener('resize', aoRolar);
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
