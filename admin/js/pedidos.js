exigirAdmin('../../')
document.getElementById('nomeUsuario').textContent = sessao().nome
document.getElementById('btnLogout').addEventListener('click', () => { encerrarSessao(); location.href = '../../index.html' })

function formatarMoeda(valor) { return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }

const opcoesStatus = ['PENDENTE', 'CONFIRMADO', 'EM_PREPARACAO', 'ENVIADO', 'ENTREGUE', 'CANCELADO']
const classeStatus = { PENDENTE: 'badge--alerta', CONFIRMADO: 'badge--azul', EM_PREPARACAO: 'badge--alerta', ENVIADO: 'badge--azul', ENTREGUE: 'badge--sucesso', CANCELADO: 'badge--erro' }

function linhaPedido(p) {
  return `
    <tr>
      <td><strong>#${p.codPedido}</strong></td>
      <td style="font-size:.82rem;">${new Date(p.dataPedido).toLocaleString('pt-BR')}</td>
      <td style="font-size:.82rem;">${(p.itensPedido || []).length} item(ns)</td>
      <td>${formatarMoeda(p.valorTotal)}</td>
      <td><span class="badge ${classeStatus[p.status] || 'badge--neutro'}">${p.status}</span></td>
      <td class="linha-acoes-tabela">
        <select class="campo-entrada" style="padding:.35rem;font-size:.8rem;" onchange="atualizarStatus(${p.codPedido}, this.value)">
          ${opcoesStatus.map(s => `<option value="${s}" ${s === p.status ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
      </td>
    </tr>
  `
}

async function carregar() {
  const tbody = document.getElementById('tbody-pedidos')
  const status = document.getElementById('f-status').value
  try {
    const pedidos = await api.get(`/pedido${status ? '?status=' + status : ''}`)
    tbody.innerHTML = pedidos.map(linhaPedido).join('') || `<tr><td colspan="6" class="carregando">Nenhum pedido encontrado.</td></tr>`
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6">Erro ao carregar pedidos.</td></tr>`
  }
}

async function atualizarStatus(id, status) {
  try {
    await api.patch(`/pedido/${id}/status`, { status })
    carregar()
  } catch (err) {
    alert(err.message)
    carregar()
  }
}

document.getElementById('f-status').addEventListener('change', carregar)
carregar()
