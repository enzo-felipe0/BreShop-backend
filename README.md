# 🗄️ BreShop Backend API

API REST do BreShop - E-commerce para Brechós Online. Backend desenvolvido com Node.js, Express, TypeScript e SQLite.

## 📋 Índice

- [Sobre](#sobre)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Como Executar](#como-executar)
- [Endpoints da API](#endpoints-da-api)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Estrutura do Projeto](#estrutura-do-projeto)

## 🎯 Sobre

O BreShop Backend é a API que gerencia toda a lógica de autenticação, usuários e autorização para a plataforma BreShop. Ele fornece endpoints seguros com JWT para registrar, autenticar e gerenciar usuários (compradores e vendedores).

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **Express** - Framework web minimalista
- **TypeScript** - Superset JavaScript com tipagem estática
- **Prisma** - ORM para banco de dados
- **SQLite** - Banco de dados relacional
- **JWT (jsonwebtoken)** - Autenticação segura
- **Bcrypt** - Criptografia de senhas
- **CORS** - Compartilhamento de recursos entre origens

## 📦 Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn
- Git

## 🔧 Instalação

### 1. Clonar o Repositório

```
git clone https://github.com/seu-usuario/breshop-backend.git
cd breshop-backend
```

### 2. Instalar Dependências

```
npm install
```

## ⚙️ Configuração

### 1. Criar Arquivo .env

Crie um arquivo `.env` na raiz do projeto:

```
# Database
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET="seu-secret-super-secreto-aqui-mude-em-producao"
JWT_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV=development

# Frontend
FRONTEND_URL="http://localhost:5173"
```

### 2. Configurar Banco de Dados

Gere o Prisma Client:

```
dotenv -e .env -- npx prisma generate
```

Crie as migrations:

```
dotenv -e .env -- npx prisma migrate dev --name init
```

Isso criará o arquivo `prisma/dev.db` com as tabelas necessárias.

## ▶️ Como Executar

### Modo Desenvolvimento

```
npm run dev
```

O servidor iniciará em: [**http://localhost:3000**](http://localhost:3000)

Você verá:

🚀 Server is running on http://localhost:3000
📚 API Docs available at http://localhost:3000/
🗄️ Database: SQLite (prisma/dev.db)

### Build para Produção

```
npm run build
```

### Iniciar em Produção

```
npm start
```

### Visualizar Banco de Dados

```
npm run db:studio
```

Abrirá interface web em: [**http://localhost:5555**](http://localhost:5555)

## 📡 Endpoints da API

### Health Check

**GET** `/api/health`

Verifica se a API está funcionando.

**Response (200 OK):**

```
{
"status": "OK",
"timestamp": "2025-11-01T21:35:00.000Z"
}
```

### Registrar Usuário

**POST** `/api/auth/register`

Cria uma nova conta de usuário.

**Headers:**
Content-Type: application/json

**Body:**

```
{
"nome": "João Silva",
"email": "joao@example.com",
"senha": "senha123",
"tipoUsuario": "COMPRADOR"
}
```
**Response (201 Created):**
```
{
"user": {
"id": "uuid-gerado",
"nome": "João Silva",
"email": "joao@example.com",
"tipoUsuario": "COMPRADOR"
},
"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Tipos de Usuário:**
- `COMPRADOR` - Usuário que compra produtos
- `VENDEDOR` - Usuário que vende produtos

**Validações:**
- Nome é obrigatório
- Email é obrigatório e deve ser único
- Senha deve ter no mínimo 6 caracteres
- tipoUsuario deve ser COMPRADOR ou VENDEDOR

### Login

**POST** `/api/auth/login`

Autentica um usuário existente.

**Headers:**

Content-Type: application/json

**Body:**

```
{
"email": "joao@example.com",
"senha": "senha123"
}
```

**Response (200 OK):**
```
{
"user": {
"id": "uuid-do-usuario",
"nome": "João Silva",
"email": "joao@example.com",
"tipoUsuario": "COMPRADOR"
},
"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Obter Dados do Usuário

**GET** `/api/auth/me`

Retorna os dados do usuário autenticado. Requer autenticação.

**Headers:**
Authorization: Bearer seu-token-aqui
**Response (200 OK):**
```
{
"user": {
"id": "uuid-do-usuario",
"nome": "João Silva",
"email": "joao@example.com",
"tipoUsuario": "COMPRADOR",
"createdAt": "2025-11-01T20:30:00.000Z",
"updatedAt": "2025-11-01T20:30:00.000Z"}
}
```

## 🔐 Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| DATABASE_URL | URL do banco de dados SQLite | `file:./dev.db` |
| JWT_SECRET | Chave secreta para assinar tokens JWT | Deve ser definida |
| JWT_EXPIRES_IN | Tempo de expiração do token | `7d` |
| PORT | Porta do servidor | `3333` |
| NODE_ENV | Ambiente (development/production) | `development` |
| FRONTEND_URL | URL do frontend (para CORS) | `http://localhost:5173` |

## 📁 Estrutura do Projeto

```
breshop-backend/
├── prisma/
│ ├── dev.db # Banco de dados SQLite
│ ├── migrations/ # Histórico de migrações
│ └── schema.prisma # Schema do banco de dados
├── src/
│ ├── config/
│ │ └── database.ts # Configuração Prisma Client
│ ├── controllers/
│ │ └── authController.ts
│ ├── services/
│ │ └── authService.ts
│ ├── routes/
│ │ ├── index.ts
│ │ └── authRoutes.ts
│ ├── middlewares/
│ │ └── authMiddleware.ts
│ ├── types/
│ ├── utils/
│ │ ├── jwt.ts
│ │ └── password.ts
│ ├── app.ts
│ └── server.ts
├── .env
├── .gitignore
├── nodemon.json
├── package.json
├── tsconfig.json
└── README.md
```
## 🏗️ Arquitetura em Camadas

O projeto segue uma arquitetura em camadas:

- **Routes** - Define os endpoints da API
- **Controllers** - Valida requisições e coordena respostas
- **Services** - Contém a lógica de negócio
- **Middlewares** - Processa requisições (autenticação, validação)
- **Utils** - Funções auxiliares (JWT, hash de senhas)
- **Config** - Configurações (banco de dados)

## 📝 Notas Importantes

- **Senhas:** Sempre hasheadas com bcrypt antes de salvar
- **Tokens:** Válidos por 7 dias (configurável)
- **CORS:** Aceita requisições do frontend configurado em FRONTEND_URL
- **Banco de Dados:** SQLite facilita deploy.

## 👨‍💻 Autor

Enzo Felipe Prudencio Avelino Lima
Matrícula: 20240065606

