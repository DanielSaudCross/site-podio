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

  /* Bloco Antes / Depois: os próprios títulos são o interruptor.
     Nada é escondido — só troca qual coluna está acesa. */
  const transformacao = document.querySelector('.ad');
  if (transformacao) {
    const colunas = transformacao.querySelectorAll('.ad-col');
    colunas.forEach((coluna) => {
      coluna.querySelector('.ad-tab').addEventListener('click', () => {
        colunas.forEach((c) => {
          const acesa = c === coluna;
          c.classList.toggle('ativa', acesa);
          c.querySelector('.ad-tab').setAttribute('aria-pressed', acesa);
        });
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
     Holofote: um brilho que segue o mouse com um atraso leve.
     O cursor normal continua ali — isto só acompanha ele.
     Não liga no celular (não existe mouse) nem para quem pediu
     menos animação nas preferências do sistema.
     ---------------------------------------------------------- */
  const temMouse = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  const querMenosMovimento = window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  if (temMouse && !querMenosMovimento) {
    const luz = document.createElement('div');
    luz.className = 'holofote';
    luz.setAttribute('aria-hidden', 'true');
    document.body.appendChild(luz);

    let alvoX = 0, alvoY = 0;   /* onde o mouse está */
    let luzX = 0,  luzY = 0;    /* onde a luz está, correndo atrás */

    document.addEventListener('mousemove', (e) => {
      alvoX = e.clientX;
      alvoY = e.clientY;
      luz.classList.add('acesa');
      /* Cresce quando passa por cima de algo clicável */
      luz.classList.toggle('perto', !!e.target.closest('a,button,summary,.plan,.card'));
    });

    document.addEventListener('mouseleave', () => luz.classList.remove('acesa'));

    /* 0.18 = o quanto ela alcança o mouse a cada quadro. Menor, mais preguiçosa. */
    (function seguir() {
      luzX += (alvoX - luzX) * 0.18;
      luzY += (alvoY - luzY) * 0.18;
      luz.style.transform = `translate(${luzX}px, ${luzY}px) translate(-50%, -50%)`;
      requestAnimationFrame(seguir);
    })();
  }
});
