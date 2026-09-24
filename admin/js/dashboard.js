exigirAdmin('../../')
document.getElementById('nomeUsuario').textContent = sessao().nome
document.getElementById('btnLogout').addEventListener('click', () => { encerrarSessao(); location.href = '../../index.html' })

const rotuloStatus = {
  PENDENTE: 'Pendente', CONFIRMADO: 'Confirmado', EM_PREPARACAO: 'Em preparação',
  ENVIADO: 'Enviado', ENTREGUE: 'Entregue', CANCELADO: 'Cancelado'
}

async function carregar() {
  try {
    const dados = await api.get('/relatorio/indicadores')

    document.getElementById('cartoes-indicadores').innerHTML = `
      <div class="cartao-indicador">
        <span>Pedidos válidos</span>
        <strong>${dados.quantidadePedidos}</strong>
      </div>
      <div class="cartao-indicador cartao-indicador--laranja">
        <span>Faturamento total</span>
        <strong>${formatarMoeda(dados.faturamentoTotal)}</strong>
      </div>
      <div class="cartao-indicador">
        <span>Ticket médio</span>
        <strong>${formatarMoeda(dados.ticketMedio)}</strong>
      </div>
    `

    document.getElementById('lista-status-pedidos').innerHTML = (dados.porStatus || []).map(s => `
      <div style="display:flex;justify-content:space-between;padding:.5rem 0;border-bottom:1px solid var(--cinza-100);font-size:.9rem;">
        <span>${rotuloStatus[s.status] || s.status}</span><strong>${s.total}</strong>
      </div>
    `).join('') || '<p class="vazio">Sem pedidos ainda.</p>'

    document.getElementById('lista-kits-vendidos').innerHTML = (dados.kitsMaisVendidos || []).map(k => `
      <div style="display:flex;justify-content:space-between;padding:.5rem 0;border-bottom:1px solid var(--cinza-100);font-size:.9rem;">
        <span>${k.nome}</span><strong>${k.quantidadeVendida} un.</strong>
      </div>
    `).join('') || '<p class="vazio">Nenhum kit vendido ainda.</p>'
  } catch (err) {
    document.getElementById('cartoes-indicadores').innerHTML = `<p class="vazio">Não foi possível carregar os indicadores.</p>`
  }
}

function formatarMoeda(valor) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

carregar()
