exigirAdmin('../../')
document.getElementById('nomeUsuario').textContent = sessao().nome
document.getElementById('btnLogout').addEventListener('click', () => { encerrarSessao(); location.href = '../../index.html' })

function formatarMoeda(valor) { return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }

const modal = document.getElementById('modal-kit')
let produtosDisponiveis = []

async function popularSelects() {
  const categorias = await api.get('/categoria', { autenticado: false })
  document.getElementById('k-categoria').innerHTML = `<option value="">—</option>` + categorias.map(c => `<option value="${c.codCategoria}">${c.nome}</option>`).join('')

  produtosDisponiveis = await api.get('/produto', { autenticado: false })
}

function linhaItemKit(idProdutoSelecionado = '', quantidade = 1) {
  const div = document.createElement('div')
  div.className = 'campo-linha campo-linha--2 linha-item-kit'
  div.style.marginBottom = '.5rem'
  div.innerHTML = `
    <select class="campo-entrada item-kit-produto">
      ${produtosDisponiveis.map(p => `<option value="${p.codProduto}" ${String(p.codProduto) === String(idProdutoSelecionado) ? 'selected' : ''}>${p.nome} (${p.codigoInterno})</option>`).join('')}
    </select>
    <div style="display:flex;gap:.4rem;">
      <input type="number" min="1" class="campo-entrada item-kit-quantidade" value="${quantidade}" style="width:90px;">
      <button type="button" class="botao botao--perigo" onclick="this.closest('.linha-item-kit').remove()">✕</button>
    </div>
  `
  return div
}

document.getElementById('btnAddItemKit').addEventListener('click', () => {
  document.getElementById('itens-kit').appendChild(linhaItemKit())
})

function cartaoKitAdmin(k) {
  return `
    <div class="cartao-produto">
      <div class="cartao-produto__imagem" style="background:linear-gradient(135deg, var(--laranja-100), var(--cinza-100)); color: var(--laranja-600);">
        <span class="badge badge--laranja" style="position:absolute;top:.6rem;left:.6rem;">KIT</span>
        ${k.nome}
      </div>
      <div class="cartao-produto__corpo">
        <span class="cartao-produto__categoria">${k.categoriaKit?.nome || 'Sem categoria'}</span>
        <span class="cartao-produto__nome">${k.nome}</span>
        <span class="badge ${k.disponibilidade > 0 ? 'badge--sucesso' : 'badge--erro'}">${k.disponibilidade > 0 ? k.disponibilidade + ' disponíveis' : 'Indisponível'}</span>
        <span class="cartao-produto__preco">${formatarMoeda(k.preco)}</span>
        <div style="display:flex;gap:.4rem;margin-top:.5rem;">
          <button class="botao botao--contorno" style="flex:1;" onclick="editar(${k.codKit})">Editar</button>
          <button class="botao botao--perigo" onclick="desativar(${k.codKit})">Desativar</button>
        </div>
      </div>
    </div>
  `
}

async function carregar() {
  const grade = document.getElementById('grade-kits-admin')
  try {
    const kits = await api.get('/kit', { autenticado: false })
    grade.innerHTML = kits.map(cartaoKitAdmin).join('') || `<p class="vazio">Nenhum kit cadastrado ainda.</p>`
  } catch (err) {
    grade.innerHTML = `<p class="vazio">Erro ao carregar kits.</p>`
  }
}

function abrirModal(kit = null) {
  document.getElementById('form-kit').reset()
  document.getElementById('k-id').value = ''
  document.getElementById('itens-kit').innerHTML = ''
  document.getElementById('modal-kit-titulo').textContent = kit ? 'Editar kit' : 'Novo kit'
  document.getElementById('res-kit').textContent = ''

  if (kit) {
    document.getElementById('k-id').value = kit.codKit
    document.getElementById('k-nome').value = kit.nome
    document.getElementById('k-descricao').value = kit.descricao || ''
    document.getElementById('k-categoria').value = kit.idCategoria || ''
    document.getElementById('k-preco').value = kit.preco
    ;(kit.itensKit || []).forEach(item => {
      document.getElementById('itens-kit').appendChild(linhaItemKit(item.idProduto, item.quantidade))
    })
  } else {
    document.getElementById('itens-kit').appendChild(linhaItemKit())
  }

  modal.classList.add('aberto')
}

document.getElementById('btnNovoKit').addEventListener('click', () => abrirModal())
document.getElementById('btnFecharModalKit').addEventListener('click', () => modal.classList.remove('aberto'))

async function editar(id) {
  const kit = await api.get(`/kit/${id}`, { autenticado: false })
  abrirModal(kit)
}

async function desativar(id) {
  if (!confirm('Desativar este kit?')) return
  try {
    await api.delete(`/kit/${id}`)
    carregar()
  } catch (err) { alert(err.message) }
}

document.getElementById('form-kit').addEventListener('submit', async (e) => {
  e.preventDefault()
  const res = document.getElementById('res-kit')
  res.className = 'mensagem-resposta'

  const itens = Array.from(document.querySelectorAll('.linha-item-kit')).map(linha => ({
    idProduto: Number(linha.querySelector('.item-kit-produto').value),
    quantidade: Number(linha.querySelector('.item-kit-quantidade').value)
  }))

  if (itens.length === 0) {
    res.textContent = 'Adicione ao menos um produto ao kit.'
    res.classList.add('erro')
    return
  }

  const id = document.getElementById('k-id').value
  const corpo = {
    nome: document.getElementById('k-nome').value.trim(),
    descricao: document.getElementById('k-descricao').value.trim(),
    idCategoria: document.getElementById('k-categoria').value ? Number(document.getElementById('k-categoria').value) : null,
    preco: Number(document.getElementById('k-preco').value)
  }

  try {
    if (id) {
      await api.put(`/kit/${id}`, corpo)
      await api.put(`/kit/${id}/itens`, { itens })
      res.textContent = 'Kit atualizado com sucesso!'
    } else {
      corpo.itens = itens
      await api.post('/kit', corpo)
      res.textContent = 'Kit criado com sucesso!'
    }
    res.classList.add('sucesso')
    carregar()
    setTimeout(() => modal.classList.remove('aberto'), 700)
  } catch (err) {
    res.textContent = err.message || 'Erro ao salvar kit.'
    res.classList.add('erro')
  }
})

popularSelects().then(carregar)
