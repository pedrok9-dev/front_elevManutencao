exigirAdmin('../../')
document.getElementById('nomeUsuario').textContent = sessao().nome
document.getElementById('btnLogout').addEventListener('click', () => { encerrarSessao(); location.href = '../../index.html' })

async function carregar() {
  const tbody = document.getElementById('tbody-categorias')
  try {
    const categorias = await api.get('/categoria?ativas=false')
    tbody.innerHTML = categorias.map(c => `
      <tr>
        <td><strong>${c.nome}</strong></td>
        <td>${c.descricao || '—'}</td>
        <td><span class="badge ${c.ativo ? 'badge--sucesso' : 'badge--neutro'}">${c.ativo ? 'Ativa' : 'Inativa'}</span></td>
        <td class="linha-acoes-tabela">
          ${c.ativo ? `<button class="botao botao--perigo" onclick="desativar(${c.codCategoria})">Desativar</button>` : ''}
        </td>
      </tr>
    `).join('') || `<tr><td colspan="4" class="carregando">Nenhuma categoria cadastrada.</td></tr>`
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4">Erro ao carregar categorias.</td></tr>`
  }
}

document.getElementById('form-categoria').addEventListener('submit', async (e) => {
  e.preventDefault()
  const res = document.getElementById('res-categoria')
  res.className = 'mensagem-resposta'
  try {
    await api.post('/categoria', {
      nome: document.getElementById('c-nome').value.trim(),
      descricao: document.getElementById('c-descricao').value.trim()
    })
    document.getElementById('form-categoria').reset()
    res.textContent = 'Categoria criada com sucesso!'
    res.classList.add('sucesso')
    carregar()
  } catch (err) {
    res.textContent = err.message || 'Erro ao criar categoria.'
    res.classList.add('erro')
  }
})

async function desativar(id) {
  if (!confirm('Desativar esta categoria?')) return
  try {
    await api.delete(`/categoria/${id}`)
    carregar()
  } catch (err) {
    alert(err.message)
  }
}

carregar()
