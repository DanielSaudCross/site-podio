/* ==========================================================
   CONFIGURAÇÕES DO SITE
   O único arquivo que precisa ser editado para trocar
   telefone ou mensagens. Nenhum link fica solto no HTML.
   ========================================================== */

/* ----------------------------------------------------------
   AS MENSAGENS DOS BOTÕES

   Elas são AVISO DE CHEGADA, não formulário. Servem para dizer
   duas coisas e nada mais: que a pessoa veio do site, e o que
   ela já estava olhando quando decidiu chamar.

   Não peça empresa nem cidade aqui. O texto chega pronto e a
   pessoa envia sem editar, então campo em branco chega em
   branco quase sempre, e a mensagem parece defeituosa.
   Esses dados são coletados DEPOIS, na resposta automática,
   quando já existe uma conversa aberta.

   Todas começam com "Vim pelo site da Agência Pódio": é a marca
   comum que permite à automação separar quem chegou pelo site
   de quem achou o número em qualquer outro lugar. O que vem
   depois dessa frase é a intenção.
   ---------------------------------------------------------- */
const VEIO = 'Olá! 👋 Vim pelo site da Agência Pódio';

const PODIO = {

  /* Só números: 55 + DDD + telefone. Sem espaço, traço ou parêntese.
     ATENÇÃO: precisa ser o MESMO número conectado na instância da Evolution
     API, senão as mensagens chegam numa conta que a automação não observa. */
  whatsapp: '5561981124779',

  /* A chave (ex.: 'diagnostico') é o que fica no data-wa="" do HTML. */
  mensagens: {

    /* Passeando. Quatro botões, mesma intenção: só quer falar. */
    menu:      VEIO + '.',
    flutuante: VEIO + '.',
    rodape:    VEIO + '.',

    /* Pediu algo concreto. */
    diagnostico: VEIO + ' e quero o diagnóstico gratuito do meu perfil no Google.',

    /* Já escolheu plano. É a intenção mais alta que existe no site. */
    essencial:   VEIO + ' e tenho interesse no plano Essencial.',
    crescimento: VEIO + ' e tenho interesse no plano Crescimento.',
    performance: VEIO + ' e tenho interesse no plano Performance.'
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

  /* ----------------------------------------------------------
     Menu do celular
     Abre e fecha o painel, prende o foco do teclado dentro dele
     enquanto está aberto e devolve o foco ao botão ao fechar.
     ---------------------------------------------------------- */
  const botaoMenu = document.querySelector('.menu-btn');
  const painel = document.querySelector('.menu-painel');

  if (botaoMenu && painel) {
    const focaveis = () => painel.querySelectorAll('a[href], button');
    /* O primeiro foco vai para o fechar, não para o primeiro link: quem abriu
       sem querer precisa da saída à mão antes da navegação. */

    const abrir = () => {
      painel.hidden = false;
      painel.classList.add('aberto');
      botaoMenu.setAttribute('aria-expanded', 'true');
      botaoMenu.setAttribute('aria-label', 'Fechar o menu');
      /* Trava a rolagem de trás: sem isto a página corre por baixo do painel. */
      document.body.style.overflow = 'hidden';
      const saida = painel.querySelector('.menu-fechar') || focaveis()[0];
      if (saida) saida.focus();
    };

    const fechar = (devolverFoco) => {
      painel.classList.remove('aberto');
      painel.hidden = true;
      botaoMenu.setAttribute('aria-expanded', 'false');
      botaoMenu.setAttribute('aria-label', 'Abrir o menu');
      document.body.style.overflow = '';
      if (devolverFoco) botaoMenu.focus();
    };

    botaoMenu.addEventListener('click', () => {
      painel.classList.contains('aberto') ? fechar(true) : abrir();
    });

    /* O X de dentro do painel. Existe porque o painel cobre a barra, e o
       hambúrguer fica atrás dele: no celular não há tecla Esc. */
    const fecharBtn = painel.querySelector('.menu-fechar');
    if (fecharBtn) fecharBtn.addEventListener('click', () => fechar(true));

    /* Tocar num link fecha o painel: senão ele cobriria a seção de destino. */
    painel.addEventListener('click', (e) => {
      if (e.target.closest('a')) fechar(false);
    });

    document.addEventListener('keydown', (e) => {
      if (!painel.classList.contains('aberto')) return;
      if (e.key === 'Escape') { fechar(true); return; }
      /* Foco preso: o Tab circula dentro do painel em vez de vazar para a
         página de trás, que continua ali mas escondida. */
      if (e.key === 'Tab') {
        const itens = focaveis();
        if (!itens.length) return;
        const primeiro = itens[0], ultimo = itens[itens.length - 1];
        if (e.shiftKey && document.activeElement === primeiro) {
          e.preventDefault(); ultimo.focus();
        } else if (!e.shiftKey && document.activeElement === ultimo) {
          e.preventDefault(); primeiro.focus();
        }
      }
    });

    /* Se a pessoa girar o aparelho e virar tela larga, o painel não pode
       ficar aberto: acima de 900px ele nem deveria existir. */
    window.matchMedia('(min-width:901px)').addEventListener('change', (ev) => {
      if (ev.matches && painel.classList.contains('aberto')) fechar(false);
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

    let ultimoAlvo = null;      /* evita repetir o closest() no mesmo elemento */
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

      perseguir();

      /* Só o anel abre sobre o que é clicável. O ponto nunca muda.
         O closest() varre a árvore acima do elemento, e mousemove dispara
         dezenas de vezes por segundo. Como o alvo só muda quando o ponteiro
         troca de elemento, guardamos o último e evitamos a varredura repetida. */
      if (e.target !== ultimoAlvo) {
        ultimoAlvo = e.target;
        anel.classList.toggle('perto', !!(e.target.closest &&
          e.target.closest('a,button,summary,input,select,textarea,.plan,.card')));
      }
    });

    document.addEventListener('mouseleave', () => {
      ponto.classList.remove('acesa');
      anel.classList.remove('acesa');
    });

    /* 0.35 = o quanto o anel alcança o ponto a cada quadro.
       Maior, mais colado. Menor, mais preguiçoso.

       O laço PARA quando o anel alcança o ponto. Antes ele rodava para sempre,
       mesmo com o mouse imóvel, mantendo o navegador acordado sem necessidade.
       Agora o mousemove religa quando há o que perseguir. */
    let perseguindo = false;

    const seguir = () => {
      const dx = alvoX - anelX;
      const dy = alvoY - anelY;
      if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) { perseguindo = false; return; }
      anelX += dx * 0.35;
      anelY += dy * 0.35;
      posicionar(anel, anelX, anelY);
      requestAnimationFrame(seguir);
    };

    const perseguir = () => {
      if (perseguindo) return;
      perseguindo = true;
      requestAnimationFrame(seguir);
    };
  }
});
