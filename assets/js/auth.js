function sessao() {
  return {
    token: sessionStorage.getItem('token'),
    id: Number(sessionStorage.getItem('id')) || null,
    nome: sessionStorage.getItem('nome'),
    tipo: sessionStorage.getItem('tipo')
  }
}

function salvarSessao(dados) {
  sessionStorage.setItem('token', dados.token)
  sessionStorage.setItem('id', dados.usuario.id)
  sessionStorage.setItem('nome', dados.usuario.nome)
  sessionStorage.setItem('tipo', dados.usuario.tipo)
}

function encerrarSessao() {
  sessionStorage.clear()
}

function exigirLogin(raizPath = '../') {
  if (!sessao().token) {
    location.href = `${raizPath}index.html`
    return false
  }
  return true
}

function exigirAdmin(raizPath = '../') {
  if (!exigirLogin(raizPath)) return false
  if (sessao().tipo !== 'ADMIN') {
    location.href = `${raizPath}pages/home.html`
    return false
  }
  return true
}

function exigirCliente(raizPath = '../') {
  if (!exigirLogin(raizPath)) return false
  if (sessao().tipo !== 'CLIENTE') {
    location.href = `${raizPath}admin/dashboard.html`
    return false
  }
  return true
}
