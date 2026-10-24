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
      { p: 2, c: 'site', ms: 2000, a: 'site' },
      { p: 2, c: 'site', ms: 600, a: 'site', toque: '.s-btn' },
      { p: 2, c: 'site-zap', ms: 3300, a: 'site' },
      { p: 3, c: 'nfc', ms: 3600 },
      { p: 3, c: 'nfc', ms: 600, toque: '.nfc-notif' },
      { p: 3, c: 'avaliar', ms: 3000 },
      { p: 3, c: 'aval-nova', ms: 3600, rolo: '.g-avals', mais: true },
      { p: 3, c: 'aval-nova', ms: 1200, mais: true }
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
