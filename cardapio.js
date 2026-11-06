
const CHAVE_CARRINHO = "aShawarmaCart";

const campoBusca = document.querySelector("#campo-busca");
const formBusca = document.querySelector("#form-busca");
const botoesCategoria = document.querySelectorAll(".categoria");
const grade = document.querySelector("#grade-cardapio");
const ordenar = document.querySelector("#ordenar-produtos");
const mensagem = document.querySelector("#mensagem-cardapio");

// NORMALIZAR TEXTO: permite buscar sem acentos
function normalizar(texto) {
  return String(texto)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

// MOEDA
function moeda(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

// CARRINHO
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

  const contador = document.querySelector("#contador-carrinho");
  const quantidade = document.querySelector("#quantidade-carrinho");
  const itens = document.querySelector("#itens-carrinho");
  const totalElemento = document.querySelector("#total-carrinho");

  const totalItens = carrinho.reduce(
    (soma, item) => soma + Number(item.quantidade), 0
  );

  const total = carrinho.reduce(
    (soma, item) => soma + Number(item.preco) * Number(item.quantidade), 0
  );

  if (contador) contador.textContent = totalItens;

  if (quantidade) {
    quantidade.textContent =
      `${totalItens} ${totalItens === 1 ? "item" : "itens"}`;
  }

  if (totalElemento) totalElemento.textContent = moeda(total);

  if (!itens) return;

  if (carrinho.length === 0) {
    itens.innerHTML =
      '<p class="carrinho-vazio">Seu carrinho está vazio.</p>';
    return;
  }

  itens.innerHTML = carrinho.map((item, indice) => `
    <div class="item-carrinho">
      <div>
        <strong>${item.nome}</strong>
        <p>${moeda(item.preco)} por unidade</p>
      </div>

      <div class="quantidade">
        <button data-acao="menos" data-indice="${indice}">−</button>
        <span>${item.quantidade}</span>
        <button data-acao="mais" data-indice="${indice}">+</button>
      </div>

      <div>
        <strong>${moeda(item.preco * item.quantidade)}</strong>
        <button class="remover-item"
          data-acao="remover"
          data-indice="${indice}">
          Remover
        </button>
      </div>
    </div>
  `).join("");
}

// ADICIONAR E ALTERAR PRODUTOS
document.addEventListener("click", evento => {
  const adicionar = evento.target.closest(".adicionar");

  if (adicionar) {
    const nome = adicionar.dataset.nome;
    const preco = Number(adicionar.dataset.preco);

    if (!nome || !Number.isFinite(preco) || preco < 0) return;

    const carrinho = obterCarrinho();
    const existente = carrinho.find(item => item.nome === nome);

    if (existente) {
      existente.quantidade++;
    } else {
      carrinho.push({
        nome,
        preco,
        quantidade: 1
      });
    }

    salvarCarrinho(carrinho);

    const textoOriginal = adicionar.textContent;
    adicionar.textContent = "✓ Adicionado";

    setTimeout(() => {
      adicionar.textContent = textoOriginal;
    }, 1000);

    return;
  }

  const acaoBotao = evento.target.closest("button[data-acao]");

  if (!acaoBotao) return;

  const indice = Number(acaoBotao.dataset.indice);
  const acao = acaoBotao.dataset.acao;
  const carrinho = obterCarrinho();
  const item = carrinho[indice];

  if (!item) return;

  if (acao === "mais") item.quantidade++;

  if (acao === "menos") {
    item.quantidade--;
    if (item.quantidade <= 0) carrinho.splice(indice, 1);
  }

  if (acao === "remover") {
    carrinho.splice(indice, 1);
  }

  salvarCarrinho(carrinho);
});

// FILTRO DE CATEGORIA E BUSCA
let categoriaSelecionada = "todos";

function filtrarProdutos() {
  const termo = normalizar(campoBusca.value);
  const produtos = grade.querySelectorAll(".item-cardapio");

  let encontrados = 0;

  produtos.forEach(produto => {
    const nome = normalizar(produto.dataset.nome || "");
    const categoria = normalizar(produto.dataset.categoria || "");
    const descricao = normalizar(produto.querySelector("p")?.textContent || "");
    const textoCompleto = normalizar(produto.textContent);

    const correspondeCategoria =
      categoriaSelecionada === "todos" ||
      categoria.split(" ").includes(categoriaSelecionada);

    const correspondeBusca =
      termo === "" ||
      nome.includes(termo) ||
      categoria.includes(termo) ||
      descricao.includes(termo) ||
      textoCompleto.includes(termo);

    const mostrar = correspondeCategoria && correspondeBusca;

    produto.hidden = !mostrar;

    if (mostrar) encontrados++;
  });

  if (encontrados === 0) {
    mensagem.textContent =
      "Nenhum produto encontrado. Tente outro nome ou categoria.";
  } else {
    mensagem.textContent = `${encontrados} produto(s) encontrado(s).`;
  }
}

// CATEGORIAS
botoesCategoria.forEach(botao => {
  botao.addEventListener("click", () => {
    botoesCategoria.forEach(item => item.classList.remove("ativo"));

    botao.classList.add("ativo");
    categoriaSelecionada = botao.dataset.categoria;

    filtrarProdutos();
  });
});

// BUSCA EM TEMPO REAL
campoBusca.addEventListener("input", filtrarProdutos);

formBusca.addEventListener("submit", evento => {
  evento.preventDefault();
  filtrarProdutos();
});

// ORDENAÇÃO
ordenar.addEventListener("change", () => {
  const produtos = [...grade.querySelectorAll(".item-cardapio")];

  produtos.sort((a, b) => {
    const precoA = Number(a.dataset.preco);
    const precoB = Number(b.dataset.preco);

    switch (ordenar.value) {
      case "menor":
        return precoA - precoB;

      case "maior":
        return precoB - precoA;

      case "nome":
        return a.dataset.nome.localeCompare(b.dataset.nome, "pt-BR");

      default:
        return Number(a.dataset.popularidade) -
          Number(b.dataset.popularidade);
    }
  });

  produtos.forEach(produto => grade.appendChild(produto));

  filtrarProdutos();
});

// MENU MOBILE
const botaoMenu = document.querySelector("#botao-menu");
const menu = document.querySelector("#menu");

botaoMenu?.addEventListener("click", () => {
  const aberto = menu.classList.toggle("aberto");
  botaoMenu.setAttribute("aria-expanded", String(aberto));
});

// FINALIZAR PEDIDO
document.querySelector("#finalizar-compra")
  ?.addEventListener("click", () => {
    const carrinho = obterCarrinho();

    if (carrinho.length === 0) {
      alert("Seu carrinho está vazio!");
      return;
    }

    window.location.href = "pedidos.html";
  });

// INICIAR
atualizarCarrinho();
filtrarProdutos();
