async function apiFetch(caminho, { metodo = 'GET', corpo = null, autenticado = true } = {}) {
  const headers = { 'Content-Type': 'application/json' }

  if (autenticado) {
    const token = sessionStorage.getItem('token')
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  const resposta = await fetch(`${API_BASE_URL}${caminho}`, {
    method: metodo,
    headers,
    body: corpo ? JSON.stringify(corpo) : undefined
  })

  let dados = null
  try { dados = await resposta.json() } catch (e) { dados = null }

  if (!resposta.ok) {
    const mensagem = (dados && (dados.erro || dados.mensagem)) || 'Erro ao comunicar com o servidor'
    throw new Error(mensagem)
  }

  return dados
}

const api = {
  get: (caminho, opts) => apiFetch(caminho, { ...opts, metodo: 'GET' }),
  post: (caminho, corpo, opts) => apiFetch(caminho, { ...opts, metodo: 'POST', corpo }),
  put: (caminho, corpo, opts) => apiFetch(caminho, { ...opts, metodo: 'PUT', corpo }),
  patch: (caminho, corpo, opts) => apiFetch(caminho, { ...opts, metodo: 'PATCH', corpo }),
  delete: (caminho, opts) => apiFetch(caminho, { ...opts, metodo: 'DELETE' })
}
