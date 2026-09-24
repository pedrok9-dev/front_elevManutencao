exigirAdmin('../../')
document.getElementById('nomeUsuario').textContent = sessao().nome
document.getElementById('btnLogout').addEventListener('click', () => { encerrarSessao(); location.href = '../../index.html' })

const modalMov = document.getElementById('modal-movimentacao')

function linhaEstoque(e) {
  const p = e.produtoEstoque
  const classe = e.quantidade_atual <= 0 ? 'badge--erro' : (e.quantidade_atual <= e.quantidade_minima ? 'badge--alerta' : 'badge--sucesso')
  const texto = e.quantidade_atual <= 0 ? 'Esgotado' : (e.quantidade_atual <= e.quantidade_minima ? 'Abaixo do mínimo' : 'Normal')
  return `
    <tr>
      <td style="font-family:var(--f-mono);font-size:.8rem;">${p?.codigoInterno || '—'}</td>
      <td>${p?.nome || '—'}</td>
      <td><strong>${e.quantidade_atual}</strong></td>
      <td>${e.quantidade_minima}</td>
      <td><span class="badge ${classe}">${texto}</span></td>
      <td class="linha-acoes-tabela">
        <button class="botao botao--laranja" onclick="abrirModal(${p?.codProduto}, '${(p?.nome || '').replace(/'/g, "\\'")}')">Movimentar</button>
      </td>
    </tr>
  `
}

async function carregar() {
  const tbody = document.getElementById('tbody-estoque')
  const apenasCriticos = document.getElementById('f-criticos').checked
  try {
    const estoques = await api.get(`/estoque${apenasCriticos ? '?criticos=true' : ''}`)
    tbody.innerHTML = estoques.map(linhaEstoque).join('') || `<tr><td colspan="6" class="carregando">Nenhum item encontrado.</td></tr>`
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6">Erro ao carregar estoque.</td></tr>`
  }
}

document.getElementById('f-criticos').addEventListener('change', carregar)

function abrirModal(idProduto, nome) {
  document.getElementById('form-movimentacao').reset()
  document.getElementById('mv-idProduto').value = idProduto
  document.getElementById('mv-produto-nome').textContent = `Produto: ${nome}`
  document.getElementById('res-movimentacao').textContent = ''
  modalMov.classList.add('aberto')
}
document.getElementById('btnFecharModalMov').addEventListener('click', () => modalMov.classList.remove('aberto'))

document.getElementById('form-movimentacao').addEventListener('submit', async (e) => {
  e.preventDefault()
  const res = document.getElementById('res-movimentacao')
  res.className = 'mensagem-resposta'
  try {
    await api.post('/estoque/movimentacao', {
      idProduto: Number(document.getElementById('mv-idProduto').value),
      tipo: document.getElementById('mv-tipo').value,
      quantidade: Number(document.getElementById('mv-quantidade').value),
      motivo: document.getElementById('mv-motivo').value.trim()
    })
    res.textContent = 'Movimentação registrada com sucesso!'
    res.classList.add('sucesso')
    carregar()
    setTimeout(() => modalMov.classList.remove('aberto'), 700)
  } catch (err) {
    res.textContent = err.message || 'Erro ao registrar movimentação.'
    res.classList.add('erro')
  }
})

carregar()
