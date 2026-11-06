
const formulario = document.querySelector("#form-cadastro");
const campoNome = document.querySelector("#nome");
const campoEmail = document.querySelector("#email");
const campoTelefone = document.querySelector("#telefone");
const campoSenha = document.querySelector("#senha");
const confirmarSenha = document.querySelector("#confirmar-senha");
const mensagem = document.querySelector("#mensagem-cadastro");

// MOSTRAR E ESCONDER SENHA
document.querySelectorAll(".mostrar-senha").forEach(botao => {
  botao.addEventListener("click", () => {
    const campo = document.getElementById(botao.dataset.alvo);

    if (campo.type === "password") {
      campo.type = "text";
      botao.textContent = "Ocultar";
    } else {
      campo.type = "password";
      botao.textContent = "Mostrar";
    }
  });
});

// MÁSCARA DE TELEFONE
campoTelefone.addEventListener("input", () => {
  let numero = campoTelefone.value.replace(/\D/g, "").slice(0, 11);

  if (numero.length > 10) {
    numero = numero.replace(
      /^(\d{2})(\d{5})(\d{4})$/,
      "($1) $2-$3"
    );
  } else if (numero.length > 6) {
    numero = numero.replace(
      /^(\d{2})(\d{4})(\d{0,4})$/,
      "($1) $2-$3"
    );
  } else if (numero.length > 2) {
    numero = numero.replace(/^(\d{2})(\d+)/, "($1) $2");
  }

  campoTelefone.value = numero;
});

// MENSAGEM DE ERRO
function mostrarMensagem(texto, sucesso = false) {
  mensagem.textContent = texto;
  mensagem.classList.toggle("sucesso", sucesso);
}

// CADASTRO
formulario.addEventListener("submit", evento => {
  evento.preventDefault();

  const nome = campoNome.value.trim();
  const email = campoEmail.value.trim().toLowerCase();
  const telefone = campoTelefone.value.trim();
  const senha = campoSenha.value;
  const confirmacao = confirmarSenha.value;

  const numeroTelefone = telefone.replace(/\D/g, "");

  if (nome.split(/\s+/).length < 2) {
    mostrarMensagem("Digite seu nome e sobrenome.");
    campoNome.focus();
    return;
  }

  if (!email.includes("@") || !email.includes(".")) {
    mostrarMensagem("Digite um e-mail válido.");
    campoEmail.focus();
    return;
  }

  if (numeroTelefone.length < 10) {
    mostrarMensagem("Digite um telefone válido.");
    campoTelefone.focus();
    return;
  }

  if (senha.length < 8) {
    mostrarMensagem("A senha precisa ter pelo menos 8 caracteres.");
    campoSenha.focus();
    return;
  }

  if (senha !== confirmacao) {
    mostrarMensagem("As senhas não são iguais.");
    confirmarSenha.focus();
    return;
  }

  if (!document.querySelector("#aceitar-termos").checked) {
    mostrarMensagem("Você precisa aceitar os termos de uso.");
    return;
  }

  // Salva somente os dados básicos do perfil.
  // Não armazena a senha no navegador.
  const usuario = {
    nome: nome,
    email: email,
    telefone: telefone
  };

  try {
    localStorage.setItem("usuarioAShawarma", JSON.stringify(usuario));
  } catch {
    mostrarMensagem("Não foi possível salvar os dados neste navegador.");
    return;
  }

  mostrarMensagem(
    "Cadastro realizado nesta demonstração! Bem-vindo ao A Shawarma.",
    true
  );

  formulario.reset();
});
