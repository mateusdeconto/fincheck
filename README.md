# FinCheck 💰

Diagnóstico financeiro para pequenas empresas brasileiras. Responda 6 perguntas simples e receba uma análise completa da saúde financeira do seu negócio — em linguagem humana, sem jargão contábil.

## Estrutura do Projeto

```
fincheck/
├── backend/          # API Node.js + Express
│   ├── server.js     # Servidor principal
│   └── routes/
│       ├── diagnose.js  # Geração de diagnóstico (streaming)
│       └── chat.js      # Chat financeiro
├── frontend/         # React + Vite + Tailwind
│   └── src/
│       ├── App.jsx           # Máquina de estados do fluxo
│       └── components/
│           ├── Onboarding.jsx    # Tela 1: Nome e segmento
│           ├── Questionnaire.jsx # Tela 2: 6 perguntas
│           ├── Loading.jsx       # Tela 3: Animação de carregamento
│           ├── Diagnosis.jsx     # Tela 4: Diagnóstico com streaming
│           └── Chat.jsx          # Tela 5: Chat financeiro
└── .env.example      # Variáveis de ambiente necessárias
```

## Pré-requisitos

- Node.js 18+
- Uma API key da Anthropic ([obter aqui](https://console.anthropic.com/))

## Instalação

### 1. Configure as variáveis de ambiente

```bash
# Na pasta raiz do projeto
cp .env.example .env
# Edite o .env e adicione sua ANTHROPIC_API_KEY
```

### 2. Instale as dependências do backend

```bash
cd backend
npm install
```

### 3. Instale as dependências do frontend

```bash
cd frontend
npm install
```

## Execução

### Opção A — Terminais separados (desenvolvimento)

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Servidor rodando em http://localhost:3001
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# App rodando em http://localhost:5173
```

### Opção B — Um comando só (se quiser usar concurrently)

```bash
# Na raiz do projeto
npm install
npm run dev
```

Acesse: **http://localhost:5173**

## Como usar

1. **Informe seu negócio** — Nome da empresa e segmento
2. **Responda as perguntas** — 6 perguntas numéricas simples sobre o mês
3. **Aguarde a análise** — A IA processa seus dados
4. **Leia o diagnóstico** — 4 seções com alertas e recomendações
5. **Tire dúvidas** — Use o chat para perguntar sobre seus números

## Fluxo de dados

```
Frontend (React)
  → POST /api/diagnose (Express)
    → Anthropic API (streaming)
      → SSE de volta ao frontend
        → Texto aparece progressivamente
```

A API key da Anthropic **nunca** chega ao frontend — fica 100% no backend.

## Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `ANTHROPIC_API_KEY` | ✅ Sim | Chave da API Anthropic |
| `PORT` | ❌ Não | Porta do servidor (padrão: 3001) |
