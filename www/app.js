/**
 * CromCalc 2026 — Lógica Restaurada e Corrigida
 */

const MM_POR_POL = 25.4;

const SERVICOS = {
    cromoCamada:     { nome: 'Cromo Camada',      calculo: (vb) => vb * 2 },
    cromagemCliente: { nome: 'Cromagem Cliente',   calculo: (vb) => vb / 0.85 },
    retifica:        { nome: 'Retífica',           calculo: (vb) => vb * 0.588 },
    mecanico:        { nome: 'Mecânico',           calculo: (vb) => vb }
};

const QUICK_SELECT = {
    mm: {
        diametro:    [10, 20, 30, 40, 50, 60, 80, 100],
        comprimento: [100, 200, 300, 500, 1000, 2000]
    },
    pol: {
        diametro:    [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3],
        comprimento: [2, 4, 6, 8, 10, 12]
    }
};

let state = {
    diametro: 0,
    comprimento: 0,
    servico: 'cromoCamada',
    unidade: 'mm'
};

function toMM(valor) {
    return state.unidade === 'pol' ? valor * MM_POR_POL : valor;
}

function calcularArea(diametro, comprimento) {
    if (diametro <= 0 || comprimento <= 0) return 0;
    return (Math.PI * diametro * comprimento) / 10000;
}

function obterConfigFaixa(diametro) {
    if (diametro > 50)  return { fator: 32.1, k: 0,   nome: 'Faixa 1 (>50)' };
    if (diametro > 25)  return { fator: 27.3, k: 35,  nome: 'Faixa 2 (26-50)' };
    if (diametro > 15)  return { fator: 24.1, k: 61,  nome: 'Faixa 3 (16-25)' };
    if (diametro > 10)  return { fator: 21.5, k: 125, nome: 'Faixa 4 (11-15)' };
    return { fator: 18.2, k: 300, nome: 'Faixa 5 (≤10)' };
}

function atualizarResultados() {
    const inD = document.getElementById('diametro');
    const inL = document.getElementById('comprimento');

    const dVal = parseFloat(inD.value) || 0;
    const lVal = parseFloat(inL.value) || 0;

    const diametroMM    = toMM(dVal);
    const comprimentoMM = toMM(lVal);

    const area = calcularArea(diametroMM, comprimentoMM);
    const config = obterConfigFaixa(diametroMM);
    const valorBase = area > 0 ? (area * config.fator) + config.k : 0;
    const precoFinal = SERVICOS[state.servico].calculo(valorBase);

    document.getElementById('result-area').textContent  = area > 0 ? area.toLocaleString('pt-BR', {minimumFractionDigits: 4, maximumFractionDigits: 4}) : '—';
    document.getElementById('result-faixa').textContent = area > 0 ? config.nome : '—';
    document.getElementById('result-base').textContent  = area > 0 ? valorBase.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '—';
    document.getElementById('result-preco').textContent = area > 0 ? precoFinal.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0,00';
    document.getElementById('price-service-label').textContent = SERVICOS[state.servico].nome;

    const priceDisplay = document.querySelector('.price-display');
    if (area > 0) priceDisplay.classList.add('has-value'); else priceDisplay.classList.remove('has-value');
}

function atualizarBotoesRapidos() {
    const u = state.unidade;

    ['diametro', 'comprimento'].forEach(campo => {
        const div = document.getElementById('qs-' + campo);
        if (!div) return;
        div.innerHTML = QUICK_SELECT[u][campo].map(v =>
            `<button type="button" onclick="setMedida('${campo}', ${v})">${v}</button>`
        ).join('');
    });

    document.querySelectorAll('.input-unit').forEach(el => {
        el.textContent = u === 'pol' ? 'pol' : 'mm';
    });

    document.getElementById('btn-unit-mm').classList.toggle('active', u === 'mm');
    document.getElementById('btn-unit-pol').classList.toggle('active', u === 'pol');
}

// FUNÇÕES GLOBAIS (Chamadas pelo HTML)
window.setMedida = function(campo, valor) {
    document.getElementById(campo).value = valor;
    atualizarResultados();
};

window.setServico = function(s) {
    state.servico = s;
    document.querySelectorAll('.service-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.id === 'btn-' + s) btn.classList.add('active');
    });
    atualizarResultados();
};

window.setUnidade = function(u) {
    if (state.unidade === u) return;
    // Converte o valor já digitado para a nova unidade
    ['diametro', 'comprimento'].forEach(campo => {
        const el = document.getElementById(campo);
        const v = parseFloat(el.value);
        if (v) {
            el.value = u === 'pol'
                ? (v / MM_POR_POL).toFixed(3).replace(/\.?0+$/, '')
                : (v * MM_POR_POL).toFixed(1).replace(/\.0$/, '');
        }
    });
    state.unidade = u;
    atualizarBotoesRapidos();
    atualizarResultados();
};

window.limparTudo = function() {
    document.getElementById('diametro').value = '';
    document.getElementById('comprimento').value = '';
    state.servico = 'cromoCamada';
    window.setServico('cromoCamada');
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('diametro').addEventListener('input', atualizarResultados);
    document.getElementById('comprimento').addEventListener('input', atualizarResultados);
    atualizarBotoesRapidos();
});
