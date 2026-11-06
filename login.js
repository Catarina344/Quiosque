
const formLogin = document.getElementById("form-login");
const campoEmail = document.getElementById("email");
const campoSenha = document.getElementById("senha");
const mensagem = document.getElementById("mensagem");

const botaoMostrar = document.getElementById("mostrar-senha");

// MOSTRAR OU ESCONDER SENHA

botaoMostrar.addEventListener("click", function () {
    if (campoSenha.type === "password") {
        campoSenha.type = "text";
        botaoMostrar.textContent = "Ocultar";
    } else {
        campoSenha.type = "password";
        botaoMostrar.textContent = "Mostrar";
    }
});

// REALIZAR LOGIN

formLogin.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = campoEmail.value.trim();
    const senha = campoSenha.value;

    const usuario = JSON.parse(
        localStorage.getItem("usuarioAShawarma")
    );

    if (!usuario) {
        mensagem.style.color = "#e50920";
        mensagem.textContent = "Nenhuma conta encontrada. Faça seu cadastro primeiro.";
        return;
    }

    if (email !== usuario.email) {
        mensagem.style.color = "#e50920";
        mensagem.textContent = "E-mail não encontrado.";
        return;
    }

    // Esta demonstração não possui autenticação real.
    // O cadastro anterior não armazena a senha.

    mensagem.style.color = "#e50920";
    mensagem.textContent = "O cadastro atual não armazena senhas. Para testar o acesso, será necessário integrar uma autenticação.";
});

// RECUPERAR SENHA

document.getElementById("recuperar-senha").addEventListener("click", function (event) {
    event.preventDefault();

    alert("A recuperação de senha estará disponível quando o sistema de autenticação for implementado.");
});
