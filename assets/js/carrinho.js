// ==========================================================================
// Carrinho de compras — persistido em localStorage (RF06).
// Cada item: { tipo: 'produto'|'kit', id, nome, codigo, preco, quantidade, estoqueDisponivel }
// ==========================================================================
function obterCarrinho() {
  return JSON.parse(localStorage.getItem('carrinho')) || []
}

function salvarCarrinho(carrinho) {
  localStorage.setItem('carrinho', JSON.stringify(carrinho))
  atualizarContadorCarrinho()
}

function adicionarAoCarrinho(item) {
  const carrinho = obterCarrinho()
  const existente = carrinho.find(i => i.tipo === item.tipo && i.id === item.id)

  if (existente) {
    existente.quantidade += item.quantidade
  } else {
    carrinho.push(item)
  }

  salvarCarrinho(carrinho)
}

function removerDoCarrinho(tipo, id) {
  const carrinho = obterCarrinho().filter(i => !(i.tipo === tipo && i.id === id))
  salvarCarrinho(carrinho)
}

function limparCarrinho() {
  localStorage.removeItem('carrinho')
  atualizarContadorCarrinho()
}

function totalItensCarrinho() {
  return obterCarrinho().reduce((soma, i) => soma + i.quantidade, 0)
}

function totalCarrinho() {
  return obterCarrinho().reduce((soma, i) => soma + (i.preco * i.quantidade), 0)
}

function atualizarContadorCarrinho() {
  const contadores = document.querySelectorAll('[data-contador-carrinho]')
  contadores.forEach(el => { el.textContent = totalItensCarrinho() })
}

function formatarMoeda(valor) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
