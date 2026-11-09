const API = ""; // mesma origem (o Express serve o front)

const tabLogin = document.getElementById("tab-login");
const tabRegister = document.getElementById("tab-register");
const formLogin = document.getElementById("form-login");
const formRegister = document.getElementById("form-register");
const msg = document.getElementById("msg");

// Se já estiver logado, vai direto para o painel
if (localStorage.getItem("token")) {
  window.location.href = "dashboard.html";
}

function mostrarMensagem(texto, tipo) {
  msg.textContent = texto;
  msg.className = "msg " + (tipo || "");
}

function alternarAba(aba) {
  const login = aba === "login";
  formLogin.classList.toggle("hidden", !login);
  formRegister.classList.toggle("hidden", login);
  tabLogin.classList.toggle("active", login);
  tabRegister.classList.toggle("active", !login);
  mostrarMensagem("");
}

tabLogin.addEventListener("click", () => alternarAba("login"));
tabRegister.addEventListener("click", () => alternarAba("register"));

formLogin.addEventListener("submit", async (e) => {
  e.preventDefault();
  mostrarMensagem("");

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: document.getElementById("login-email").value,
        password: document.getElementById("login-password").value,
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      mostrarMensagem(data.error || "Erro ao entrar", "error");
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("name", data.name);
    window.location.href = "dashboard.html";
  } catch {
    mostrarMensagem("Não foi possível conectar ao servidor", "error");
  }
});

formRegister.addEventListener("submit", async (e) => {
  e.preventDefault();
  mostrarMensagem("");

  try {
    const res = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: document.getElementById("reg-name").value,
        email: document.getElementById("reg-email").value,
        password: document.getElementById("reg-password").value,
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      mostrarMensagem(data.error || "Erro ao cadastrar", "error");
      return;
    }

    // Conta criada: volta para o login com o e-mail preenchido
    document.getElementById("login-email").value =
      document.getElementById("reg-email").value;
    formRegister.reset();
    alternarAba("login");
    mostrarMensagem("Conta criada! Agora é só entrar.", "ok");
  } catch {
    mostrarMensagem("Não foi possível conectar ao servidor", "error");
  }
});
