exigirCliente('../')
atualizarContadorCarrinho()
document.getElementById('nomeUsuario').textContent = sessao().nome
document.getElementById('btnLogout').addEventListener('click', () => { encerrarSessao(); location.href = '../index.html' })
document.getElementById('btnMenuMobile').addEventListener('click', () => document.getElementById('cabecalho').classList.toggle('menu-aberto'))

async function carregarPerfil() {
  try {
    const usuario = await api.get('/usuario/perfil')
    document.getElementById('p-nome').value = usuario.nome
    document.getElementById('p-email').value = usuario.email
    document.getElementById('p-telefone').value = usuario.telefone
    document.getElementById('p-cpf').value = usuario.cpf
  } catch (err) {
    console.error(err)
  }
}

document.getElementById('form-perfil').addEventListener('submit', async (e) => {
  e.preventDefault()
  const res = document.getElementById('res-perfil')
  res.className = 'mensagem-resposta'
  try {
    await api.put(`/usuario/${sessao().id}`, {
      nome: document.getElementById('p-nome').value.trim(),
      telefone: document.getElementById('p-telefone').value.trim()
    })
    sessionStorage.setItem('nome', document.getElementById('p-nome').value.trim())
    document.getElementById('nomeUsuario').textContent = sessao().nome
    res.textContent = 'Cadastro atualizado com sucesso!'
    res.classList.add('sucesso')
  } catch (err) {
    res.textContent = err.message || 'Erro ao atualizar cadastro.'
    res.classList.add('erro')
  }
})

async function carregarEnderecos() {
  const lista = document.getElementById('lista-enderecos-perfil')
  try {
    const enderecos = await api.get('/endereco')
    lista.innerHTML = enderecos.map(e => `
      <div class="painel" style="margin-bottom:.6rem;padding:.8rem 1rem;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:.6rem;">
          <span style="font-size:.86rem;">
            ${e.logradouro}, ${e.numero} ${e.complemento || ''}<br>
            ${e.bairro} — ${e.cidade}/${e.estado} — CEP ${e.cep}
            ${e.principal ? '<span class="badge badge--azul" style="margin-left:.4rem;">Principal</span>' : ''}
          </span>
          <button class="botao botao--perigo" style="padding:.3rem .6rem;font-size:.78rem;" onclick="removerEndereco(${e.codEndereco})">Remover</button>
        </div>
      </div>
    `).join('') || `<p style="font-size:.85rem;color:var(--cinza-600);">Nenhum endereço cadastrado.</p>`
  } catch (err) {
    lista.innerHTML = `<p class="vazio">Não foi possível carregar seus endereços.</p>`
  }
}

async function removerEndereco(id) {
  if (!confirm('Remover este endereço?')) return
  try {
    await api.delete(`/endereco/${id}`)
    carregarEnderecos()
  } catch (err) {
    alert(err.message || 'Não foi possível remover o endereço.')
  }
}

document.getElementById('ep-cep').addEventListener('blur', async (e) => {
  const cep = e.target.value.replace(/\D/g, '')
  if (cep.length !== 8) return
  try {
    const resp = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
    const dados = await resp.json()
    if (dados.erro) return
    document.getElementById('ep-logradouro').value = dados.logradouro || ''
    document.getElementById('ep-bairro').value = dados.bairro || ''
    document.getElementById('ep-cidade').value = dados.localidade || ''
    document.getElementById('ep-estado').value = dados.uf || ''
  } catch (err) { console.error(err) }
})

document.getElementById('form-endereco-perfil').addEventListener('submit', async (e) => {
  e.preventDefault()
  try {
    await api.post('/endereco', {
      cep: document.getElementById('ep-cep').value.trim(),
      numero: document.getElementById('ep-numero').value.trim(),
      complemento: document.getElementById('ep-complemento').value.trim(),
      logradouro: document.getElementById('ep-logradouro').value.trim(),
      bairro: document.getElementById('ep-bairro').value.trim(),
      cidade: document.getElementById('ep-cidade').value.trim(),
      estado: document.getElementById('ep-estado').value.trim(),
      principal: false
    })
    carregarEnderecos()
  } catch (err) {
    alert(err.message || 'Erro ao cadastrar endereço.')
  }
})

carregarPerfil()
carregarEnderecos()
