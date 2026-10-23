/* ==========================================================
   VIDA DA PÁGINA (redesenho de outubro/2026)
   1. Seção do perfil: mede a rolagem e troca o passo (0 a 3).
   2. O celular inclina de leve seguindo o mouse.
   3. Portfólio: o vídeo só roda quando está na tela.
   4. Formulário do fim: monta a mensagem e abre o WhatsApp.
   ========================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const querMenosMovimento = window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* 1 · Passos da seção viva */
  const vida = document.querySelector('.vida');
  if (vida) {
    if (querMenosMovimento) {
      vida.dataset.passo = '3';
    } else {
      let pedido = false;
      const medir = () => {
        pedido = false;
        const r = vida.getBoundingClientRect();
        const curso = r.height - window.innerHeight;
        const feito = Math.min(1, Math.max(0, -r.top / curso));
        /* O passo 0 (perfil cru) ocupa o começo; os três passos dividem o resto */
        const passo = feito < 0.14 ? 0 : feito < 0.42 ? 1 : feito < 0.70 ? 2 : 3;
        if (vida.dataset.passo !== String(passo)) vida.dataset.passo = passo;
      };
      const aoRolar = () => { if (!pedido) { pedido = true; requestAnimationFrame(medir); } };
      medir();
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
