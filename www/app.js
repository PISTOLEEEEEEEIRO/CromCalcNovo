/**
 * CromCalc 2026 — Lógica Restaurada e Corrigida
 */

const MM_POR_POL = 25.4;

const SERVICOS = {
    cromoCamada:     { nome: ‘Cromo Camada’,      calculo: (vb) => vb * 2 },
    cromagemCliente: { nome: ‘Cromagem Cliente’,   calculo: (vb) => vb / 0.85 },
    retifica:        { nome: ‘Retífica’,           calculo: (vb) => vb * 0.588 },
    mecanico:        { nome: ‘Mecânico’,           calculo: (vb) => vb }
};

const QUICK_SELECT_D = {
    mm:  [10, 20, 30, 40, 50, 60, 80, 100],
    pol: [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3]
};
const QUICK_SELECT_L = [100, 200, 300, 500, 1000, 2000];

let state = {
    servico: ‘cromoCamada’,
    unidadeD: ‘mm’   // unidade do diâmetro; comprimento é sempre mm
};

function parseValor(raw) {
    // Aceita “2”, “2\””, “2””, “1.5”, “1,5”
    return parseFloat(raw.replace(/[“””’’]/g, ‘’).replace(‘,’, ‘.’).trim()) || 0;
}

function calcularArea(diametro, comprimento) {
    if (diametro <= 0 || comprimento <= 0) return 0;
    return (Math.PI * diametro * comprimento) / 10000;
}

function obterConfigFaixa(diametro) {
    if (diametro > 50)  return { fator: 32.1, k: 0,   nome: ‘Faixa 1 (>50)’ };
    if (diametro > 25)  return { fator: 27.3, k: 35,  nome: ‘Faixa 2 (26-50)’ };
    if (diametro > 15)  return { fator: 24.1, k: 61,  nome: ‘Faixa 3 (16-25)’ };
    if (diametro > 10)  return { fator: 21.5, k: 125, nome: ‘Faixa 4 (11-15)’ };
    return { fator: 18.2, k: 300, nome: ‘Faixa 5 (≤10)’ };
}

function atualizarResultados() {
    const dRaw = document.getElementById(‘diametro’).value;
    const lRaw = document.getElementById(‘comprimento’).value;

    const dVal = parseValor(dRaw);
    const lVal = parseValor(lRaw);

    const diametroMM    = state.unidadeD === ‘pol’ ? dVal * MM_POR_POL : dVal;
    const comprimentoMM = lVal; // sempre mm

    const area = calcularArea(diametroMM, comprimentoMM);
    const config = obterConfigFaixa(diametroMM);
    const valorBase = area > 0 ? (area * config.fator) + config.k : 0;
    const precoFinal = SERVICOS[state.servico].calculo(valorBase);

    document.getElementById(‘result-area’).textContent  = area > 0 ? area.toLocaleString(‘pt-BR’, {minimumFractionDigits: 4, maximumFractionDigits: 4}) : ‘—‘;
    document.getElementById(‘result-faixa’).textContent = area > 0 ? config.nome : ‘—‘;
    document.getElementById(‘result-base’).textContent  = area > 0 ? valorBase.toLocaleString(‘pt-BR’, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : ‘—‘;
    document.getElementById(‘result-preco’).textContent = area > 0 ? precoFinal.toLocaleString(‘pt-BR’, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : ‘0,00’;
    document.getElementById(‘price-service-label’).textContent = SERVICOS[state.servico].nome;

    const priceDisplay = document.querySelector(‘.price-display’);
    if (area > 0) priceDisplay.classList.add(‘has-value’); else priceDisplay.classList.remove(‘has-value’);
}

function atualizarBotoesD() {
    const u = state.unidadeD;
    const div = document.getElementById(‘qs-diametro’);
    if (div) {
        div.innerHTML = QUICK_SELECT_D[u].map(v =>
            `<button type=”button” onclick=”setMedida(‘diametro’, ${v})”>${v}</button>`
        ).join(‘’);
    }
    document.getElementById(‘unit-diametro’).textContent = u;
    document.getElementById(‘btn-unit-mm’).classList.toggle(‘active’, u === ‘mm’);
    document.getElementById(‘btn-unit-pol’).classList.toggle(‘active’, u === ‘pol’);
}

// FUNÇÕES GLOBAIS (Chamadas pelo HTML)
window.setMedida = function(campo, valor) {
    document.getElementById(campo).value = valor;
    atualizarResultados();
};

window.setServico = function(s) {
    state.servico = s;
    document.querySelectorAll(‘.service-btn’).forEach(btn => {
        btn.classList.remove(‘active’);
        if (btn.id === ‘btn-’ + s) btn.classList.add(‘active’);
    });
    atualizarResultados();
};

window.setUnidade = function(u) {
    if (state.unidadeD === u) return;
    const el = document.getElementById(‘diametro’);
    const v = parseValor(el.value);
    if (v) {
        el.value = u === ‘pol’
            ? (v / MM_POR_POL).toFixed(3).replace(/\.?0+$/, ‘’)
            : (v * MM_POR_POL).toFixed(1).replace(/\.0$/, ‘’);
    }
    state.unidadeD = u;
    atualizarBotoesD();
    atualizarResultados();
};

window.limparTudo = function() {
    document.getElementById(‘diametro’).value = ‘’;
    document.getElementById(‘comprimento’).value = ‘’;
    state.servico = ‘cromoCamada’;
    window.setServico(‘cromoCamada’);
};

// Inicialização
document.addEventListener(‘DOMContentLoaded’, () => {
    document.getElementById(‘diametro’).addEventListener(‘input’, atualizarResultados);
    document.getElementById(‘comprimento’).addEventListener(‘input’, atualizarResultados);

    // botões fixos de comprimento
    const qsL = document.getElementById(‘qs-comprimento’);
    if (qsL) {
        qsL.innerHTML = QUICK_SELECT_L.map(v =>
            `<button type=”button” onclick=”setMedida(‘comprimento’, ${v})”>${v}</button>`
        ).join(‘’);
    }
    atualizarBotoesD();
});
