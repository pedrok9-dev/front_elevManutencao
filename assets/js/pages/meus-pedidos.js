exigirCliente('../')
atualizarContadorCarrinho()
document.getElementById('nomeUsuario').textContent = sessao().nome
document.getElementById('btnLogout').addEventListener('click', () => { encerrarSessao(); location.href = '../index.html' })
document.getElementById('btnMenuMobile').addEventListener('click', () => document.getElementById('cabecalho').classList.toggle('menu-aberto'))

const rotuloStatus = {
  PENDENTE: ['Pendente', 'badge--alerta'],
  CONFIRMADO: ['Confirmado', 'badge--azul'],
  EM_PREPARACAO: ['Em preparação', 'badge--alerta'],
  ENVIADO: ['Enviado', 'badge--azul'],
  ENTREGUE: ['Entregue', 'badge--sucesso'],
  CANCELADO: ['Cancelado', 'badge--erro']
}

async function carregar() {
  const lista = document.getElementById('lista-pedidos')
  try {
    const pedidos = await api.get('/pedido/meus-pedidos')

    if (pedidos.length === 0) {
      lista.innerHTML = `<div class="vazio painel"><strong>Você ainda não fez nenhum pedido</strong>Explore o catálogo para começar.</div>`
      return
    }

    lista.innerHTML = pedidos.map(p => {
      const [rotulo, classe] = rotuloStatus[p.status] || ['—', 'badge--neutro']
      return `
        <div class="painel" style="margin-bottom:1rem;">
          <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:.6rem;align-items:center;">
            <div>
              <strong>Pedido #${p.codPedido}</strong>
              <p style="font-size:.8rem;color:var(--cinza-600);">${new Date(p.dataPedido).toLocaleString('pt-BR')}</p>
            </div>
            <span class="badge ${classe}">${rotulo}</span>
          </div>
          <hr style="border:none;border-top:1px solid var(--cinza-100);margin:.8rem 0;">
          <div style="font-size:.88rem;display:flex;flex-direction:column;gap:.3rem;">
            ${(p.itensPedido || []).map(i => `<span>${i.quantidade}x ${i.idKit ? 'Kit' : 'Produto'} #${i.idKit || i.idProduto} — ${formatarMoeda(i.subtotal)}</span>`).join('')}
          </div>
          ${p.entregaPedido ? `<p style="font-size:.82rem;color:var(--cinza-600);margin-top:.6rem;">Entrega: ${p.entregaPedido.logradouro}, ${p.entregaPedido.numero} — ${p.entregaPedido.cidade}/${p.entregaPedido.estado}${p.entregaPedido.codigoRastreio ? ' · Rastreio: ' + p.entregaPedido.codigoRastreio : ''}</p>` : ''}
          <div style="text-align:right;font-weight:700;color:var(--azul-900);margin-top:.6rem;">Total: ${formatarMoeda(p.valorTotal)}</div>
        </div>
      `
    }).join('')
  } catch (err) {
    lista.innerHTML = `<p class="vazio">Não foi possível carregar seus pedidos.</p>`
  }
}

carregar()
