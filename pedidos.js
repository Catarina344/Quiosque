
const CHAVE_PEDIDOS = "pedidosAShawarma";
const CHAVE_CARRINHO = "aShawarmaCart";

const listaPedidos = document.querySelector("#lista-pedidos");
const filtroPedidos = document.querySelector("#filtro-pedidos");
const semPedidos = document.querySelector("#sem-pedidos");

const modal = document.querySelector("#modal-pedido");
const detalhesPedido = document.querySelector("#detalhes-pedido");

// FORMATAR PREÇO
function formatarPreco(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

// PROTEGER TEXTO INSERIDO NO HTML
function escaparHTML(valor) {
  return String(valor ?? "").replace(/[&<>"']/g, caractere => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[caractere]);
}

// LER PEDIDOS
function obterPedidos() {
  try {
    const dados = JSON.parse(localStorage.getItem(CHAVE_PEDIDOS));
    return Array.isArray(dados) ? dados : [];
  } catch {
    return [];
  }
}

// FORMATAR DATA
function formatarData(data) {
  const dataValida = new Date(data);

  if (Number.isNaN(dataValida.getTime())) {
    return "Data não informada";
  }

  return dataValida.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

// NOME DO STATUS
function nomeStatus(status) {
  const nomes = {
    preparando: "Preparando",
    transporte: "Saiu para entrega",
    entregue: "Entregue",
    cancelado: "Cancelado"
  };

  return nomes[status] || "Em análise";
}

// ATUALIZAR RESUMO
function atualizarResumo(pedidos) {
  document.querySelector("#total-pedidos").textContent =
    pedidos.length;

  document.querySelector("#pedidos-andamento").textContent =
    pedidos.filter(p =>
      ["preparando", "transporte"].includes(p.status)
    ).length;

  document.querySelector("#pedidos-entregues").textContent =
    pedidos.filter(p => p.status === "entregue").length;
}

// DESENHAR PEDIDOS
function renderizarPedidos() {
  const pedidos = obterPedidos();

  atualizarResumo(pedidos);

  const filtro = filtroPedidos.value;

  const filtrados = pedidos.filter(pedido =>
    filtro === "todos" || pedido.status === filtro
  );

  semPedidos.hidden = filtrados.length !== 0;
  listaPedidos.innerHTML = "";

  filtrados.forEach(pedido => {
    const produtos = Array.isArray(pedido.produtos)
      ? pedido.produtos
      : [];

    const resumoProdutos = produtos.map(item =>
      `${Number(item.quantidade) || 1}x ${escaparHTML(item.nome)}`
    ).join(", ");

    const card = document.createElement("article");
    card.className = "pedido-card";

    const status = pedido.status || "preparando";

    card.innerHTML = `
      <div class="pedido-topo">
        <div>
          <div class="numero-pedido">
            Pedido #${escaparHTML(pedido.id)}
          </div>
          <div class="data-pedido">
            ${escaparHTML(formatarData(pedido.data))}
          </div>
        </div>

        <span class="status ${escaparHTML(status)}">
          ${escaparHTML(nomeStatus(status))}
        </span>
      </div>

      <div class="pedido-corpo">
        <div class="produtos-pedido">
          ${resumoProdutos || "Produtos não informados"}
        </div>

        <div class="total-pedido">
          <span>Total do pedido</span>
          <strong>${formatarPreco(pedido.total || 0)}</strong>
        </div>
      </div>

      <div class="pedido-acoes">
        <button class="botao-detalhes"
          data-acao="detalhes"
          data-id="${escaparHTML(pedido.id)}">
          Ver detalhes
        </button>

        <button class="botao-comprar-novamente"
          data-acao="comprar"
          data-id="${escaparHTML(pedido.id)}">
          Comprar novamente
        </button>
      </div>
    `;

    listaPedidos.appendChild(card);
  });
}

// ABRIR DETALHES
function abrirDetalhes(id) {
  const pedido = obterPedidos().find(
    p => String(p.id) === String(id)
  );

  if (!pedido) return;

  document.querySelector("#modal-titulo").textContent =
    `Pedido #${pedido.id}`;

  const produtos = Array.isArray(pedido.produtos)
    ? pedido.produtos
    : [];

  const listaProdutos = produtos.map(item => `
    <div class="detalhe-linha">
      <span>
        ${Number(item.quantidade) || 1}x
        ${escaparHTML(item.nome)}
      </span>
      <strong>
        ${formatarPreco(
          Number(item.preco) * (Number(item.quantidade) || 1)
        )}
      </strong>
    </div>
  `).join("");

  detalhesPedido.innerHTML = `
    <div class="detalhe-linha">
      <span>Data</span>
      <strong>${escaparHTML(formatarData(pedido.data))}</strong>
    </div>

    <div class="detalhe-linha">
      <span>Status</span>
      <strong>${escaparHTML(nomeStatus(pedido.status))}</strong>
    </div>

    <div class="detalhe-produtos">
      <strong>Produtos do pedido</strong>
      ${listaProdutos || "<p>Sem produtos cadastrados.</p>"}
    </div>

    <div class="detalhe-linha">
      <span>Total</span>
      <strong>${formatarPreco(pedido.total || 0)}</strong>
    </div>
  `;

  modal.hidden = false;
}

// FECHAR MODAL
document.querySelector("#fechar-modal")
  .addEventListener("click", () => {
    modal.hidden = true;
  });

modal.addEventListener("click", evento => {
  if (evento.target === modal) {
    modal.hidden = true;
  }
});

document.addEventListener("keydown", evento => {
  if (evento.key === "Escape") {
    modal.hidden = true;
  }
});

// COMPRAR NOVAMENTE
function comprarNovamente(id) {
  const pedido = obterPedidos().find(
    p => String(p.id) === String(id)
  );

  if (!pedido || !Array.isArray(pedido.produtos)) return;

  let carrinho = [];

  try {
    carrinho = JSON.parse(
      localStorage.getItem(CHAVE_CARRINHO)
    ) || [];
  } catch {
    carrinho = [];
  }

  pedido.produtos.forEach(produto => {
    const existente = carrinho.find(
      item => item.nome === produto.nome
    );

    const quantidade = Number(produto.quantidade) || 1;

    if (existente) {
      existente.quantidade =
        Number(existente.quantidade) + quantidade;
    } else {
      carrinho.push({
        nome: produto.nome,
        preco: Number(produto.preco),
        quantidade
      });
    }
  });

  localStorage.setItem(
    CHAVE_CARRINHO,
    JSON.stringify(carrinho)
  );

  alert("Produtos adicionados novamente ao carrinho!");

  window.location.href = "cardapio.html";
}

// CLIQUES NOS BOTÕES
listaPedidos.addEventListener("click", evento => {
  const botao = evento.target.closest("[data-acao]");

  if (!botao) return;

  const id = botao.dataset.id;

  if (botao.dataset.acao === "detalhes") {
    abrirDetalhes(id);
  }

  if (botao.dataset.acao === "comprar") {
    comprarNovamente(id);
  }
});

// FILTRAR PEDIDOS
filtroPedidos.addEventListener("change", renderizarPedidos);

// INICIAR
renderizarPedidos();
