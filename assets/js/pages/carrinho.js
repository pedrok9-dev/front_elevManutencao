exigirCliente('../')
atualizarContadorCarrinho()
document.getElementById('nomeUsuario').textContent = sessao().nome
document.getElementById('btnLogout').addEventListener('click', () => { encerrarSessao(); location.href = '../index.html' })
document.getElementById('btnMenuMobile').addEventListener('click', () => document.getElementById('cabecalho').classList.toggle('menu-aberto'))

function renderizar() {
  const carrinho = obterCarrinho()
  const lista = document.getElementById('lista-carrinho')

  if (carrinho.length === 0) {
    lista.innerHTML = `<div class="vazio painel"><strong>Seu carrinho está vazio</strong>Explore o catálogo ou os kits de manutenção.</div>`
    document.getElementById('btnCheckout').classList.add('botao--bloco')
    document.getElementById('btnCheckout').setAttribute('aria-disabled', 'true')
    document.getElementById('btnCheckout').style.pointerEvents = 'none'
    document.getElementById('btnCheckout').style.opacity = '.5'
  } else {
    lista.innerHTML = `
      <table class="tabela-padrao">
        <thead><tr><th>Item</th><th>Preço</th><th>Qtd.</th><th>Subtotal</th><th></th></tr></thead>
        <tbody>
          ${carrinho.map(i => `
            <tr>
              <td>
                <strong>${i.nome}</strong><br>
                <span style="font-size:.75rem;color:var(--cinza-600);font-family:var(--f-mono);">${i.tipo === 'kit' ? 'KIT' : i.codigo}</span>
              </td>
              <td>${formatarMoeda(i.preco)}</td>
              <td>
                <input type="number" min="1" max="${i.estoqueDisponivel}" value="${i.quantidade}" style="width:64px;padding:.4rem;border:1.5px solid var(--cinza-200);border-radius:4px;"
                  onchange="alterarQuantidade('${i.tipo}', ${i.id}, this.value)">
              </td>
              <td>${formatarMoeda(i.preco * i.quantidade)}</td>
              <td><button class="botao botao--perigo" style="padding:.4rem .7rem;" onclick="removerItem('${i.tipo}', ${i.id})">Remover</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `
  }

  document.getElementById('resumo-itens').textContent = totalItensCarrinho()
  document.getElementById('resumo-total').textContent = formatarMoeda(totalCarrinho())
}

function alterarQuantidade(tipo, id, valor) {
  const carrinho = obterCarrinho()
  const item = carrinho.find(i => i.tipo === tipo && i.id === id)
  let qtd = parseInt(valor) || 1
  if (item.estoqueDisponivel && qtd > item.estoqueDisponivel) {
    alert(`Disponível: ${item.estoqueDisponivel} unidade(s).`)
    qtd = item.estoqueDisponivel
  }
  item.quantidade = qtd
  salvarCarrinho(carrinho)
  renderizar()
}

function removerItem(tipo, id) {
  removerDoCarrinho(tipo, id)
  renderizar()
}

renderizar()
