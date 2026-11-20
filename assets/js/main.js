// ===== Fundo animado: rede de partículas =====
const canvas = document.getElementById('fundo');
const ctx = canvas.getContext('2d');
const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let particulas = [];
const mouse = { x: null, y: null };

function ajustarCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const quantidade = Math.min(90, Math.floor((innerWidth * innerHeight) / 16000));
    particulas = Array.from({ length: quantidade }, () => ({
        x: Math.random() * innerWidth,
        y: Math.random() * innerHeight,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.6
    }));
}

function desenhar() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    const distancia = 130;

    for (let i = 0; i < particulas.length; i++) {
        const p = particulas[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > innerWidth) p.vx *= -1;
        if (p.y < 0 || p.y > innerHeight) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(140, 190, 255, 0.7)';
        ctx.fill();

        for (let j = i + 1; j < particulas.length; j++) {
            const q = particulas[j];
            const d = Math.hypot(p.x - q.x, p.y - q.y);
            if (d < distancia) {
                ctx.strokeStyle = `rgba(79, 140, 255, ${0.18 * (1 - d / distancia)})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(q.x, q.y);
                ctx.stroke();
            }
        }

        if (mouse.x !== null) {
            const dm = Math.hypot(p.x - mouse.x, p.y - mouse.y);
            if (dm < 180) {
                ctx.strokeStyle = `rgba(56, 225, 255, ${0.35 * (1 - dm / 180)})`;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.stroke();
            }
        }
    }
    if (!reduzirMovimento) requestAnimationFrame(desenhar);
}

ajustarCanvas();
desenhar();
window.addEventListener('resize', ajustarCanvas);

// Luz que segue o mouse
const luz = document.querySelector('.cursor-luz');
window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    luz.style.left = e.clientX + 'px';
    luz.style.top = e.clientY + 'px';
});
document.addEventListener('mouseleave', () => { mouse.x = mouse.y = null; });

// ===== Efeito de digitação =====
const frases = [
    'Desenvolvedor web em formação',
    'PHP · Node.js · MySQL · Docker',
    'Sistemas do banco à interface',
    'Pronto para o primeiro desafio em TI'
];
const alvo = document.getElementById('digitando');
let fraseAtual = 0, letra = 0, apagando = false;

function digitar() {
    const frase = frases[fraseAtual];
    alvo.textContent = frase.slice(0, letra);

    if (!apagando && letra < frase.length) {
        letra++;
        setTimeout(digitar, 65);
    } else if (!apagando) {
        apagando = true;
        setTimeout(digitar, 1800);
    } else if (letra > 0) {
        letra--;
        setTimeout(digitar, 30);
    } else {
        apagando = false;
        fraseAtual = (fraseAtual + 1) % frases.length;
        setTimeout(digitar, 300);
    }
}
digitar();

// ===== Menu, topo e barra de progresso =====
const topo = document.querySelector('.topo');
const progresso = document.querySelector('.progresso');
const menu = document.querySelector('.menu');
const menuBotao = document.querySelector('.menu-botao');
const linksMenu = document.querySelectorAll('.menu a');
const secoes = document.querySelectorAll('main section[id]');

window.addEventListener('scroll', () => {
    topo.classList.toggle('rolado', scrollY > 30);
    const total = document.documentElement.scrollHeight - innerHeight;
    progresso.style.width = (scrollY / total) * 100 + '%';

    let atual = '';
    secoes.forEach((s) => { if (scrollY >= s.offsetTop - 160) atual = s.id; });
    linksMenu.forEach((a) => a.classList.toggle('ativo', a.getAttribute('href') === '#' + atual));
});

menuBotao.addEventListener('click', () => {
    const aberto = menu.classList.toggle('aberto');
    menuBotao.classList.toggle('aberto', aberto);
    menuBotao.setAttribute('aria-expanded', aberto);
    document.body.style.overflow = aberto ? 'hidden' : '';
});

linksMenu.forEach((a) => a.addEventListener('click', () => {
    menu.classList.remove('aberto');
    menuBotao.classList.remove('aberto');
    menuBotao.setAttribute('aria-expanded', false);
    document.body.style.overflow = '';
}));

// ===== Revelar ao rolar + contadores =====
function contar(el) {
    const fim = Number(el.dataset.contar);
    const sufixo = el.dataset.sufixo || '';
    const inicio = performance.now();
    const passo = (agora) => {
        const t = Math.min((agora - inicio) / 1400, 1);
        el.textContent = Math.round(fim * (1 - Math.pow(1 - t, 3))) + sufixo;
        if (t < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
}

const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        const el = entrada.target;
        el.classList.add('visivel');
        setTimeout(() => { el.style.transitionDelay = '0s'; }, 1000);
        entrada.target.querySelectorAll('[data-contar]').forEach(contar);
        observador.unobserve(entrada.target);
    });
}, { threshold: 0.15 });

document.querySelectorAll('.revelar').forEach((el, i) => {
    el.style.transitionDelay = (i % 3) * 0.08 + 's';
    observador.observe(el);
});

// ===== Filtro de projetos =====
const filtros = document.querySelectorAll('.filtro');
const cards = document.querySelectorAll('.projeto-card');

filtros.forEach((botao) => botao.addEventListener('click', () => {
    filtros.forEach((b) => b.classList.remove('ativo'));
    botao.classList.add('ativo');
    const f = botao.dataset.filtro;
    cards.forEach((card) => {
        const mostrar = f === 'todos' || card.dataset.cat.split(' ').includes(f);
        card.classList.toggle('escondido', !mostrar);
    });
}));

// ===== Inclinação 3D nos cards =====
if (!reduzirMovimento && matchMedia('(hover: hover)').matches) {
    cards.forEach((card) => {
        card.addEventListener('mousemove', (e) => {
            const r = card.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            card.style.transform = `perspective(900px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg) translateY(-6px)`;
        });
        card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
}

document.getElementById('ano').textContent = new Date().getFullYear();
