exigirCliente('../')
atualizarContadorCarrinho()
document.getElementById('nomeUsuario').textContent = sessao().nome
document.getElementById('btnLogout').addEventListener('click', () => { encerrarSessao(); location.href = '../index.html' })
document.getElementById('btnMenuMobile').addEventListener('click', () => document.getElementById('cabecalho').classList.toggle('menu-aberto'))

function cartaoKitHtml(k) {
  const disponivel = k.disponibilidade > 0
  return `
    <div class="cartao-produto">
      <a href="./kit.html?id=${k.codKit}">
        <div class="cartao-produto__imagem" style="background:linear-gradient(135deg, var(--laranja-100), var(--cinza-100)); color: var(--laranja-600);">
          <span class="badge badge--laranja" style="position:absolute;top:.6rem;left:.6rem;">KIT</span>
          ${k.nome}
        </div>
      </a>
      <div class="cartao-produto__corpo">
        <span class="cartao-produto__categoria">${k.categoriaKit?.nome || 'Kit de manutenção'}</span>
        <a href="./kit.html?id=${k.codKit}"><span class="cartao-produto__nome">${k.nome}</span></a>
        <p style="font-size:.82rem;color:var(--cinza-600);">${k.descricao || ''}</p>
        <span class="badge ${disponivel ? 'badge--sucesso' : 'badge--erro'}">${disponivel ? k.disponibilidade + ' disponíveis' : 'Indisponível'}</span>
        <span class="cartao-produto__preco">${formatarMoeda(k.preco)}</span>
        <div class="cartao-produto__rodape">
          <a href="./kit.html?id=${k.codKit}" class="botao botao--laranja botao--bloco">Ver composição</a>
        </div>
      </div>
    </div>
  `
}

async function carregar() {
  const grade = document.getElementById('grade-kits')
  try {
    const kits = await api.get('/kit', { autenticado: false })
    grade.innerHTML = kits.map(cartaoKitHtml).join('') || `<div class="vazio"><strong>Nenhum kit cadastrado</strong>Volte em breve.</div>`
  } catch (err) {
    grade.innerHTML = `<p class="vazio">Não foi possível carregar os kits.</p>`
  }
}

carregar()
