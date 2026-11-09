# Contabilidade Ágil

Sistema simples de controle financeiro. Cada usuário cria uma conta, entra no sistema e registra suas receitas e despesas, acompanhando o saldo em tempo real.

## Tecnologias

- **Front-end:** HTML, CSS e JavaScript puro
- **Back-end:** Node.js + Express
- **Banco de dados:** SQLite (via `better-sqlite3`)
- **Autenticação:** JWT (`jsonwebtoken`) e senhas criptografadas com `bcrypt`

## Telas

1. **Login / Cadastro** (`public/index.html`): criar conta e entrar no sistema.
2. **Painel** (`public/dashboard.html`): totais de receitas, despesas e saldo, além de cadastro, edição e exclusão de lançamentos.

## Requisitos

- [Node.js](https://nodejs.org) versão **22 ou superior**

Para conferir a versão instalada:

```
node -v
```

## Como rodar

Abra o terminal **dentro da pasta do projeto** e execute:

```
npm install
npm start
```

Quando aparecer `API rodando em http://localhost:3000`, abra no navegador:

```
http://localhost:3000
```

O arquivo do banco (`database.db`) é criado automaticamente na primeira execução. Para parar o servidor, use `Ctrl + C` no terminal.

## Como usar

1. Na tela inicial, clique em **Criar conta** e preencha nome, e-mail e senha.
2. Entre com o e-mail e a senha cadastrados.
3. No painel, preencha o formulário e clique em **Adicionar** para registrar uma receita ou despesa.
4. Use **Editar** e **Excluir** na tabela para alterar ou remover lançamentos.

## Estrutura do projeto

```
contabilidade-agil/
├── package.json
├── database.db              (criado automaticamente)
├── public/                  (front-end)
│   ├── index.html           Tela de login/cadastro
│   ├── dashboard.html       Tela do painel
│   ├── css/style.css
│   └── js/
│       ├── login.js
│       └── dashboard.js
└── src/                     (back-end)
    ├── server.js
    ├── db.js                Conexão e criação das tabelas
    ├── middleware/auth.js   Validação do token JWT
    └── routes/
        ├── auth.js          Cadastro e login
        └── lancamentos.js   CRUD de lançamentos
```

## Banco de dados

**users**

| Campo    | Tipo    | Observação              |
|----------|---------|-------------------------|
| id       | INTEGER | chave primária, automático |
| name     | TEXT    | obrigatório             |
| email    | TEXT    | obrigatório e único     |
| password | TEXT    | senha com hash (bcrypt) |

**lancamentos**

| Campo     | Tipo    | Observação                          |
|-----------|---------|-------------------------------------|
| id        | INTEGER | chave primária, automático          |
| user_id   | INTEGER | chave estrangeira para `users`      |
| descricao | TEXT    | obrigatório                         |
| valor     | REAL    | obrigatório, maior que zero         |
| tipo      | TEXT    | `receita` ou `despesa`              |
| categoria | TEXT    | opcional                            |
| data      | TEXT    | formato `AAAA-MM-DD`                |

## Rotas da API

### Autenticação

| Método | Rota             | Descrição                         | Protegida |
|--------|------------------|-----------------------------------|-----------|
| POST   | `/auth/register` | Cria um usuário                   | Não       |
| POST   | `/auth/login`    | Retorna o token JWT e o nome      | Não       |
| GET    | `/auth/me`       | Retorna os dados do usuário logado | Sim      |

### Lançamentos

Todas as rotas exigem o cabeçalho `Authorization: Bearer <token>`. Cada usuário enxerga apenas os próprios lançamentos.

| Método | Rota                    | Descrição                          |
|--------|-------------------------|------------------------------------|
| GET    | `/lancamentos`          | Lista os lançamentos do usuário    |
| GET    | `/lancamentos/resumo`   | Total de receitas, despesas e saldo |
| POST   | `/lancamentos`          | Cria um lançamento                 |
| PUT    | `/lancamentos/:id`      | Atualiza um lançamento             |
| DELETE | `/lancamentos/:id`      | Remove um lançamento               |

Exemplo de corpo para `POST /lancamentos`:

```json
{
  "descricao": "Venda de serviço",
  "valor": 1500.50,
  "tipo": "receita",
  "categoria": "Vendas",
  "data": "2026-11-05"
}
```

## Observações

- A chave do JWT pode ser definida pela variável de ambiente `JWT_SECRET`. Sem ela, é usado um valor padrão, adequado apenas para desenvolvimento.
- O token expira em 1 hora; depois disso o sistema volta para a tela de login.
