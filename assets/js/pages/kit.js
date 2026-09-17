exigirCliente('../')
atualizarContadorCarrinho()
document.getElementById('nomeUsuario').textContent = sessao().nome
document.getElementById('btnLogout').addEventListener('click', () => { encerrarSessao(); location.href = '../index.html' })
document.getElementById('btnMenuMobile').addEventListener('click', () => document.getElementById('cabecalho').classList.toggle('menu-aberto'))

const idKit = new URLSearchParams(location.search).get('id')
const area = document.getElementById('area-kit')

async function carregar() {
  if (!idKit) { area.innerHTML = `<p class="vazio">Kit não informado.</p>`; return }

  try {
    const k = await api.get(`/kit/${idKit}`, { autenticado: false })
    const disponivel = k.disponibilidade > 0

    area.innerHTML = `
      <p class="detalhe__trilha"><a href="./kits.html">Kits</a> / ${k.nome}</p>
      <div class="detalhe__layout">
        <div class="detalhe__imagem" style="background:linear-gradient(135deg, var(--laranja-100), var(--cinza-100)); color: var(--laranja-600);">${k.nome}</div>
        <div>
          <span class="badge badge--laranja">Kit de manutenção</span>
          <h1 style="margin-top:.6rem;">${k.nome}</h1>
          <p style="margin-top:1rem;color:var(--preto-900);">${k.descricao || ''}</p>
          <div class="detalhe__preco">${formatarMoeda(k.preco)}</div>
          <span class="badge ${disponivel ? 'badge--sucesso' : 'badge--erro'}">${disponivel ? k.disponibilidade + ' kit(s) disponíveis' : 'Componentes insuficientes em estoque'}</span>

          <h3 style="margin-top:1.6rem;font-size:1rem;">Composição do kit</h3>
          <div class="lista-composicao">
            ${(k.itensKit || []).map(item => `
              <div class="lista-composicao__item">
                <span>${item.produtoItemKit?.nome || 'Produto'}</span>
                <span style="font-family:var(--f-mono);">${item.quantidade}x</span>
              </div>
            `).join('')}
          </div>

          <div class="detalhe__acoes">
            <input type="number" id="qtd" min="1" value="1" ${disponivel ? '' : 'disabled'}>
            <button class="botao botao--laranja" id="btnAdd" ${disponivel ? '' : 'disabled'}>${disponivel ? 'Adicionar kit ao carrinho' : 'Indisponível'}</button>
          </div>
        </div>
      </div>
    `

    document.getElementById('btnAdd')?.addEventListener('click', () => {
      const qtd = parseInt(document.getElementById('qtd').value) || 1
      if (qtd > k.disponibilidade) {
        alert(`Só é possível montar ${k.disponibilidade} kit(s) com o estoque atual.`)
        return
      }
      adicionarAoCarrinho({ tipo: 'kit', id: k.codKit, nome: k.nome, codigo: 'KIT', preco: Number(k.preco), quantidade: qtd, estoqueDisponivel: k.disponibilidade })
      alert('Kit adicionado ao carrinho!')
    })
  } catch (err) {
    area.innerHTML = `<p class="vazio">Kit não encontrado.</p>`
  }
}

carregar()
