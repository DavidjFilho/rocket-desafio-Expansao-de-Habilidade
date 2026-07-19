# Financy

Gerenciador de finanças pessoais — API GraphQL + React.

## Stack

- **Backend:** TypeScript, Express, Apollo Server, Prisma, SQLite, JWT
- **Frontend:** TypeScript, React, Vite, Tailwind CSS, Apollo Client, React Hook Form, Zod

## Pré-requisitos

- Node.js 20+
- npm

## Setup local

### 1. Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npm run dev
```

API: http://localhost:3333/graphql

### 2. Frontend

Em outro terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

App: http://localhost:5173

## Variáveis de ambiente

### Backend (`.env`)

| Variável | Descrição |
|----------|-----------|
| `JWT_SECRET` | Segredo para assinar tokens JWT |
| `DATABASE_URL` | URL do SQLite (`file:./dev.db`) |
| `FRONTEND_URL` | Origem permitida no CORS |
| `PORT` | Porta da API (padrão `3333`) |

### Frontend (`.env`)

| Variável | Descrição |
|----------|-----------|
| `VITE_BACKEND_URL` | Endpoint GraphQL (`http://localhost:3333/graphql`) |

## Funcionalidades

- Cadastro e login com JWT
- Isolamento de dados por usuário
- CRUD de categorias e transações
- Dashboard com saldo, receitas/despesas do mês e resumos
- Perfil com edição de nome e logout

## Estrutura

```
/
├── backend/
└── frontend/
```
