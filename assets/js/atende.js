/* ==========================================================
   ATENDIMENTO NO WHATSAPP (BLOCO 05a)
   Um vídeo feito com o próprio HTML, como o da seção do perfil (vida.js):
   a conversa acontece mensagem por mensagem, o aluno salva a aula na
   agenda dele e, à noite, chega o lembrete, que termina com a rota. Por
   último, o celular da academia: a aula na agenda e o aviso ao dono. Começa quando a seção aparece,
   repete e pausa fora da tela.
   ========================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const sec = document.getElementById('atendimento');
  if (!sec) return;
  const querMenosMovimento = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  const tela = sec.querySelector('.cel-tela');
  const janela = sec.querySelector('.at-janela');
  const rolo = sec.querySelector('.at-rolo');
  const msgs = sec.querySelectorAll('.at-msg');
  const toque = sec.querySelector('.toque');
  const barras = sec.querySelectorAll('.vida-progresso i');
  const capitulos = sec.querySelectorAll('.vida-capitulos button');

  /* O VÍDEO: p = parte (texto da esquerda e barrinha); c = o que o celular
     mostra (chat, salvar, aluno, bloqueio, academia); ate = quantas mensagens
     já apareceram; dig = o atendimento está digitando; toque = onde o dedo
     encosta. O que a cena não diz, herda da anterior. */
  const VIDEO = [
    { p: 0, c: 'chat', ate: 0, ms: 900 },
    { p: 0, ate: 1, ms: 1300 },
    { p: 0, dig: true, ms: 900 },
    { p: 0, ate: 2, ms: 2600 },
    { p: 0, ate: 3, ms: 1100 },
    { p: 0, dig: true, ms: 700 },
    { p: 0, ate: 4, ms: 1700 },
    { p: 0, ate: 5, ms: 900 },
    { p: 0, dig: true, ms: 600 },
    { p: 0, ate: 6, ms: 1600 },
    { p: 0, ate: 7, ms: 900 },
    { p: 0, dig: true, ms: 600 },
    { p: 0, ate: 8, ms: 1700 },
    { p: 0, ate: 9, ms: 1000 },
    { p: 1, dig: true, ms: 900 },
    { p: 1, ate: 10, ms: 3600 },
    { p: 1, ate: 11, ms: 1300 },
    { p: 2, dig: true, ms: 900 },
    { p: 2, ate: 12, ms: 3800 },
    { p: 2, toque: '.at-salvar', ms: 700 },
    { p: 2, c: 'salvar', ms: 2300 },
    { p: 2, c: 'salvar', toque: '.at-btn-salvar', ms: 700 },
    { p: 2, c: 'aluno', ms: 3000 },
    { p: 3, c: 'bloqueio', ate: 12, ms: 1700 },
    { p: 3, c: 'bloqueio', toque: '.at-notif-bloq', ms: 600 },
    { p: 3, c: 'chat', ate: 14, ms: 3800 },
    { p: 4, c: 'academia', ms: 4200 }
  ];
  /* Herança: cada cena completa o que não disse com a anterior */
  VIDEO.forEach((v, i) => {
    const antes = VIDEO[i - 1] || {};
    if (v.c === undefined) v.c = antes.c;
    if (v.ate === undefined) v.ate = antes.ate;
  });
  const VELOCIDADE = 1.2;
  VIDEO.forEach((v) => { v.ms = Math.round(v.ms / VELOCIDADE); });
  const duracao = [0, 0, 0, 0, 0];
  const inicioNaParte = VIDEO.map((v) => { const t = duracao[v.p]; duracao[v.p] += v.ms; return t; });

  /* Mostra as mensagens até "ate" e desce a conversa até a última */
  const mostrar = (ate) => {
    msgs.forEach((m) => m.classList.toggle('on', Number(m.dataset.i) < ate));
    const sobra = rolo.scrollHeight - janela.clientHeight;
    rolo.style.setProperty('--rolo', (sobra > 0 ? -sobra : 0) + 'px');
  };

  const posicao = (el) => {
    let x = el.offsetWidth / 2, y = el.offsetHeight / 2;
    for (let n = el; n && n !== tela; n = n.offsetParent) { x += n.offsetLeft; y += n.offsetTop; }
    return { x, y };
  };
  const tocar = (seletor) => {
    const alvo = tela.querySelector(seletor);
    if (!alvo) return;
    let { x, y } = posicao(alvo);
    /* O link fica dentro da conversa, que pode estar rolada para cima */
    if (rolo.contains(alvo)) y += parseFloat(rolo.style.getPropertyValue('--rolo')) || 0;
    toque.style.setProperty('--tx', x + 'px');
    toque.style.setProperty('--ty', y + 'px');
    toque.classList.remove('on'); void toque.offsetWidth; toque.classList.add('on');
  };

  let atual = 0, relogio = null, tocando = false;
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

  const cena = (i) => {
    atual = i % VIDEO.length;
    const v = VIDEO[atual];
    sec.dataset.passo = v.p;
    sec.dataset.cena = v.c;
    if (v.dig) sec.dataset.dig = ''; else delete sec.dataset.dig;
    mostrar(v.ate);
    if (v.toque) tocar(v.toque);
    capitulos.forEach((b) => b.setAttribute('aria-current', b.dataset.ir === String(v.p)));
    desenharBarra(v, atual);
    clearTimeout(relogio);
    relogio = setTimeout(() => cena(atual + 1), v.ms);
  };
  const tocarVideo = (desde = 0) => { tocando = true; cena(desde); };
  const pausar = () => { tocando = false; clearTimeout(relogio); };

  capitulos.forEach((b) => b.addEventListener('click', () => {
    tocarVideo(VIDEO.findIndex((v) => v.p === Number(b.dataset.ir)));
  }));

  if (querMenosMovimento) {
    sec.dataset.passo = '2';
    sec.dataset.cena = 'chat';
    mostrar(12);
  } else {
    const caixa = sec.querySelector('.vida-cel');
    const conferir = () => {
      const r = caixa.getBoundingClientRect();
      const visivel = r.top < window.innerHeight * 0.7 && r.bottom > window.innerHeight * 0.3;
      if (visivel && !tocando) tocarVideo(0);
      else if (!visivel && tocando) pausar();
    };
    conferir();
    window.addEventListener('scroll', conferir, { passive: true });
    window.addEventListener('resize', conferir);
  }
});
