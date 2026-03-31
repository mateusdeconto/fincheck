# FinCheck — Diagnóstico Financeiro para PMEs

## Visão

Aplicação web MVP que permite donos de pequenas empresas brasileiras responderem perguntas simples sobre o negócio e receberem um diagnóstico financeiro completo em linguagem humana, sem jargão contábil.

## Problema

Donos de PMEs não entendem a saúde financeira do próprio negócio porque as ferramentas existentes usam linguagem de contador, não de empreendedor. Resultado: decisões no escuro, caixa que estoura sem aviso, endividamento progressivo.

## Solução

Um formulário guiado com 6 perguntas em linguagem cotidiana → IA processa e gera diagnóstico completo com alertas e recomendações → chat para tirar dúvidas sobre os próprios números.

## Público-Alvo

Dono de PME brasileira (restaurante, varejo, serviços, indústria). Não precisa ter conhecimento contábil.

## Fluxo Principal

1. **Onboarding** — Nome do negócio + segmento
2. **Questionário** — 6 perguntas numéricas, uma por tela
3. **Loading** — Processamento via Anthropic API
4. **Diagnóstico** — 4 seções com streaming progressivo
5. **Chat** — Perguntas livres com contexto dos dados

## Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- IA: Anthropic API (claude-sonnet-4-5)
- Estado: em memória (sem banco de dados)

## Definição de Pronto

- Usuário consegue passar pelo fluxo completo do início ao fim
- Diagnóstico gerado em streaming aparece progressivamente
- Chat responde com contexto dos dados do usuário
- Design mobile-first, responsivo

## Requirements

### Active

- [ ] Formulário multi-step com 6 perguntas numéricas em R$
- [ ] Onboarding com nome e segmento do negócio
- [ ] Diagnóstico gerado via Anthropic API com streaming
- [ ] 4 seções: Resumo Executivo, Pontos de Atenção, O que está funcionando, Recomendações
- [ ] Chat pós-diagnóstico com contexto dos dados
- [ ] Design mobile-first, azul escuro e branco
- [ ] ANTHROPIC_API_KEY via variável de ambiente
- [ ] Sem login ou autenticação

### Out of Scope

- Banco de dados / persistência — MVP usa estado em memória
- Autenticação / login — não necessário no MVP
- Exportar PDF — fase futura
- Múltiplos usuários simultâneos com sessões isoladas — fase futura
