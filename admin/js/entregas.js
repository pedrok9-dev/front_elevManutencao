exigirAdmin('../../')
document.getElementById('nomeUsuario').textContent = sessao().nome
document.getElementById('btnLogout').addEventListener('click', () => { encerrarSessao(); location.href = '../../index.html' })

const modal = document.getElementById('modal-entrega')
const classeStatus = { AGUARDANDO_SEPARACAO: 'badge--alerta', EM_TRANSITO: 'badge--azul', ENTREGUE: 'badge--sucesso', OCORRENCIA: 'badge--erro' }

function linhaEntrega(e) {
  return `
    <tr>
      <td><strong>#${e.idPedido}</strong></td>
      <td style="font-size:.82rem;">${e.logradouro}, ${e.numero} — ${e.cidade}/${e.estado}</td>
      <td><span class="badge ${classeStatus[e.status] || 'badge--neutro'}">${e.status}</span></td>
      <td style="font-family:var(--f-mono);font-size:.8rem;">${e.codigoRastreio || '—'}</td>
      <td class="linha-acoes-tabela">
        <button class="botao botao--laranja" onclick="abrirModal(${e.idPedido}, '${e.status}', '${e.codigoRastreio || ''}')">Atualizar</button>
      </td>
    </tr>
  `
}

async function carregar() {
  const tbody = document.getElementById('tbody-entregas')
  try {
    const entregas = await api.get('/entrega')
    tbody.innerHTML = entregas.map(linhaEntrega).join('') || `<tr><td colspan="5" class="carregando">Nenhuma entrega encontrada.</td></tr>`
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5">Erro ao carregar entregas.</td></tr>`
  }
}

function abrirModal(idPedido, status, rastreio) {
  document.getElementById('en-idPedido').value = idPedido
  document.getElementById('en-status').value = status
  document.getElementById('en-rastreio').value = rastreio
  document.getElementById('res-entrega').textContent = ''
  modal.classList.add('aberto')
}
document.getElementById('btnFecharModalEntrega').addEventListener('click', () => modal.classList.remove('aberto'))

document.getElementById('form-entrega').addEventListener('submit', async (e) => {
  e.preventDefault()
  const res = document.getElementById('res-entrega')
  res.className = 'mensagem-resposta'
  try {
    await api.patch(`/entrega/${document.getElementById('en-idPedido').value}`, {
      status: document.getElementById('en-status').value,
      codigoRastreio: document.getElementById('en-rastreio').value.trim() || undefined
    })
    res.textContent = 'Entrega atualizada com sucesso!'
    res.classList.add('sucesso')
    carregar()
    setTimeout(() => modal.classList.remove('aberto'), 700)
  } catch (err) {
    res.textContent = err.message || 'Erro ao atualizar entrega.'
    res.classList.add('erro')
  }
})

carregar()
