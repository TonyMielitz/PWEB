const express = require("express");
const path = require("path");
const authRoutes = require("./routes/auth");
const lancamentosRoutes = require("./routes/lancamentos");

const app = express();
app.use(express.json());

// Front-end (HTML/CSS/JS) servido pela própria API
app.use(express.static(path.join(__dirname, "..", "public")));

app.use("/auth", authRoutes);
app.use("/lancamentos", lancamentosRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API rodando na porta ${PORT}`));
