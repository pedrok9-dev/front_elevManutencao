const formCadastro = document.getElementById('form-cadastro')
const resCadastro = document.getElementById('res')
const campoCep = document.getElementById('cep')

campoCep.addEventListener('blur', async () => {
  const cep = campoCep.value.replace(/\D/g, '')
  if (cep.length !== 8) return

  try {
    const resp = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
    const dados = await resp.json()

    if (dados.erro) {
      resCadastro.textContent = 'CEP não encontrado.'
      resCadastro.className = 'mensagem-resposta erro'
      return
    }

    document.getElementById('logradouro').value = dados.logradouro || ''
    document.getElementById('bairro').value = dados.bairro || ''
    document.getElementById('cidade').value = dados.localidade || ''
    document.getElementById('estado').value = dados.uf || ''
  } catch (err) {
    console.error('Erro ao consultar CEP:', err)
  }
})

formCadastro.addEventListener('submit', async (e) => {
  e.preventDefault()

  resCadastro.className = 'mensagem-resposta'
  resCadastro.textContent = ''

  const nome = document.getElementById('nome').value.trim()
  const email = document.getElementById('email').value.trim()
  const telefone = document.getElementById('telefone').value.trim()
  const cpf = document.getElementById('cpf').value.trim()
  const senha = document.getElementById('senha').value

  if (!nome || !email || !telefone || !cpf || !senha) {
    resCadastro.textContent = 'Preencha todos os campos obrigatórios.'
    resCadastro.classList.add('erro')
    return
  }

  try {
    await api.post('/usuario', { nome, email, telefone, cpf, senha }, { autenticado: false })

    const loginDados = await api.post('/login', { email, senha }, { autenticado: false })
    salvarSessao(loginDados)

    const cep = document.getElementById('cep').value.trim()
    const numero = document.getElementById('numero').value.trim()
    if (cep && numero) {
      try {
        await api.post('/endereco', {
          cep,
          numero,
          complemento: document.getElementById('complemento').value.trim(),
          logradouro: document.getElementById('logradouro').value.trim(),
          bairro: document.getElementById('bairro').value.trim(),
          cidade: document.getElementById('cidade').value.trim(),
          estado: document.getElementById('estado').value.trim(),
          principal: true
        })
      } catch (errEndereco) {
        console.warn('Endereço não cadastrado automaticamente:', errEndereco.message)
      }
    }

    resCadastro.textContent = 'Conta criada com sucesso! Redirecionando...'
    resCadastro.classList.add('sucesso')

    setTimeout(() => { location.href = './home.html' }, 900)
  } catch (err) {
    resCadastro.textContent = err.message || 'Erro ao cadastrar.'
    resCadastro.classList.add('erro')
  }
})
