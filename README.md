# EloAR Backend - Sistema de Enturmação Inteligente

Backend API Node.js + TypeScript + Express para o Sistema de Enturmação Inteligente.

## 🚀 Tecnologias

- Node.js 18+
- TypeScript
- Express.js
- PostgreSQL
- Docker & Docker Compose

## 📁 Estrutura do Projeto

```
EloAr-Back/
├── src/
│   ├── config/          # Configurações (database, environment)
│   ├── controllers/     # Controllers da API
│   ├── services/        # Lógica de negócio
│   ├── models/          # Modelos de dados
│   ├── repositories/    # Acesso ao banco de dados
│   ├── routes/          # Definição de rotas
│   ├── middleware/      # Middlewares Express
│   ├── validators/      # Validação de dados
│   ├── types/           # Tipos TypeScript
│   ├── utils/           # Utilitários
│   ├── migrations/      # Migrações do banco
│   └── server.ts        # Ponto de entrada
├── python-service/      # Serviço de otimização Python
└── docker-compose.yml   # Docker services
```

## 🔧 Configuração Inicial

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` e configure:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=eloar
DB_USER=eloar_user
DB_PASSWORD=sua_senha_aqui

JWT_SECRET=seu_secret_jwt_aqui
JWT_EXPIRES_IN=8h

PYTHON_SERVICE_URL=http://localhost:8000
CORS_ORIGIN=http://localhost:5173
```

### 3. Iniciar PostgreSQL com Docker

```bash
docker-compose up -d postgres
```

Ou para iniciar todos os serviços (PostgreSQL + Python):

```bash
docker-compose up -d
```

### 4. Executar Migrações

```bash
npm run migrate:up
```

## 🏃 Executando o Projeto

### Modo Desenvolvimento (com hot reload)

```bash
npm run dev
```

O servidor estará disponível em: `http://localhost:3000`

### Modo Produção

```bash
# Compilar TypeScript
npm run build

# Executar
npm start
```

## 📡 Endpoints Disponíveis

### Health Check

```
GET /health
```

Retorna o status do servidor e conexão com o banco de dados.

### API v1

```
GET /api/v1
```

Lista todos os endpoints disponíveis.

## 🐳 Docker

### Serviços Disponíveis

- **postgres**: Banco de dados PostgreSQL (porta 5432)
- **python-service**: Serviço de otimização Python/FastAPI (porta 8000)
- **pgadmin**: Interface web para gerenciar PostgreSQL (porta 5050) - Opcional

### Comandos Docker Úteis

```bash
# Iniciar todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar todos os serviços
docker-compose down

# Parar e remover volumes (CUIDADO: apaga dados)
docker-compose down -v

# Recriar serviços
docker-compose up -d --build
```

### Acessar pgAdmin (Opcional)

Para iniciar o pgAdmin:

```bash
docker-compose --profile tools up -d pgadmin
```

Acesse: `http://localhost:5050`
- Email: `admin@eloar.com`
- Senha: `admin`

## 🧪 Testes

```bash
# Executar testes
npm test

# Executar testes com coverage
npm run test:coverage
```

## 🎨 Formatação e Linting

```bash
# Lint
npm run lint

# Lint e corrigir
npm run lint:fix

# Format com Prettier
npm run format
```

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia o servidor em modo desenvolvimento
- `npm run build` - Compila TypeScript para JavaScript
- `npm start` - Inicia o servidor compilado
- `npm run lint` - Verifica o código com ESLint
- `npm run lint:fix` - Corrige problemas do ESLint automaticamente
- `npm run format` - Formata o código com Prettier
- `npm run migrate:up` - Executa migrações pendentes
- `npm run migrate:down` - Reverte a última migração
- `npm run migrate:create` - Cria uma nova migração

## 🔒 Segurança

- Sempre use HTTPS em produção
- Nunca commite o arquivo `.env`
- Use senhas fortes para o banco de dados
- Configure CORS apropriadamente
- Implemente rate limiting em produção

## 📚 Próximas Etapas

- [ ] Fase 2: Implementar modelos de dados e importação CSV
- [ ] Fase 3: APIs de preferências e restrições
- [ ] Fase 4: Sistema de configuração
- [ ] Fase 5: Integração com serviço Python
- [ ] Autenticação JWT
- [ ] Testes automatizados

## 🤝 Contribuindo

1. Crie uma branch para sua feature: `git checkout -b feature/minha-feature`
2. Commit suas mudanças: `git commit -m 'Adiciona minha feature'`
3. Push para a branch: `git push origin feature/minha-feature`
4. Abra um Pull Request

## 📄 Licença

MIT
