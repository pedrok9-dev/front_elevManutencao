exigirCliente('../')
atualizarContadorCarrinho()
document.getElementById('nomeUsuario').textContent = sessao().nome
document.getElementById('btnLogout').addEventListener('click', () => { encerrarSessao(); location.href = '../index.html' })
document.getElementById('btnMenuMobile').addEventListener('click', () => document.getElementById('cabecalho').classList.toggle('menu-aberto'))

const params = new URLSearchParams(location.search)

function indicadorEstoqueHtml(quantidadeAtual, quantidadeMinima) {
  let classe = 'normal'
  if (quantidadeAtual <= 0) classe = 'esgotado'
  else if (quantidadeAtual <= quantidadeMinima) classe = 'baixo'
  const texto = classe === 'esgotado' ? 'Esgotado' : classe === 'baixo' ? 'Estoque baixo' : 'Em estoque'
  return `<div class="indicador-estoque indicador-estoque--${classe}"><span class="indicador-estoque__segmentos"><span></span><span></span><span></span></span>${texto}</div>`
}

function cartaoProdutoHtml(p) {
  const estoque = p.estoqueProduto || { quantidade_atual: 0, quantidade_minima: 0 }
  const semEstoque = estoque.quantidade_atual <= 0
  return `
    <div class="cartao-produto">
      <a href="./produto.html?id=${p.codProduto}">
        <div class="cartao-produto__imagem">
          <span class="badge-codigo">${p.codigoInterno}</span>
          ${p.nome}
        </div>
      </a>
      <div class="cartao-produto__corpo">
        <span class="cartao-produto__categoria">${p.categoriaProduto?.nome || ''}</span>
        <a href="./produto.html?id=${p.codProduto}"><span class="cartao-produto__nome">${p.nome}</span></a>
        ${indicadorEstoqueHtml(estoque.quantidade_atual, estoque.quantidade_minima)}
        <span class="cartao-produto__preco">${formatarMoeda(p.preco)}</span>
        <div class="cartao-produto__rodape">
          <input type="number" min="1" value="1" ${semEstoque ? 'disabled' : ''} id="qtd-${p.codProduto}">
          <button class="botao botao--laranja" ${semEstoque ? 'disabled' : ''} onclick="adicionarProduto(${p.codProduto}, '${p.nome.replace(/'/g, "\\'")}', '${p.codigoInterno}', ${p.preco}, ${estoque.quantidade_atual})">
            ${semEstoque ? 'Esgotado' : 'Adicionar'}
          </button>
        </div>
      </div>
    </div>
  `
}

function adicionarProduto(id, nome, codigo, preco, estoqueDisponivel) {
  const qtd = parseInt(document.getElementById(`qtd-${id}`).value) || 1
  adicionarAoCarrinho({ tipo: 'produto', id, nome, codigo, preco, quantidade: qtd, estoqueDisponivel })
  alert('Produto adicionado ao carrinho!')
}

async function popularCategorias() {
  const select = document.getElementById('f-categoria')
  try {
    const categorias = await api.get('/categoria', { autenticado: false })
    categorias.forEach(c => {
      const opt = document.createElement('option')
      opt.value = c.codCategoria
      opt.textContent = c.nome
      if (params.get('categoria') && params.get('categoria') === c.nome) opt.selected = true
      select.appendChild(opt)
    })
  } catch (err) { console.error(err) }
}

async function carregarProdutos() {
  const grade = document.getElementById('grade-produtos')
  const contagem = document.getElementById('contagem-resultados')
  grade.innerHTML = `<p class="carregando">Carregando produtos...</p>`

  const query = new URLSearchParams()
  const busca = document.getElementById('f-busca').value.trim()
  if (busca) { query.set('nome', busca); query.set('codigo', busca) }

  const categoriaSelecionada = document.getElementById('f-categoria').value
  if (categoriaSelecionada) query.set('categoria', categoriaSelecionada)

  const precoMin = document.getElementById('f-preco-min').value
  const precoMax = document.getElementById('f-preco-max').value
  if (precoMin) query.set('precoMin', precoMin)
  if (precoMax) query.set('precoMax', precoMax)

  if (document.getElementById('f-disponivel').checked) query.set('disponivel', 'true')

  const ordenarPor = document.getElementById('f-ordenar').value
  if (ordenarPor) query.set('ordenarPor', ordenarPor)

  try {
    let produtos = await api.get(`/produto?${query.toString()}`, { autenticado: false })

    // busca simples também por código, já que o backend usa nome OU codigo com o mesmo termo
    if (busca) {
      produtos = produtos.filter(p =>
        p.nome.toLowerCase().includes(busca.toLowerCase()) ||
        p.codigoInterno.toLowerCase().includes(busca.toLowerCase())
      )
    }

    contagem.textContent = `${produtos.length} produto(s) encontrado(s)`
    grade.innerHTML = produtos.map(cartaoProdutoHtml).join('') || `
      <div class="vazio"><strong>Nenhum produto encontrado</strong>Tente ajustar os filtros de busca.</div>
    `
  } catch (err) {
    grade.innerHTML = `<p class="vazio">Não foi possível carregar o catálogo.</p>`
  }
}

document.getElementById('btnFiltrar').addEventListener('click', carregarProdutos)
document.getElementById('btnLimparFiltros').addEventListener('click', () => {
  document.getElementById('f-busca').value = ''
  document.getElementById('f-categoria').value = ''
  document.getElementById('f-preco-min').value = ''
  document.getElementById('f-preco-max').value = ''
  document.getElementById('f-disponivel').checked = false
  document.getElementById('f-ordenar').value = ''
  carregarProdutos()
})

if (params.get('busca')) document.getElementById('f-busca').value = params.get('busca')

popularCategorias().then(carregarProdutos)
