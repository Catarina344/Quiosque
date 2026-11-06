
const form = document.getElementById("form-perfil");

const campoNome = document.getElementById("nome");
const campoEmail = document.getElementById("email");
const campoTelefone = document.getElementById("telefone");
const campoSenha = document.getElementById("senha");
const campoConfirmarSenha = document.getElementById("confirmar-senha");

const mensagem = document.getElementById("mensagem");

let usuario = JSON.parse(localStorage.getItem("usuarioAShawarma")) || {};

function atualizarPerfil() {
    campoNome.value = usuario.nome || "";
    campoEmail.value = usuario.email || "";
    campoTelefone.value = usuario.telefone || "";

    document.getElementById("nome-exibido").textContent =
        usuario.nome || "Usuário";

    document.getElementById("email-exibido").textContent =
        usuario.email || "Cadastre seu e-mail";

    document.getElementById("letra-avatar").textContent =
        usuario.nome ? usuario.nome.charAt(0).toUpperCase() : "U";
}

atualizarPerfil();

// MÁSCARA DE TELEFONE

campoTelefone.addEventListener("input", function () {
    let numero = this.value.replace(/\D/g, "").slice(0, 11);

    if (numero.length > 10) {
        this.value = numero.replace(
            /(\d{2})(\d{5})(\d{4})/,
            "($1) $2-$3"
        );
    } else if (numero.length > 6) {
        this.value = numero.replace(
            /(\d{2})(\d{4})(\d+)/,
            "($1) $2-$3"
        );
    } else if (numero.length > 2) {
        this.value = numero.replace(
            /(\d{2})(\d+)/,
            "($1) $2"
        );
    } else {
        this.value = numero;
    }
});

// SALVAR ALTERAÇÕES

form.addEventListener("submit", function (event) {
    event.preventDefault();

    const nome = campoNome.value.trim();
    const email = campoEmail.value.trim();
    const telefone = campoTelefone.value.trim();

    const senha = campoSenha.value;
    const confirmarSenha = campoConfirmarSenha.value;

    if (nome.split(/\s+/).length < 2) {
        mensagem.style.color = "#e50920";
        mensagem.textContent = "Digite seu nome completo.";
        return;
    }

    if (!email.includes("@") || !email.includes(".")) {
        mensagem.style.color = "#e50920";
        mensagem.textContent = "Digite um e-mail válido.";
        return;
    }

    if (senha || confirmarSenha) {
        if (senha.length < 8) {
            mensagem.style.color = "#e50920";
            mensagem.textContent = "A nova senha precisa ter pelo menos 8 caracteres.";
            return;
        }

        if (senha !== confirmarSenha) {
            mensagem.style.color = "#e50920";
            mensagem.textContent = "As senhas não são iguais.";
            return;
        }
    }

    usuario.nome = nome;
    usuario.email = email;
    usuario.telefone = telefone;

    localStorage.setItem("usuarioAShawarma", JSON.stringify(usuario));

    campoSenha.value = "";
    campoConfirmarSenha.value = "";

    atualizarPerfil();

    mensagem.style.color = "#168447";
    mensagem.textContent = "Seus dados foram atualizados com sucesso!";
});

// CANCELAR ALTERAÇÕES

form.addEventListener("reset", function () {
    setTimeout(() => {
        atualizarPerfil();
        mensagem.textContent = "";
    }, 0);
});

// SAIR DA CONTA

document.getElementById("botao-sair").addEventListener("click", function () {
    const confirmar = confirm("Deseja realmente sair da sua conta?");

    if (confirmar) {
        window.location.href = "index.html";
    }
});
