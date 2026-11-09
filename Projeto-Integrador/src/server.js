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

app.listen(3000, () => console.log("API rodando em http://localhost:3000"));
