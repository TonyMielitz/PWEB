const API = ""; // mesma origem (o Express serve o front)

const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "index.html";
}

const form = document.getElementById("form-lancamento");
const lista = document.getElementById("lista");
const msg = document.getElementById("msg");
const btnSalvar = document.getElementById("btn-salvar");
const btnCancelar = document.getElementById("btn-cancelar");
const formTitulo = document.getElementById("form-titulo");

let editandoId = null;
let lancamentos = [];

document.getElementById("user-name").textContent =
  "Olá, " + (localStorage.getItem("name") || "usuário");

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function formatarData(iso) {
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
}

function hojeISO() {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

function mostrarMensagem(texto, tipo) {
  msg.textContent = texto;
  msg.className = "msg " + (tipo || "");
}

function sair() {
  localStorage.removeItem("token");
  localStorage.removeItem("name");
  window.location.href = "index.html";
}

// Fetch que já manda o token e trata sessão expirada
async function api(caminho, opcoes = {}) {
  const res = await fetch(API + caminho, {
    ...opcoes,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
      ...(opcoes.headers || {}),
    },
  });

  if (res.status === 401) {
    sair();
    throw new Error("Sessão expirada");
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erro na requisição");
  return data;
}

async function carregarResumo() {
  const r = await api("/lancamentos/resumo");
  document.getElementById("total-receitas").textContent = brl.format(r.receitas);
  document.getElementById("total-despesas").textContent = brl.format(r.despesas);

  const saldo = document.getElementById("total-saldo");
  saldo.textContent = brl.format(r.saldo);
  saldo.className = "value " + (r.saldo >= 0 ? "receita" : "despesa");
}

function criarCelula(texto, classe) {
  const td = document.createElement("td");
  td.textContent = texto;
  if (classe) td.className = classe;
  return td;
}

function renderizarLista() {
  lista.innerHTML = "";

  if (lancamentos.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 6;
    td.className = "empty";
    td.textContent = "Nenhum lançamento ainda. Adicione o primeiro acima.";
    tr.appendChild(td);
    lista.appendChild(tr);
    return;
  }

  for (const l of lancamentos) {
    const tr = document.createElement("tr");
    const sinal = l.tipo === "receita" ? "+ " : "- ";

    tr.appendChild(criarCelula(formatarData(l.data)));
    tr.appendChild(criarCelula(l.descricao));
    tr.appendChild(criarCelula(l.categoria || "—"));
    tr.appendChild(criarCelula(l.tipo === "receita" ? "Receita" : "Despesa", l.tipo));
    tr.appendChild(criarCelula(sinal + brl.format(l.valor), "num " + l.tipo));

    const acoes = document.createElement("td");
    acoes.className = "acoes";

    const btnEditar = document.createElement("button");
    btnEditar.type = "button";
    btnEditar.className = "link";
    btnEditar.textContent = "Editar";
    btnEditar.addEventListener("click", () => iniciarEdicao(l));

    const btnExcluir = document.createElement("button");
    btnExcluir.type = "button";
    btnExcluir.className = "danger";
    btnExcluir.textContent = "Excluir";
    btnExcluir.addEventListener("click", () => excluir(l.id));

    acoes.append(btnEditar, btnExcluir);
    tr.appendChild(acoes);
    lista.appendChild(tr);
  }
}

async function carregarTudo() {
  try {
    lancamentos = await api("/lancamentos");
    renderizarLista();
    await carregarResumo();
  } catch (err) {
    mostrarMensagem(err.message, "error");
  }
}

function limparFormulario() {
  editandoId = null;
  form.reset();
  document.getElementById("data").value = hojeISO();
  formTitulo.textContent = "Novo lançamento";
  btnSalvar.textContent = "Adicionar";
  btnCancelar.classList.add("hidden");
}

function iniciarEdicao(l) {
  editandoId = l.id;
  document.getElementById("descricao").value = l.descricao;
  document.getElementById("valor").value = l.valor;
  document.getElementById("tipo").value = l.tipo;
  document.getElementById("categoria").value = l.categoria || "";
  document.getElementById("data").value = l.data;
  formTitulo.textContent = "Editar lançamento";
  btnSalvar.textContent = "Salvar alterações";
  btnCancelar.classList.remove("hidden");
  mostrarMensagem("");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function excluir(id) {
  if (!confirm("Excluir este lançamento?")) return;
  try {
    await api("/lancamentos/" + id, { method: "DELETE" });
    if (editandoId === id) limparFormulario();
    await carregarTudo();
  } catch (err) {
    mostrarMensagem(err.message, "error");
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  mostrarMensagem("");

  const corpo = {
    descricao: document.getElementById("descricao").value,
    valor: document.getElementById("valor").value,
    tipo: document.getElementById("tipo").value,
    categoria: document.getElementById("categoria").value,
    data: document.getElementById("data").value,
  };

  try {
    if (editandoId) {
      await api("/lancamentos/" + editandoId, {
        method: "PUT",
        body: JSON.stringify(corpo),
      });
      mostrarMensagem("Lançamento atualizado!", "ok");
    } else {
      await api("/lancamentos", {
        method: "POST",
        body: JSON.stringify(corpo),
      });
      mostrarMensagem("Lançamento adicionado!", "ok");
    }
    limparFormulario();
    await carregarTudo();
  } catch (err) {
    mostrarMensagem(err.message, "error");
  }
});

btnCancelar.addEventListener("click", () => {
  limparFormulario();
  mostrarMensagem("");
});

document.getElementById("btn-logout").addEventListener("click", sair);

limparFormulario();
carregarTudo();
