# Meu Projeto de Casa

Aplicação web completa para venda de projetos residenciais personalizados gerados com inteligência artificial.

## Fluxo

Página inicial → Quiz (7 perguntas) → Processamento → Prévia personalizada → Oferta → Checkout → Confirmação → Área do cliente

## Tecnologias (MVP)

- Frontend: HTML, CSS, JavaScript (vanilla)
- Backend: Node.js puro (módulo `http` + `fs`) — pronto para migrar para Express
- Banco: JSON local (`/data`)
- IA: Mock integrado (estrutura pronta para OpenAI)
- Pagamento: Mock Mercado Pago (aprovação automática em desenvolvimento)
- Planta: SVG gerado dinamicamente
- PDF: estrutura preparada

## Instalação

```bash
cd meu-projeto-de-casa
# Opcional (quando houver internet): npm install
cp .env.example .env
# Edite .env com suas chaves
node server/server.js
```

Acesse: http://localhost:3000

## Modo desenvolvimento

- O pagamento é **aprovado automaticamente** (`mockApprove: true`) no checkout.
- A geração de projeto usa um **gerador mock** (não chama OpenAI).
- Para usar OpenAI real: adicione a chave em `.env` e integre a função em `server/server.js` (substitua `generateMockProject`).

## Estrutura

```
/public          → Frontend (HTML, CSS, JS)
/server          → Backend (server.js)
/data            → projects.json, customers.json, payments.json
/generated       → Pastas por projeto (SVGs, arquivos)
```

## Endpoints principais

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /api/projects | Cria projeto a partir do quiz |
| GET | /api/projects/:id | Dados do projeto |
| GET | /api/projects/:id/svg | SVG da planta |
| POST | /api/payments/create | Cria pagamento (mock) |
| POST | /api/payments/webhook | Webhook (simulado) |
| GET | /api/access/:token | Área do cliente |

## Aviso importante

Os materiais são **preliminares**. Antes de construir ou aprovar na prefeitura, é obrigatória a análise e responsabilidade técnica de engenheiro ou arquiteto habilitado (ART/RRT).

## Próximos passos (produção)

1. `npm install` das dependências (Express, OpenAI, pdfkit, etc.)
2. Integrar OpenAI com o prompt estruturado
3. Integrar Mercado Pago real + webhook
4. Gerar PDFs completos com pdfkit
5. Painel admin com autenticação
6. HTTPS e variáveis de ambiente seguras

## Teste rápido

1. Abra http://localhost:3000
2. Clique em "Criar meu projeto"
3. Responda o quiz
4. Veja a prévia
5. Vá ao checkout e pague (simulado)
6. Acesse a área do cliente e os arquivos
