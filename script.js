
const $ = (seletor) => document.querySelector(seletor);

// MENU MOBILE
const botaoMenu = $("#botao-menu");
const menu = $("#menu");

botaoMenu?.addEventListener("click", () => {
  const aberto = menu.classList.toggle("aberto");
  botaoMenu.setAttribute("aria-expanded", String(aberto));
});

menu?.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    menu.classList.remove("aberto");
    botaoMenu?.setAttribute("aria-expanded", "false");
  });
});

// POP-UP DE LOGIN
const modal = $("#modal-login");

$("#abrir-login")?.addEventListener("click", () => {
  modal.classList.add("aberto");
  $("#email-login")?.focus();
});

$("#fechar-login")?.addEventListener("click", () => {
  modal.classList.remove("aberto");
});

modal?.addEventListener("click", evento => {
  if (evento.target === modal) {
    modal.classList.remove("aberto");
  }
});

document.addEventListener("keydown", evento => {
  if (evento.key === "Escape") {
    modal?.classList.remove("aberto");
  }
});

// FORMATAÇÃO DE PREÇO
function moeda(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

// CARRINHO SALVO NO NAVEGADOR
const CHAVE_CARRINHO = "aShawarmaCart";

function obterCarrinho() {
  try {
    const dados = JSON.parse(localStorage.getItem(CHAVE_CARRINHO));
    return Array.isArray(dados) ? dados : [];
  } catch {
    return [];
  }
}

function salvarCarrinho(carrinho) {
  localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(carrinho));
  atualizarCarrinho();
}

function atualizarCarrinho() {
  const carrinho = obterCarrinho();
  const contador = $("#contador-carrinho");
  const container = $("#itens-carrinho");
  const totalElemento = $("#total-carrinho");

  const quantidadeTotal = carrinho.reduce(
    (soma, item) => soma + item.quantidade,
    0
  );

  if (contador) {
    contador.textContent = quantidadeTotal;
  }

  if (!container || !totalElemento) return;

  if (carrinho.length === 0) {
    container.innerHTML =
      '<p class="carrinho-vazio">Seu carrinho está vazio.</p>';

    totalElemento.textContent = moeda(0);
    return;
  }

  container.innerHTML = carrinho.map((item, indice) => `
    <div class="item-carrinho">
      <div>
        <strong>${escaparHTML(item.nome)}</strong>
        <p>${moeda(item.preco)} por unidade</p>
      </div>

      <div class="quantidade">
        <button data-acao="menos" data-indice="${indice}" aria-label="Diminuir">−</button>
        <span>${item.quantidade}</span>
        <button data-acao="mais" data-indice="${indice}" aria-label="Aumentar">+</button>
      </div>

      <div>
        <strong>${moeda(item.preco * item.quantidade)}</strong>
        <button class="remover-item" data-acao="remover" data-indice="${indice}">Remover</button>
      </div>
    </div>
  `).join("");

  const total = carrinho.reduce(
    (soma, item) => soma + item.preco * item.quantidade,
    0
  );

  totalElemento.textContent = moeda(total);
}

function escaparHTML(texto) {
  return String(texto).replace(/[&<>"']/g, caractere => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[caractere]);
}

// ADICIONAR PRODUTOS
document.querySelectorAll(".adicionar").forEach(botao => {
  botao.addEventListener("click", () => {
    const nome = botao.dataset.nome;
    const preco = Number(botao.dataset.preco);
    const carrinho = obterCarrinho();
    const existente = carrinho.find(item => item.nome === nome);

    if (existente) {
      existente.quantidade += 1;
    } else {
      carrinho.push({ nome, preco, quantidade: 1 });
    }

    salvarCarrinho(carrinho);

    const original = botao.textContent;
    botao.textContent = "✓ Adicionado";

    setTimeout(() => {
      botao.textContent = original;
    }, 900);
  });
});

// ALTERAR QUANTIDADE OU REMOVER PRODUTOS
$("#itens-carrinho")?.addEventListener("click", evento => {
  const botao = evento.target.closest("button[data-acao]");
  if (!botao) return;

  const indice = Number(botao.dataset.indice);
  const carrinho = obterCarrinho();
  const item = carrinho[indice];

  if (!item) return;

  if (botao.dataset.acao === "mais") {
    item.quantidade += 1;
  } else if (botao.dataset.acao === "menos") {
    item.quantidade -= 1;

    if (item.quantidade <= 0) {
      carrinho.splice(indice, 1);
    }
  } else if (botao.dataset.acao === "remover") {
    carrinho.splice(indice, 1);
  }

  salvarCarrinho(carrinho);
});

// BUSCAR NA PÁGINA INICIAL
$("#form-busca")?.addEventListener("submit", evento => {
  evento.preventDefault();

  const termo = $("#campo-busca").value.trim().toLocaleLowerCase("pt-BR");
  const cards = document.querySelectorAll(".card-produto");
  const mensagem = $("#mensagem-busca");
  let encontrados = 0;

  cards.forEach(card => {
    const nome = (card.dataset.nome || "").toLocaleLowerCase("pt-BR");
    const texto = card.textContent.toLocaleLowerCase("pt-BR");
    const corresponde = !termo || nome.includes(termo) || texto.includes(termo);

    card.hidden = !corresponde;

    if (corresponde) encontrados++;
  });

  mensagem.textContent = encontrados === 0
    ? "Nenhum produto encontrado. Tente outra busca."
    : termo
      ? `${encontrados} produto(s) encontrado(s).`
      : "";

  $("#produtos").scrollIntoView({ behavior: "smooth" });
});

// LOGIN DEMONSTRATIVO
$("#form-login")?.addEventListener("submit", evento => {
  evento.preventDefault();

  alert(
    "Este é um formulário demonstrativo. " +
    "Para autenticar usuários, conecte um backend."
  );
});

// FINALIZAR PEDIDO
$("#finalizar-compra")?.addEventListener("click", () => {
  const carrinho = obterCarrinho();

  if (carrinho.length === 0) {
    alert("Seu carrinho está vazio!");
    return;
  }

  alert(
    "Pedido demonstrativo preparado! " +
    "Para registrar a compra, será necessário conectar um sistema de pedidos."
  );
});

// INICIAR A PÁGINA
atualizarCarrinho();
