exigirAdmin('../../')
document.getElementById('nomeUsuario').textContent = sessao().nome
document.getElementById('btnLogout').addEventListener('click', () => { encerrarSessao(); location.href = '../../index.html' })

async function carregar() {
  const tbody = document.getElementById('tbody-fornecedores')
  try {
    const fornecedores = await api.get('/fornecedor?ativos=false')
    tbody.innerHTML = fornecedores.map(f => `
      <tr>
        <td><strong>${f.razaoSocial}</strong>${f.nomeFantasia ? `<br><span style="font-size:.78rem;color:var(--cinza-600);">${f.nomeFantasia}</span>` : ''}</td>
        <td style="font-family:var(--f-mono);font-size:.82rem;">${f.cnpj}</td>
        <td style="font-size:.85rem;">${f.email || '—'}<br>${f.telefone || ''}</td>
        <td><span class="badge ${f.ativo ? 'badge--sucesso' : 'badge--neutro'}">${f.ativo ? 'Ativo' : 'Inativo'}</span></td>
        <td class="linha-acoes-tabela">
          ${f.ativo ? `<button class="botao botao--perigo" onclick="desativar(${f.codFornecedor})">Desativar</button>` : ''}
        </td>
      </tr>
    `).join('') || `<tr><td colspan="5" class="carregando">Nenhum fornecedor cadastrado.</td></tr>`
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5">Erro ao carregar fornecedores.</td></tr>`
  }
}

document.getElementById('form-fornecedor').addEventListener('submit', async (e) => {
  e.preventDefault()
  const res = document.getElementById('res-fornecedor')
  res.className = 'mensagem-resposta'
  try {
    await api.post('/fornecedor', {
      razaoSocial: document.getElementById('f-razao').value.trim(),
      nomeFantasia: document.getElementById('f-fantasia').value.trim(),
      cnpj: document.getElementById('f-cnpj').value.trim(),
      email: document.getElementById('f-email').value.trim(),
      telefone: document.getElementById('f-telefone').value.trim()
    })
    document.getElementById('form-fornecedor').reset()
    res.textContent = 'Fornecedor cadastrado com sucesso!'
    res.classList.add('sucesso')
    carregar()
  } catch (err) {
    res.textContent = err.message || 'Erro ao cadastrar fornecedor.'
    res.classList.add('erro')
  }
})

async function desativar(id) {
  if (!confirm('Desativar este fornecedor?')) return
  try {
    await api.delete(`/fornecedor/${id}`)
    carregar()
  } catch (err) {
    alert(err.message)
  }
}

carregar()
