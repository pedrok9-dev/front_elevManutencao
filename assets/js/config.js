const URL_BACKEND_RAILWAY = 'https://selfless-mindfulness-production-45b6.up.railway.app'

const API_BASE_URL = (() => {
  const host = window.location.hostname
  if (host === 'localhost' || host === '127.0.0.1') {
    return 'http://localhost:3000'
  }
  return URL_BACKEND_RAILWAY
})()
