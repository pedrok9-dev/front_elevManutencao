exigirCliente('../')
atualizarContadorCarrinho()
document.getElementById('nomeUsuario').textContent = sessao().nome
document.getElementById('btnLogout').addEventListener('click', () => { encerrarSessao(); location.href = '../index.html' })
document.getElementById('btnMenuMobile').addEventListener('click', () => document.getElementById('cabecalho').classList.toggle('menu-aberto'))

const idProduto = new URLSearchParams(location.search).get('id')
const area = document.getElementById('area-produto')

async function carregar() {
  if (!idProduto) { area.innerHTML = `<p class="vazio">Produto não informado.</p>`; return }

  try {
    const p = await api.get(`/produto/${idProduto}`, { autenticado: false })
    const estoque = p.estoqueProduto || { quantidade_atual: 0, quantidade_minima: 0 }
    const semEstoque = estoque.quantidade_atual <= 0

    area.innerHTML = `
      <p class="detalhe__trilha"><a href="./loja.html">Catálogo</a> / ${p.categoriaProduto?.nome || ''} / ${p.nome}</p>
      <div class="detalhe__layout">
        <div class="detalhe__imagem">${p.nome}</div>
        <div>
          <span class="badge badge--azul">${p.categoriaProduto?.nome || ''}</span>
          <h1 style="margin-top:.6rem;">${p.nome}</h1>
          <p style="color:var(--cinza-600);font-family:var(--f-mono);font-size:.82rem;margin-top:.3rem;">Código: ${p.codigoInterno} &middot; Unidade: ${p.unidade}</p>
          <p style="margin-top:1rem;color:var(--preto-900);">${p.descricao || 'Sem descrição detalhada cadastrada.'}</p>
          <div class="detalhe__preco">${formatarMoeda(p.preco)}</div>
          <div class="indicador-estoque indicador-estoque--${semEstoque ? 'esgotado' : (estoque.quantidade_atual <= estoque.quantidade_minima ? 'baixo' : 'normal')}">
            <span class="indicador-estoque__segmentos"><span></span><span></span><span></span></span>
            ${semEstoque ? 'Sem estoque no momento' : `${estoque.quantidade_atual} unidade(s) disponíveis`}
          </div>
          ${p.fornecedorProduto ? `<p style="font-size:.8rem;color:var(--cinza-600);margin-top:.5rem;">Fornecedor: ${p.fornecedorProduto.razaoSocial}</p>` : ''}
          <div class="detalhe__acoes">
            <input type="number" id="qtd" min="1" value="1" ${semEstoque ? 'disabled' : ''}>
            <button class="botao botao--laranja" id="btnAdd" ${semEstoque ? 'disabled' : ''}>${semEstoque ? 'Produto esgotado' : 'Adicionar ao carrinho'}</button>
          </div>
        </div>
      </div>
    `

    document.getElementById('btnAdd')?.addEventListener('click', () => {
      const qtd = parseInt(document.getElementById('qtd').value) || 1
      if (qtd > estoque.quantidade_atual) {
        alert(`Só há ${estoque.quantidade_atual} unidade(s) em estoque.`)
        return
      }
      adicionarAoCarrinho({ tipo: 'produto', id: p.codProduto, nome: p.nome, codigo: p.codigoInterno, preco: Number(p.preco), quantidade: qtd, estoqueDisponivel: estoque.quantidade_atual })
      alert('Produto adicionado ao carrinho!')
    })
  } catch (err) {
    area.innerHTML = `<p class="vazio">Produto não encontrado.</p>`
  }
}

carregar()
