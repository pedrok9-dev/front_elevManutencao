exigirAdmin('../../')
document.getElementById('nomeUsuario').textContent = sessao().nome
document.getElementById('btnLogout').addEventListener('click', () => { encerrarSessao(); location.href = '../../index.html' })

function formatarMoeda(valor) { return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }

const CORES = { azul: '#123C73', laranja: '#FF6A13', preto: '#101114', cinza: '#9AA3AF' }

async function carregarVendas() {
  try {
    const dados = await api.get('/relatorio/vendas')
    const ctx = document.getElementById('grafico-vendas')
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: dados.map(d => d.categoria),
        datasets: [{
          label: 'Faturamento (R$)',
          data: dados.map(d => d.faturamento),
          backgroundColor: CORES.azul,
          borderRadius: 4
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { callback: (v) => formatarMoeda(v) } } }
      }
    })
  } catch (err) {
    console.error('Erro ao carregar relatório de vendas:', err)
  }
}

async function carregarEstoque() {
  try {
    const dados = await api.get('/relatorio/estoque')

    document.getElementById('cartoes-estoque').innerHTML = `
      <div class="cartao-indicador"><span>Normal</span><strong>${dados.resumo.NORMAL}</strong></div>
      <div class="cartao-indicador cartao-indicador--laranja"><span>Abaixo do mínimo</span><strong>${dados.resumo.ABAIXO_DO_MINIMO}</strong></div>
      <div class="cartao-indicador" style="border-top-color:var(--erro);"><span>Esgotados</span><strong>${dados.resumo.ESGOTADO}</strong></div>
    `

    const ctx = document.getElementById('grafico-estoque')
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Normal', 'Abaixo do mínimo', 'Esgotado'],
        datasets: [{
          data: [dados.resumo.NORMAL, dados.resumo.ABAIXO_DO_MINIMO, dados.resumo.ESGOTADO],
          backgroundColor: ['#1E8E5A', CORES.laranja, '#D0342C']
        }]
      },
      options: { plugins: { legend: { position: 'bottom' } } }
    })

    const situacaoRotulo = { NORMAL: 'Normal', ABAIXO_DO_MINIMO: 'Abaixo do mínimo', ESGOTADO: 'Esgotado' }
    const situacaoClasse = { NORMAL: 'badge--sucesso', ABAIXO_DO_MINIMO: 'badge--alerta', ESGOTADO: 'badge--erro' }

    document.getElementById('tbody-menores-saldos').innerHTML = dados.cincoMenoresSaldos.map(p => `
      <tr>
        <td style="font-family:var(--f-mono);font-size:.8rem;">${p.codigoInterno}</td>
        <td>${p.nome}</td>
        <td>${p.quantidade_atual}</td>
        <td>${p.quantidade_minima}</td>
        <td><span class="badge ${situacaoClasse[p.situacao]}">${situacaoRotulo[p.situacao]}</span></td>
      </tr>
    `).join('') || `<tr><td colspan="5" class="carregando">Sem dados.</td></tr>`
  } catch (err) {
    console.error('Erro ao carregar relatório de estoque:', err)
  }
}

carregarVendas()
carregarEstoque()
