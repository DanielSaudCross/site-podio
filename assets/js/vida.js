/* ==========================================================
   VIDA DA PÁGINA (redesenho de outubro/2026)
   1. Seção do perfil: um vídeo feito com o próprio HTML, em 4 partes.
      Na primeira descida a rolagem troca a parte e cada uma toca no seu
      tempo, repetindo; depois de passar, vira um vídeo contínuo.
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

    /* O VÍDEO: cenas com duração (ms). p = parte do vídeo (texto da esquerda,
       palavra de fundo e segmento da barrinha); c = o que o celular mostra;
       toque = onde o dedo encosta; rolo = até onde o perfil desce;
       a = linha do texto que acende. */
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
      { p: 3, c: 'nfc', ms: 3000 },
      { p: 3, c: 'avaliar', ms: 3000 },
      { p: 3, c: 'aval-nova', ms: 3600, rolo: '.g-avals', mais: true },
      { p: 3, c: 'aval-nova', ms: 1200, mais: true }
    ];
    const PARTES = 4;
    /* Duração de cada parte, onde cada cena começa dentro dela e a primeira
       e a última cena de cada parte */
    const duracao = [0, 0, 0, 0];
    const inicioNaParte = VIDEO.map((v) => { const t = duracao[v.p]; duracao[v.p] += v.ms; return t; });
    const primeira = (p) => VIDEO.findIndex((v) => v.p === p);
    const ultima = (p) => VIDEO.length - 1 - [...VIDEO].reverse().findIndex((v) => v.p === p);

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
    /* parte = qual parte está repetindo (modo rolagem); null = vídeo inteiro */
    let atual = 0, relogio = null, letra = null, tocando = false, parte = null;

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
      }, 45);
    };

    const cena = (i) => {
      atual = i;
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
      /* Próxima cena: dentro da parte que está repetindo, ou do vídeo inteiro */
      const proxima = parte === null
        ? (atual + 1) % VIDEO.length
        : atual + 1 > ultima(parte) ? primeira(parte) : atual + 1;
      clearTimeout(relogio);
      relogio = setTimeout(() => cena(proxima), v.ms);
    };

    const tocarParte = (p) => {           /* modo rolagem: uma parte repetindo */
      if (tocando && parte === p) return;
      tocando = true; parte = p;
      cena(primeira(p));
    };
    const tocarVideo = (desde = 0) => {    /* depois de passar: vídeo inteiro */
      tocando = true; parte = null;
      cena(desde);
    };
    const pausar = () => {
      tocando = false;
      clearTimeout(relogio); clearInterval(letra);
    };

    if (querMenosMovimento) {
      digita.textContent = BUSCA;
      vida.dataset.passo = '1';
      vida.dataset.cena = 'perfil';
      capitulos.forEach((b) => b.addEventListener('click', () => {
        vida.dataset.passo = b.dataset.ir;
      }));
    } else {
      const caixa = vida.querySelector('.vida-cel');
      const vista = () => vida.classList.contains('vista');
      /* Na primeira descida a seção é alta e o palco fica parado: o trecho
         rolado escolhe a parte (Hoje, Perfil, Contato, Avaliações), e cada
         parte toca no seu tempo, repetindo até a pessoa rolar para a próxima. */
      const parteDaRolagem = () => {
        const r = vida.getBoundingClientRect();
        const curso = r.height - window.innerHeight;
        const feito = Math.min(0.999, Math.max(0, -r.top / curso));
        return Math.floor(feito * PARTES);
      };
      /* Toca enquanto o celular aparece; pausa quando sai da tela. Medido na
         rolagem para funcionar também em janelas embutidas. */
      const conferir = () => {
        const r = caixa.getBoundingClientRect();
        const visivel = r.top < window.innerHeight * 0.7 && r.bottom > window.innerHeight * 0.3;
        if (!visivel) { if (tocando) pausar(); return; }
        if (vista()) { if (!tocando) tocarVideo(0); } else tocarParte(parteDaRolagem());
      };
      /* Trava só na primeira passagem: quando a pessoa já desceu além da seção,
         ela volta ao tamanho normal e vira um vídeo contínuo. O encolhimento
         acontece acima da tela; para nada pular de lugar, mede-se onde a próxima
         seção estava e corrige-se só o que faltar. */
      const proxima = vida.nextElementSibling;
      const liberar = () => {
        if (vista() || vida.getBoundingClientRect().bottom > 0) return;
        const antes = proxima.getBoundingClientRect().top;
        vida.classList.add('vista');
        pausar();
        const diferenca = proxima.getBoundingClientRect().top - antes;
        if (diferenca) window.scrollBy({ top: diferenca, behavior: 'instant' });
      };
      /* Capítulos: na primeira descida levam ao trecho da parte; depois,
         pulam para aquela parte do vídeo contínuo */
      capitulos.forEach((b) => b.addEventListener('click', () => {
        const p = Number(b.dataset.ir);
        if (vista()) { tocarVideo(primeira(p)); return; }
        const curso = vida.offsetHeight - window.innerHeight;
        const topo = vida.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: topo + curso * (p + 0.5) / PARTES, behavior: 'smooth' });
      }));
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
