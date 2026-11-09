const express = require("express");
const db = require("../db");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

// Todas as rotas daqui exigem token
router.use(authMiddleware);

function validar(body) {
  const { descricao, valor, tipo, data } = body;
  if (!descricao || !String(descricao).trim()) return "Informe a descrição";
  const v = Number(valor);
  if (!Number.isFinite(v) || v <= 0) return "Informe um valor maior que zero";
  if (!["receita", "despesa"].includes(tipo)) return "Tipo inválido";
  if (!data || !/^\d{4}-\d{2}-\d{2}$/.test(data)) return "Informe uma data válida";
  return null;
}

// GET /lancamentos  -> lista do usuário logado (mais recentes primeiro)
router.get("/", (req, res) => {
  const itens = db
    .prepare(
      "SELECT id, descricao, valor, tipo, categoria, data FROM lancamentos WHERE user_id = ? ORDER BY data DESC, id DESC",
    )
    .all(req.user.id);
  res.json(itens);
});

// GET /lancamentos/resumo -> totais
router.get("/resumo", (req, res) => {
  const row = db
    .prepare(
      `SELECT
         COALESCE(SUM(CASE WHEN tipo = 'receita' THEN valor END), 0) AS receitas,
         COALESCE(SUM(CASE WHEN tipo = 'despesa' THEN valor END), 0) AS despesas
       FROM lancamentos WHERE user_id = ?`,
    )
    .get(req.user.id);
  res.json({
    receitas: row.receitas,
    despesas: row.despesas,
    saldo: row.receitas - row.despesas,
  });
});

// POST /lancamentos
router.post("/", (req, res) => {
  const erro = validar(req.body);
  if (erro) return res.status(400).json({ error: erro });

  const { descricao, valor, tipo, categoria, data } = req.body;
  const info = db
    .prepare(
      "INSERT INTO lancamentos (user_id, descricao, valor, tipo, categoria, data) VALUES (?, ?, ?, ?, ?, ?)",
    )
    .run(req.user.id, descricao.trim(), Number(valor), tipo, categoria?.trim() || null, data);

  res.status(201).json({ id: info.lastInsertRowid });
});

// PUT /lancamentos/:id
router.put("/:id", (req, res) => {
  const erro = validar(req.body);
  if (erro) return res.status(400).json({ error: erro });

  const { descricao, valor, tipo, categoria, data } = req.body;
  const info = db
    .prepare(
      "UPDATE lancamentos SET descricao = ?, valor = ?, tipo = ?, categoria = ?, data = ? WHERE id = ? AND user_id = ?",
    )
    .run(descricao.trim(), Number(valor), tipo, categoria?.trim() || null, data, req.params.id, req.user.id);

  if (info.changes === 0) {
    return res.status(404).json({ error: "Lançamento não encontrado" });
  }
  res.json({ message: "Lançamento atualizado" });
});

// DELETE /lancamentos/:id
router.delete("/:id", (req, res) => {
  const info = db
    .prepare("DELETE FROM lancamentos WHERE id = ? AND user_id = ?")
    .run(req.params.id, req.user.id);

  if (info.changes === 0) {
    return res.status(404).json({ error: "Lançamento não encontrado" });
  }
  res.json({ message: "Lançamento removido" });
});

module.exports = router;
