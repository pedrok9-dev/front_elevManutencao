exigirAdmin('../../')
document.getElementById('nomeUsuario').textContent = sessao().nome
document.getElementById('btnLogout').addEventListener('click', () => { encerrarSessao(); location.href = '../../index.html' })

function formatarMoeda(valor) { return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }

const modal = document.getElementById('modal-produto')
let listaCompleta = []

async function popularSelects() {
  const categorias = await api.get('/categoria', { autenticado: false })
  const selCategoria = document.getElementById('pr-categoria')
  selCategoria.innerHTML = categorias.map(c => `<option value="${c.codCategoria}">${c.nome}</option>`).join('')

  const fornecedores = await api.get('/fornecedor?ativos=true')
  const selFornecedor = document.getElementById('pr-fornecedor')
  selFornecedor.innerHTML = `<option value="">—</option>` + fornecedores.map(f => `<option value="${f.codFornecedor}">${f.razaoSocial}</option>`).join('')
}

function linhaTabela(p) {
  const estoque = p.estoqueProduto || { quantidade_atual: 0, quantidade_minima: 0 }
  const classeEstoque = estoque.quantidade_atual <= 0 ? 'badge--erro' : (estoque.quantidade_atual <= estoque.quantidade_minima ? 'badge--alerta' : 'badge--sucesso')
  return `
    <tr>
      <td style="font-family:var(--f-mono);font-size:.8rem;">${p.codigoInterno}</td>
      <td>${p.nome}</td>
      <td>${p.categoriaProduto?.nome || '—'}</td>
      <td>${formatarMoeda(p.preco)}</td>
      <td><span class="badge ${classeEstoque}">${estoque.quantidade_atual} un.</span></td>
      <td><span class="badge ${p.ativo ? 'badge--sucesso' : 'badge--neutro'}">${p.ativo ? 'Ativo' : 'Inativo'}</span></td>
      <td class="linha-acoes-tabela">
        <button class="botao botao--contorno" onclick="editar(${p.codProduto})">Editar</button>
        ${p.ativo ? `<button class="botao botao--perigo" onclick="desativar(${p.codProduto})">Desativar</button>` : ''}
      </td>
    </tr>
  `
}

async function carregar() {
  const tbody = document.getElementById('tbody-produtos')
  try {
    listaCompleta = await api.get('/produto', { autenticado: false })
    renderizarFiltrado()
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7">Erro ao carregar produtos.</td></tr>`
  }
}

function renderizarFiltrado() {
  const termo = document.getElementById('busca-produto').value.trim().toLowerCase()
  const filtrados = termo
    ? listaCompleta.filter(p => p.nome.toLowerCase().includes(termo) || p.codigoInterno.toLowerCase().includes(termo))
    : listaCompleta
  document.getElementById('tbody-produtos').innerHTML = filtrados.map(linhaTabela).join('') || `<tr><td colspan="7" class="carregando">Nenhum produto encontrado.</td></tr>`
}

document.getElementById('busca-produto').addEventListener('input', renderizarFiltrado)

function abrirModal(produto = null) {
  document.getElementById('form-produto').reset()
  document.getElementById('pr-id').value = ''
  document.getElementById('modal-titulo').textContent = produto ? 'Editar produto' : 'Novo produto'
  document.getElementById('grupo-estoque-inicial').style.display = produto ? 'none' : 'block'
  document.getElementById('res-produto').textContent = ''

  if (produto) {
    document.getElementById('pr-id').value = produto.codProduto
    document.getElementById('pr-codigo').value = produto.codigoInterno
    document.getElementById('pr-nome').value = produto.nome
    document.getElementById('pr-descricao').value = produto.descricao || ''
    document.getElementById('pr-categoria').value = produto.idCategoria
    document.getElementById('pr-fornecedor').value = produto.idFornecedor || ''
    document.getElementById('pr-unidade').value = produto.unidade
    document.getElementById('pr-preco').value = produto.preco
  }

  modal.classList.add('aberto')
}

document.getElementById('btnNovoProduto').addEventListener('click', () => abrirModal())
document.getElementById('btnFecharModal').addEventListener('click', () => modal.classList.remove('aberto'))

async function editar(id) {
  const produto = await api.get(`/produto/${id}`, { autenticado: false })
  abrirModal(produto)
}

async function desativar(id) {
  if (!confirm('Desativar este produto?')) return
  try {
    await api.delete(`/produto/${id}`)
    carregar()
  } catch (err) { alert(err.message) }
}

document.getElementById('form-produto').addEventListener('submit', async (e) => {
  e.preventDefault()
  const res = document.getElementById('res-produto')
  res.className = 'mensagem-resposta'

  const id = document.getElementById('pr-id').value
  const corpo = {
    codigoInterno: document.getElementById('pr-codigo').value.trim(),
    nome: document.getElementById('pr-nome').value.trim(),
    descricao: document.getElementById('pr-descricao').value.trim(),
    idCategoria: Number(document.getElementById('pr-categoria').value),
    idFornecedor: document.getElementById('pr-fornecedor').value ? Number(document.getElementById('pr-fornecedor').value) : null,
    unidade: document.getElementById('pr-unidade').value.trim() || 'unidade',
    preco: Number(document.getElementById('pr-preco').value)
  }

  try {
    if (id) {
      await api.put(`/produto/${id}`, corpo)
      res.textContent = 'Produto atualizado com sucesso!'
    } else {
      corpo.quantidade_atual = Number(document.getElementById('pr-estoque').value) || 0
      await api.post('/produto', corpo)
      res.textContent = 'Produto criado com sucesso!'
    }
    res.classList.add('sucesso')
    carregar()
    setTimeout(() => modal.classList.remove('aberto'), 700)
  } catch (err) {
    res.textContent = err.message || 'Erro ao salvar produto.'
    res.classList.add('erro')
  }
})

popularSelects().then(carregar)
