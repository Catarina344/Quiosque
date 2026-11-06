
const listaCarrinho = document.getElementById("lista-carrinho");
const carrinhoVazio = document.getElementById("carrinho-vazio");

const subtotalElemento = document.getElementById("subtotal");
const entregaElemento = document.getElementById("entrega");
const totalElemento = document.getElementById("total");
const quantidadeElemento = document.getElementById("quantidade-itens");

const botaoFinalizar = document.getElementById("finalizar-compra");

const TAXA_ENTREGA = 5.00;

function obterCarrinho() {
    return JSON.parse(localStorage.getItem("aShawarmaCart")) || [];
}

function salvarCarrinho(carrinho) {
    localStorage.setItem("aShawarmaCart", JSON.stringify(carrinho));
}

function formatarPreco(valor) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function renderizarCarrinho() {
    const carrinho = obterCarrinho();

    listaCarrinho.innerHTML = "";

    const quantidadeTotal = carrinho.reduce(
        (soma, produto) => soma + Number(produto.quantidade || 0),
        0
    );

    quantidadeElemento.textContent =
        `${quantidadeTotal} ${quantidadeTotal === 1 ? "item" : "itens"}`;

    if (carrinho.length === 0) {
        carrinhoVazio.style.display = "block";
        botaoFinalizar.disabled = true;
    } else {
        carrinhoVazio.style.display = "none";
        botaoFinalizar.disabled = false;
    }

    let subtotal = 0;

    carrinho.forEach((produto, indice) => {
        const preco = Number(produto.preco) || 0;
        const quantidade = Number(produto.quantidade) || 1;

        subtotal += preco * quantidade;

        const item = document.createElement("article");
        item.className = "item-carrinho";

        const imagem = document.createElement("img");
        imagem.src = produto.imagem || "img/logo-vingadores.png";
        imagem.alt = produto.nome || "Produto";
        imagem.onerror = function () {
            this.onerror = null;
            this.src = "img/logo-vingadores.png";
        };

        const informacoes = document.createElement("div");
        informacoes.className = "info-produto";

        const nome = document.createElement("h3");
        nome.textContent = produto.nome || "Produto";

        const descricao = document.createElement("p");
        descricao.textContent = "A Shawarma";

        const precoElemento = document.createElement("div");
        precoElemento.className = "preco-produto";
        precoElemento.textContent = formatarPreco(preco * quantidade);

        informacoes.append(nome, descricao, precoElemento);

        const acoes = document.createElement("div");
        acoes.className = "acoes-produto";

        const controle = document.createElement("div");
        controle.className = "controle-quantidade";

        const diminuir = document.createElement("button");
        diminuir.type = "button";
        diminuir.textContent = "−";
        diminuir.setAttribute("aria-label", "Diminuir quantidade");
        diminuir.addEventListener("click", () => alterarQuantidade(indice, -1));

        const numero = document.createElement("span");
        numero.textContent = quantidade;

        const aumentar = document.createElement("button");
        aumentar.type = "button";
        aumentar.textContent = "+";
        aumentar.setAttribute("aria-label", "Aumentar quantidade");
        aumentar.addEventListener("click", () => alterarQuantidade(indice, 1));

        controle.append(diminuir, numero, aumentar);

        const remover = document.createElement("button");
        remover.type = "button";
        remover.className = "remover";
        remover.textContent = "Remover";
        remover.addEventListener("click", () => removerProduto(indice));

        acoes.append(controle, remover);
        item.append(imagem, informacoes, acoes);

        listaCarrinho.appendChild(item);
    });

    const taxa = carrinho.length > 0 ? TAXA_ENTREGA : 0;
    const total = subtotal + taxa;

    subtotalElemento.textContent = formatarPreco(subtotal);
    entregaElemento.textContent = formatarPreco(taxa);
    totalElemento.textContent = formatarPreco(total);
}

function alterarQuantidade(indice, alteracao) {
    const carrinho = obterCarrinho();

    if (!carrinho[indice]) return;

    carrinho[indice].quantidade =
        Number(carrinho[indice].quantidade || 1) + alteracao;

    if (carrinho[indice].quantidade <= 0) {
        carrinho.splice(indice, 1);
    }

    salvarCarrinho(carrinho);
    renderizarCarrinho();
}

function removerProduto(indice) {
    const carrinho = obterCarrinho();

    carrinho.splice(indice, 1);

    salvarCarrinho(carrinho);
    renderizarCarrinho();
}

// FINALIZAR COMPRA

botaoFinalizar.addEventListener("click", function () {
    const carrinho = obterCarrinho();

    if (carrinho.length === 0) {
        alert("Seu carrinho está vazio!");
        return;
    }

    const usuario = JSON.parse(
        localStorage.getItem("usuarioAShawarma")
    );

    if (!usuario) {
        alert("Faça seu cadastro antes de finalizar a compra.");
        window.location.href = "cadastro.html";
        return;
    }

    const subtotal = carrinho.reduce(
        (soma, produto) =>
            soma + (Number(produto.preco) * Number(produto.quantidade)),
        0
    );

    const total = subtotal + TAXA_ENTREGA;

    const pedidos = JSON.parse(
        localStorage.getItem("pedidosAShawarma")
    ) || [];

    const novoPedido = {
        id: Date.now(),
        data: new Date().toISOString(),
        status: "preparando",
        produtos: carrinho,
        subtotal: subtotal,
        entrega: TAXA_ENTREGA,
        total: total
    };

    pedidos.push(novoPedido);

    localStorage.setItem(
        "pedidosAShawarma",
        JSON.stringify(pedidos)
    );

    localStorage.removeItem("aShawarmaCart");

    alert("Pedido realizado com sucesso!");

    window.location.href = "pedidos.html";
});

renderizarCarrinho();
