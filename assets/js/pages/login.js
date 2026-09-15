const formLogin = document.getElementById('form-login')
const resLogin = document.getElementById('res')

if (sessao().token) {
  location.href = sessao().tipo === 'ADMIN' ? './admin/dashboard.html' : './pages/home.html'
}

formLogin.addEventListener('submit', async (e) => {
  e.preventDefault()

  const email = document.getElementById('email').value.trim()
  const senha = document.getElementById('senha').value

  resLogin.className = 'mensagem-resposta'
  resLogin.textContent = ''

  if (!email || !senha) {
    resLogin.textContent = 'Preencha e-mail e senha.'
    resLogin.classList.add('erro')
    return
  }

  try {
    const dados = await api.post('/login', { email, senha }, { autenticado: false })
    salvarSessao(dados)

    resLogin.textContent = 'Login realizado com sucesso! Redirecionando...'
    resLogin.classList.add('sucesso')

    setTimeout(() => {
      location.href = dados.usuario.tipo === 'ADMIN' ? './admin/dashboard.html' : './pages/home.html'
    }, 900)
  } catch (err) {
    resLogin.textContent = err.message || 'Erro ao fazer login.'
    resLogin.classList.add('erro')
  }
})
