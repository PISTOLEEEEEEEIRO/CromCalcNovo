const MM_POR_POL = 25.4;

const SERVICOS = {
    cromoCamada:     { nome: 'Cromo Camada',     calculo: function(vb) { return vb * 2; } },
    cromagemCliente: { nome: 'Cromagem Cliente',  calculo: function(vb) { return vb / 0.85; } },
    retifica:        { nome: 'Retifica',          calculo: function(vb) { return vb * 0.588; } },
    mecanico:        { nome: 'Mecanico',          calculo: function(vb) { return vb; } }
};

const QUICK_D = {
    mm:  [10, 20, 30, 40, 50, 60, 80, 100],
    pol: [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3]
};
const QUICK_L = [100, 200, 300, 500, 1000, 2000];

var state = {
    servico: 'cromoCamada',
    unidadeD: 'mm'
};

function parseValor(raw) {
    var s = raw.replace(/[“””’’’]/g, ‘’).replace(‘,’, ‘.’).trim();
    // Formato fracionario: “2.1/2” ou “1.3/4” (inteiro + fracao)
    var mFrac = s.match(/^(\d+)\.(\d+)\/(\d+)$/);
    if (mFrac) return parseInt(mFrac[1]) + parseInt(mFrac[2]) / parseInt(mFrac[3]);
    // Fracao pura: “1/2” ou “3/4”
    var mPure = s.match(/^(\d+)\/(\d+)$/);
    if (mPure) return parseInt(mPure[1]) / parseInt(mPure[2]);
    return parseFloat(s) || 0;
}

function calcularArea(d, l) {
    if (d <= 0 || l <= 0) return 0;
    return (Math.PI * d * l) / 10000;
}

function obterFaixa(d) {
    if (d > 50) return { fator: 32.1, k: 0,   nome: 'Faixa 1 (>50)' };
    if (d > 25) return { fator: 27.3, k: 35,  nome: 'Faixa 2 (26-50)' };
    if (d > 15) return { fator: 24.1, k: 61,  nome: 'Faixa 3 (16-25)' };
    if (d > 10) return { fator: 21.5, k: 125, nome: 'Faixa 4 (11-15)' };
    return { fator: 18.2, k: 300, nome: 'Faixa 5 (<=10)' };
}

function atualizarResultados() {
    var dRaw = document.getElementById('diametro').value;
    var lRaw = document.getElementById('comprimento').value;

    var dVal = parseValor(dRaw);
    var lVal = parseValor(lRaw);

    var dMM = state.unidadeD === 'pol' ? dVal * MM_POR_POL : dVal;
    var lMM = lVal;

    var area = calcularArea(dMM, lMM);
    var cfg  = obterFaixa(dMM);
    var base = area > 0 ? (area * cfg.fator) + cfg.k : 0;
    var preco = SERVICOS[state.servico].calculo(base);

    document.getElementById('result-area').textContent  = area > 0 ? area.toLocaleString('pt-BR', {minimumFractionDigits: 4, maximumFractionDigits: 4}) : '--';
    document.getElementById('result-faixa').textContent = area > 0 ? cfg.nome : '--';
    document.getElementById('result-base').textContent  = area > 0 ? base.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '--';
    document.getElementById('result-preco').textContent = area > 0 ? preco.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0,00';
    document.getElementById('price-service-label').textContent = SERVICOS[state.servico].nome;

    var pd = document.querySelector('.price-display');
    if (area > 0) pd.classList.add('has-value'); else pd.classList.remove('has-value');
}

function atualizarBotoesD() {
    var u = state.unidadeD;
    var div = document.getElementById('qs-diametro');
    if (div) {
        div.innerHTML = QUICK_D[u].map(function(v) {
            return '<button type="button" onclick="setMedida(\'diametro\',' + v + ')">' + v + '</button>';
        }).join('');
    }
    var unitEl = document.getElementById('unit-diametro');
    if (unitEl) unitEl.textContent = u;
    var btnMM  = document.getElementById('btn-unit-mm');
    var btnPol = document.getElementById('btn-unit-pol');
    if (btnMM)  btnMM.classList.toggle('active',  u === 'mm');
    if (btnPol) btnPol.classList.toggle('active', u === 'pol');
}

window.setMedida = function(campo, valor) {
    document.getElementById(campo).value = valor;
    atualizarResultados();
};

window.setServico = function(s) {
    state.servico = s;
    document.querySelectorAll('.service-btn').forEach(function(btn) {
        btn.classList.remove('active');
        if (btn.id === 'btn-' + s) btn.classList.add('active');
    });
    atualizarResultados();
};

window.setUnidade = function(u) {
    if (state.unidadeD === u) return;
    var el = document.getElementById('diametro');
    var v  = parseValor(el.value);
    if (v) {
        el.value = u === 'pol'
            ? (v / MM_POR_POL).toFixed(3).replace(/\.?0+$/, '')
            : (v * MM_POR_POL).toFixed(1).replace(/\.0$/, '');
    }
    state.unidadeD = u;
    atualizarBotoesD();
    atualizarResultados();
};

window.limparTudo = function() {
    document.getElementById('diametro').value = '';
    document.getElementById('comprimento').value = '';
    state.servico = 'cromoCamada';
    window.setServico('cromoCamada');
};

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('diametro').addEventListener('input', atualizarResultados);
    document.getElementById('comprimento').addEventListener('input', atualizarResultados);

    var qsL = document.getElementById('qs-comprimento');
    if (qsL) {
        qsL.innerHTML = QUICK_L.map(function(v) {
            return '<button type="button" onclick="setMedida(\'comprimento\',' + v + ')">' + v + '</button>';
        }).join('');
    }
    atualizarBotoesD();
});
