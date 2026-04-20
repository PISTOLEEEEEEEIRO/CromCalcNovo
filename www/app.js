/**
 * CromCalc 2026 — Lógica Restaurada e Corrigida
 */

const SERVICOS = {
    cromoCamada:     { nome: 'Cromo Camada',      calculo: (vb) => vb * 2 },
    cromagemCliente: { nome: 'Cromagem Cliente',   calculo: (vb) => vb / 0.85 },
    retifica:        { nome: 'Retífica',           calculo: (vb) => vb * 0.588 },
    mecanico:        { nome: 'Mecânico',           calculo: (vb) => vb }
};

let state = {
    diametro: 0,
    comprimento: 0,
    servico: 'cromoCamada'
};

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

    state.diametro = parseFloat(inD.value) || 0;
    state.comprimento = parseFloat(inL.value) || 0;

    const area = calcularArea(state.diametro, state.comprimento);
    const config = obterConfigFaixa(state.diametro);
    const valorBase = area > 0 ? (area * config.fator) + config.k : 0;
    const precoFinal = SERVICOS[state.servico].calculo(valorBase);

    // Atualiza a UI
    document.getElementById('result-area').textContent = area > 0 ? area.toLocaleString('pt-BR', {minimumFractionDigits: 4, maximumFractionDigits: 4}) : '—';
    document.getElementById('result-faixa').textContent = area > 0 ? config.nome : '—';
    document.getElementById('result-base').textContent = area > 0 ? valorBase.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '—';
    document.getElementById('result-preco').textContent = area > 0 ? precoFinal.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0,00';
    document.getElementById('price-service-label').textContent = SERVICOS[state.servico].nome;

    const priceDisplay = document.querySelector('.price-display');
    if (area > 0) priceDisplay.classList.add('has-value'); else priceDisplay.classList.remove('has-value');
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
});
