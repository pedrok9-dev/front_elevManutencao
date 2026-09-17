exigirCliente('../')
atualizarContadorCarrinho()

document.getElementById('nomeUsuario').textContent = sessao().nome
document.getElementById('btnLogout').addEventListener('click', () => {
  encerrarSessao()
  location.href = '../index.html'
})

document.getElementById('btnMenuMobile').addEventListener('click', () => {
  document.getElementById('cabecalho').classList.toggle('menu-aberto')
})

document.getElementById('form-busca-topo').addEventListener('submit', (e) => {
  e.preventDefault()
  const termo = document.getElementById('busca-topo-input').value.trim()
  location.href = `./loja.html?busca=${encodeURIComponent(termo)}`
})

function indicadorEstoqueHtml(quantidadeAtual, quantidadeMinima) {
  let classe = 'normal'
  if (quantidadeAtual <= 0) classe = 'esgotado'
  else if (quantidadeAtual <= quantidadeMinima) classe = 'baixo'

  const texto = classe === 'esgotado' ? 'Esgotado' : classe === 'baixo' ? 'Estoque baixo' : 'Em estoque'

  return `
    <div class="indicador-estoque indicador-estoque--${classe}">
      <span class="indicador-estoque__segmentos"><span></span><span></span><span></span></span>
      ${texto}
    </div>
  `
}

function cartaoProdutoHtml(p) {
  const estoque = p.estoqueProduto || { quantidade_atual: 0, quantidade_minima: 0 }
  return `
    <a href="./produto.html?id=${p.codProduto}" class="cartao-produto">
      <div class="cartao-produto__imagem">
        <span class="badge-codigo">${p.codigoInterno}</span>
        ${p.nome}
      </div>
      <div class="cartao-produto__corpo">
        <span class="cartao-produto__categoria">${p.categoriaProduto?.nome || ''}</span>
        <span class="cartao-produto__nome">${p.nome}</span>
        ${indicadorEstoqueHtml(estoque.quantidade_atual, estoque.quantidade_minima)}
        <span class="cartao-produto__preco">${formatarMoeda(p.preco)}</span>
      </div>
    </a>
  `
}

function cartaoKitHtml(k) {
  return `
    <a href="./kit.html?id=${k.codKit}" class="cartao-produto">
      <div class="cartao-produto__imagem" style="background:linear-gradient(135deg, var(--laranja-100), var(--cinza-100)); color: var(--laranja-600);">
        <span class="badge badge--laranja" style="position:absolute;top:.6rem;left:.6rem;">KIT</span>
        ${k.nome}
      </div>
      <div class="cartao-produto__corpo">
        <span class="cartao-produto__categoria">${k.categoriaKit?.nome || 'Kit de manutenção'}</span>
        <span class="cartao-produto__nome">${k.nome}</span>
        <span class="badge ${k.disponibilidade > 0 ? 'badge--sucesso' : 'badge--erro'}">${k.disponibilidade > 0 ? k.disponibilidade + ' disponíveis' : 'Indisponível'}</span>
        <span class="cartao-produto__preco">${formatarMoeda(k.preco)}</span>
      </div>
    </a>
  `
}

async function carregarCategorias() {
  const grade = document.getElementById('grade-categorias')
  try {
    const categorias = await api.get('/categoria', { autenticado: false })
    grade.innerHTML = categorias.map(c => `
      <a href="./loja.html?categoria=${encodeURIComponent(c.nome)}" class="cartao-categoria">
        <h3>${c.nome}</h3>
        <p>${c.descricao || ''}</p>
      </a>
    `).join('')
  } catch (err) {
    grade.innerHTML = `<p class="vazio">Não foi possível carregar as categorias.</p>`
  }
}

async function carregarKitsDestaque() {
  const grade = document.getElementById('grade-kits')
  try {
    const kits = await api.get('/kit', { autenticado: false })
    grade.innerHTML = kits.slice(0, 4).map(cartaoKitHtml).join('') || `<p class="vazio">Nenhum kit cadastrado ainda.</p>`
  } catch (err) {
    grade.innerHTML = `<p class="vazio">Não foi possível carregar os kits.</p>`
  }
}

async function carregarProdutosDestaque() {
  const grade = document.getElementById('grade-produtos')
  try {
    const produtos = await api.get('/produto', { autenticado: false })
    grade.innerHTML = produtos.slice(0, 8).map(cartaoProdutoHtml).join('') || `<p class="vazio">Nenhum produto cadastrado ainda.</p>`
  } catch (err) {
    grade.innerHTML = `<p class="vazio">Não foi possível carregar os produtos.</p>`
  }
}

carregarCategorias()
carregarKitsDestaque()
carregarProdutosDestaque()
