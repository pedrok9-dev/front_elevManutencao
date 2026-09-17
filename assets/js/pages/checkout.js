exigirCliente('../')
atualizarContadorCarrinho()
document.getElementById('nomeUsuario').textContent = sessao().nome
document.getElementById('btnLogout').addEventListener('click', () => { encerrarSessao(); location.href = '../index.html' })
document.getElementById('btnMenuMobile').addEventListener('click', () => document.getElementById('cabecalho').classList.toggle('menu-aberto'))

let enderecoSelecionado = null

if (obterCarrinho().length === 0) {
  location.href = './carrinho.html'
}

function renderizarResumo() {
  const carrinho = obterCarrinho()
  document.getElementById('resumo-itens-checkout').innerHTML = carrinho.map(i => `
    <div style="display:flex;justify-content:space-between;">
      <span>${i.quantidade}x ${i.nome}</span>
      <span>${formatarMoeda(i.preco * i.quantidade)}</span>
    </div>
  `).join('')
  document.getElementById('checkout-total').textContent = formatarMoeda(totalCarrinho())
}

async function carregarEnderecos() {
  const lista = document.getElementById('lista-enderecos')
  try {
    const enderecos = await api.get('/endereco')

    if (enderecos.length === 0) {
      lista.innerHTML = `<p style="font-size:.85rem;color:var(--cinza-600);">Nenhum endereço cadastrado. Cadastre um abaixo.</p>`
      return
    }

    lista.innerHTML = enderecos.map((e, idx) => `
      <label style="display:flex;gap:.6rem;align-items:flex-start;padding:.7rem;border:1.5px solid var(--cinza-200);border-radius:8px;margin-bottom:.6rem;cursor:pointer;">
        <input type="radio" name="endereco" value="${e.codEndereco}" ${idx === 0 || e.principal ? 'checked' : ''} style="margin-top:.2rem;">
        <span style="font-size:.88rem;">
          ${e.logradouro}, ${e.numero} ${e.complemento || ''}<br>
          ${e.bairro} — ${e.cidade}/${e.estado} — CEP ${e.cep}
          ${e.principal ? '<span class="badge badge--azul" style="margin-left:.4rem;">Principal</span>' : ''}
        </span>
      </label>
    `).join('')

    const principal = enderecos.find(e => e.principal) || enderecos[0]
    enderecoSelecionado = principal.codEndereco

    lista.querySelectorAll('input[name=endereco]').forEach(input => {
      input.addEventListener('change', () => { enderecoSelecionado = Number(input.value) })
    })
  } catch (err) {
    lista.innerHTML = `<p class="vazio">Não foi possível carregar seus endereços.</p>`
  }
}

document.getElementById('ne-cep').addEventListener('blur', async (e) => {
  const cep = e.target.value.replace(/\D/g, '')
  if (cep.length !== 8) return
  try {
    const resp = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
    const dados = await resp.json()
    if (dados.erro) return
    document.getElementById('ne-logradouro').value = dados.logradouro || ''
    document.getElementById('ne-bairro').value = dados.bairro || ''
    document.getElementById('ne-cidade').value = dados.localidade || ''
    document.getElementById('ne-estado').value = dados.uf || ''
  } catch (err) { console.error(err) }
})

document.getElementById('form-novo-endereco').addEventListener('submit', async (e) => {
  e.preventDefault()
  try {
    await api.post('/endereco', {
      cep: document.getElementById('ne-cep').value.trim(),
      numero: document.getElementById('ne-numero').value.trim(),
      complemento: document.getElementById('ne-complemento').value.trim(),
      logradouro: document.getElementById('ne-logradouro').value.trim(),
      bairro: document.getElementById('ne-bairro').value.trim(),
      cidade: document.getElementById('ne-cidade').value.trim(),
      estado: document.getElementById('ne-estado').value.trim(),
      principal: false
    })
    await carregarEnderecos()
  } catch (err) {
    alert(err.message || 'Erro ao cadastrar endereço.')
  }
})

document.getElementById('btnConfirmarPedido').addEventListener('click', async () => {
  const res = document.getElementById('res-checkout')
  res.className = 'mensagem-resposta'
  res.textContent = ''

  if (!enderecoSelecionado) {
    res.textContent = 'Selecione um endereço de entrega.'
    res.classList.add('erro')
    return
  }

  const carrinho = obterCarrinho()
  const itens = carrinho.map(i => ({ tipo: i.tipo, id: i.id, quantidade: i.quantidade }))

  try {
    const resultado = await api.post('/pedido', { idEndereco: enderecoSelecionado, itens })
    limparCarrinho()
    res.textContent = `Pedido #${resultado.pedido.codPedido} confirmado com sucesso!`
    res.classList.add('sucesso')
    setTimeout(() => { location.href = './meus-pedidos.html' }, 1200)
  } catch (err) {
    res.textContent = err.message || 'Erro ao confirmar pedido.'
    res.classList.add('erro')
  }
})

renderizarResumo()
carregarEnderecos()
