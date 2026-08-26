/* ==========================================================
   CONFIGURAÇÕES DO SITE
   O único arquivo que precisa ser editado para trocar
   telefone ou mensagens. Nenhum link fica solto no HTML.
   ========================================================== */

const PODIO = {

  /* Só números: 55 + DDD + telefone. Sem espaço, traço ou parêntese. */
  whatsapp: '5500000000000',

  /* Mensagem que já vem escrita quando a pessoa abre a conversa.
     A chave (ex.: 'diagnostico') é o que fica no data-wa="" do HTML. */
  mensagens: {
    menu:         'Olá, vim pelo site da Agência Pódio.',
    diagnostico:  'Olá, quero o diagnóstico gratuito. Minha empresa é:',
    essencial:    'Olá, tenho interesse no plano Essencial.',
    crescimento:  'Olá, tenho interesse no plano Crescimento.',
    performance:  'Olá, tenho interesse no plano Performance.',
    flutuante:    'Olá, estava vendo o site e queria tirar uma dúvida.',
    rodape:       'Olá, vim pelo rodapé do site da Agência Pódio.'
  }

};

/* ----------------------------------------------------------
   Daqui para baixo não precisa mexer.
   Monta o link de cada botão marcado com data-wa no HTML.
   ---------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  const numero = String(PODIO.whatsapp).replace(/\D/g, '');

  document.querySelectorAll('[data-wa]').forEach((el) => {
    const chave = el.getAttribute('data-wa');
    const texto = PODIO.mensagens[chave] || PODIO.mensagens.menu;
    el.href = `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
    el.target = '_blank';
    el.rel = 'noopener';
  });

  /* Rolagem: o botão flutuante aparece e o menu do topo encolhe */
  const flutuante = document.querySelector('.wa-float');
  const menu = document.querySelector('.nav');

  const aoRolar = () => {
    const y = window.scrollY;
    if (flutuante) flutuante.classList.toggle('show', y > 420);
    if (menu) menu.classList.toggle('compacta', y > 40);
  };
  aoRolar();
  window.addEventListener('scroll', aoRolar, { passive: true });

  /* Bloco Antes / Depois: passar o cursor por uma coluna já a acende.
     Nada é escondido — só troca qual das duas está em destaque. */
  const transformacao = document.querySelector('.ad');
  if (transformacao) {
    const colunas = transformacao.querySelectorAll('.ad-col');

    const acender = (escolhida) => {
      colunas.forEach((c) => {
        const acesa = c === escolhida;
        c.classList.toggle('ativa', acesa);
        c.querySelector('.ad-tab').setAttribute('aria-pressed', acesa);
      });
    };

    colunas.forEach((coluna) => {
      /* No computador, o cursor basta. O clique continua valendo para o
         celular, onde cursor não existe, e o foco para quem usa teclado. */
      coluna.addEventListener('mouseenter', () => acender(coluna));
      coluna.addEventListener('focusin',    () => acender(coluna));
      coluna.querySelector('.ad-tab').addEventListener('click', () => acender(coluna));
    });
  }

  /* Cards de caso (BLOCO 05): fechar clicando em qualquer lugar.
     O <details> nativo só abre e fecha pelo <summary>. Fechado, o summary é
     o card inteiro, então clicar em qualquer ponto já funciona. Aberto, ele
     vira uma faixa fina no topo e o resto do card fica inerte — daí a
     sensação de que só o "x" fechava. Isto devolve o clique ao card todo. */
  document.querySelectorAll('.caso .caso-mais').forEach((corpo) => {
    corpo.addEventListener('click', (evento) => {
      /* Não fecha se a pessoa clicou num link, num botão, ou se está
         selecionando texto para copiar. */
      if (evento.target.closest('a,button,summary')) return;
      if (String(window.getSelection())) return;
      corpo.closest('details').open = false;
    });
  });

  /* Um card de caso aberto por vez.
     O atributo name="casos" nos <details> já faz a sanfona sozinho nos
     navegadores atuais. Este trecho só entra em ação nos que ainda não
     entendem o atributo, para o comportamento não mudar conforme o aparelho. */
  if (!('name' in HTMLDetailsElement.prototype)) {
    const sanfona = document.querySelectorAll('.casos > details[name]');
    sanfona.forEach((card) => {
      card.addEventListener('toggle', () => {
        if (!card.open) return;
        sanfona.forEach((outro) => { if (outro !== card) outro.open = false; });
      });
    });
  }

  /* Animação de entrada dos blocos */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.rv').forEach((el, i) => {
    el.style.transitionDelay = (i % 3) * 90 + 'ms';
    io.observe(el);
  });

  /* ----------------------------------------------------------
     Cursor próprio: um ponto de ouro no lugar da seta, e um anel
     que vem atrás com um atraso leve.
     O ponto acompanha o mouse na hora. Só o anel é que se atrasa —
     é o que dá a sensação de rastro sem parecer travamento.
     Não liga no celular (não existe mouse) nem para quem pediu
     menos animação nas preferências do sistema.
     ---------------------------------------------------------- */
  const temMouse = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  const querMenosMovimento = window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  if (temMouse && !querMenosMovimento) {
    const ponto = document.createElement('div');
    const anel  = document.createElement('div');
    ponto.className = 'cursor-ponto';
    anel.className  = 'cursor-anel';
    [ponto, anel].forEach((el) => {
      el.setAttribute('aria-hidden', 'true');
      document.body.appendChild(el);
    });

    /* Só agora a seta do sistema pode sumir: os substitutos já existem. */
    document.documentElement.classList.add('cursor-proprio');

    let alvoX = 0, alvoY = 0;   /* onde o mouse está */
    let anelX = 0, anelY = 0;   /* onde o anel está, correndo atrás */

    const posicionar = (el, x, y) => {
      el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    };

    document.addEventListener('mousemove', (e) => {
      alvoX = e.clientX;
      alvoY = e.clientY;
      posicionar(ponto, alvoX, alvoY);   /* sem atraso nenhum */
      ponto.classList.add('acesa');
      anel.classList.add('acesa');

      /* Só o anel abre sobre o que é clicável. O ponto nunca muda. */
      anel.classList.toggle('perto', !!(e.target.closest &&
        e.target.closest('a,button,summary,input,select,textarea,.plan,.card')));
    });

    document.addEventListener('mouseleave', () => {
      ponto.classList.remove('acesa');
      anel.classList.remove('acesa');
    });

    /* 0.35 = o quanto o anel alcança o ponto a cada quadro.
       Maior, mais colado. Menor, mais preguiçoso. Antes era 0.18. */
    (function seguir() {
      anelX += (alvoX - anelX) * 0.35;
      anelY += (alvoY - anelY) * 0.35;
      posicionar(anel, anelX, anelY);
      requestAnimationFrame(seguir);
    })();
  }
});
