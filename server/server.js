/**
 * Meu Projeto de Casa - Servidor Principal
 * MVP funcional com Node.js puro (http + fs)
 * Para produção com Express: npm install e ajuste as rotas.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const crypto = require('crypto');
const querystring = require('querystring');

// Config
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, '..', 'data');
const GENERATED_DIR = path.join(__dirname, '..', 'generated');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

const PRICE = 4790; // R$ 47,90 em centavos
const PRICE_ORIGINAL = 19700;

// Helpers
function readJSON(file) {
  const p = path.join(DATA_DIR, file);
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return [];
  }
}

function writeJSON(file, data) {
  const p = path.join(DATA_DIR, file);
  fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
}

function generateId() {
  const projects = readJSON('projects.json');
  const year = new Date().getFullYear();
  const num = String(projects.length + 1).padStart(6, '0');
  return `PRJ-${year}-${num}`;
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; if (body.length > 1e6) reject(new Error('Body too large')); });
    req.on('end', () => {
      try {
        if (req.headers['content-type']?.includes('application/json')) {
          resolve(JSON.parse(body || '{}'));
        } else {
          resolve(querystring.parse(body));
        }
      } catch (e) {
        resolve({});
      }
    });
  });
}

function sendJSON(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

function sendFile(res, filePath, contentType) {
  try {
    const data = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
}

function mime(ext) {
  const map = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.ico': 'image/x-icon'
  };
  return map[ext] || 'application/octet-stream';
}

// Mock AI Generator (substitui OpenAI quando sem chave)
function generateMockProject(answers) {
  const terrain = answers.terrain || { width: 10, length: 20 };
  const bedrooms = parseInt(answers.bedrooms) || 3;
  const bathrooms = parseInt(answers.bathrooms) || 2;
  const garage = answers.garage || '2';
  const style = answers.style || 'moderna';
  const extras = answers.extras || [];
  const priority = answers.priority || 'aproveitar';

  const width = Math.min(terrain.width - 1.5, 12);
  const length = Math.min(terrain.length * 0.7, 18);
  const area = Math.round(width * length * 0.85);

  const rooms = [];
  let x = 0.5, y = 0.5;

  // Garagem
  if (garage !== '0') {
    const gW = garage === '1' ? 3 : garage === '2' ? 5.5 : 7;
    rooms.push({ id: 'garage', name: 'Garagem', type: 'garage', x, y, width: gW, height: 5 });
    x += gW + 0.15;
  }

  // Sala + Cozinha
  const socialW = Math.min(6, width - x - 0.5);
  rooms.push({ id: 'living_kitchen', name: 'Sala e Cozinha Integradas', type: 'social', x, y, width: socialW, height: 5.5 });
  y += 5.65;

  // Lavanderia
  if (extras.includes('lavanderia') || true) {
    rooms.push({ id: 'laundry', name: 'Lavanderia', type: 'service', x: 0.5, y, width: 2.5, height: 2.2 });
  }

  // Banheiros e quartos
  let bx = x;
  for (let i = 0; i < bathrooms; i++) {
    rooms.push({
      id: `bath_${i + 1}`,
      name: i === 0 && extras.includes('suite') ? 'Banheiro Suíte' : `Banheiro ${i + 1}`,
      type: 'bathroom',
      x: bx,
      y: y,
      width: 2.2,
      height: 2.5
    });
    bx += 2.4;
  }

  y += 2.7;
  for (let i = 0; i < bedrooms; i++) {
    const isSuite = i === 0 && extras.includes('suite');
    rooms.push({
      id: `bed_${i + 1}`,
      name: isSuite ? 'Suíte' : `Quarto ${i + 1}`,
      type: 'bedroom',
      x: 0.5 + (i % 2) * 4.5,
      y: y + Math.floor(i / 2) * 3.5,
      width: isSuite ? 4 : 3.5,
      height: 3.2
    });
  }

  if (extras.includes('escritorio')) {
    rooms.push({ id: 'office', name: 'Escritório', type: 'office', x: width - 3.5, y: 0.5, width: 3, height: 3 });
  }
  if (extras.includes('area_gourmet')) {
    rooms.push({ id: 'gourmet', name: 'Área Gourmet', type: 'external', x: 0.5, y: length - 4, width: 5, height: 3.5 });
  }

  return {
    project_name: `Projeto Residencial ${style.charAt(0).toUpperCase() + style.slice(1)}`,
    summary: `Casa térrea ${style} com ${bedrooms} quartos, ${bathrooms} banheiros${garage !== '0' ? ` e garagem para ${garage} carro(s)` : ''}. Prioridade: ${priority}.`,
    terrain: { width: terrain.width, length: terrain.length },
    construction: {
      estimated_width: Math.round(width * 10) / 10,
      estimated_length: Math.round(length * 10) / 10,
      estimated_area: area,
      floors: 1
    },
    rooms,
    doors: [
      { id: 'd1', from: 'exterior', to: 'living_kitchen', x: x + 1, y: 0.5, width: 0.9, type: 'entry' }
    ],
    windows: rooms.filter(r => r.type !== 'garage').map((r, i) => ({
      id: `w${i}`, room: r.id, wall: 'external', width: 1.2, height: 1.2
    })),
    furniture: [],
    electrical_points: [],
    hydraulic_points: [],
    project_explanations: [
      `Distribuição otimizada para terreno de ${terrain.width}x${terrain.length}m.`,
      `Área social integrada para melhor aproveitamento.`,
      `Banheiros posicionados próximos aos quartos e área de serviço.`,
      'Medidas preliminares — sujeitas a ajustes técnicos profissionais.'
    ],
    warnings: [
      'Projeto preliminar. Não substitui projeto executivo assinado por profissional habilitado.',
      'Verificar recuos e normas municipais antes da construção.'
    ],
    deliverables: [
      'Planta baixa cotada', 'Planta humanizada', 'Fachadas', 'Cortes',
      'Projeto elétrico preliminar', 'Projeto hidráulico preliminar',
      'Memorial descritivo', 'Quadro de áreas'
    ],
    style,
    bedrooms,
    bathrooms,
    garage: garage === '0' ? 0 : parseInt(garage) || 2
  };
}

// SVG Generator
function generateSVG(project, humanized = true) {
  const t = project.terrain;
  const scale = 25; // px per meter
  const pad = 40;
  const w = t.width * scale + pad * 2;
  const h = t.length * scale + pad * 2 + 80;

  const colors = humanized ? {
    social: '#F5E6C8',
    bedroom: '#D4E6F1',
    bathroom: '#D5F5E3',
    garage: '#D5D8DC',
    service: '#FCF3CF',
    external: '#D5F5E3',
    office: '#E8DAEF',
    wall: '#2C3E50',
    text: '#1A252F'
  } : {
    social: '#F8F9FA',
    bedroom: '#F8F9FA',
    bathroom: '#F8F9FA',
    garage: '#E9ECEF',
    service: '#F8F9FA',
    external: '#E9ECEF',
    office: '#F8F9FA',
    wall: '#212529',
    text: '#212529'
  };

  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" height="auto">
  <rect width="100%" height="100%" fill="#fff"/>
  <!-- Terreno -->
  <rect x="${pad}" y="${pad}" width="${t.width * scale}" height="${t.length * scale}"
        fill="none" stroke="#95A5A6" stroke-width="1.5" stroke-dasharray="6,3"/>
  <text x="${pad}" y="${pad - 10}" font-family="Arial,sans-serif" font-size="11" fill="#7F8C8D">
    Terreno ${t.width}m × ${t.length}m
  </text>
`;

  // Rooms
  (project.rooms || []).forEach(r => {
    const rx = pad + r.x * scale;
    const ry = pad + r.y * scale;
    const rw = r.width * scale;
    const rh = r.height * scale;
    const fill = colors[r.type] || colors.social;
    svg += `
  <rect x="${rx}" y="${ry}" width="${rw}" height="${rh}"
        fill="${fill}" stroke="${colors.wall}" stroke-width="2"/>
  <text x="${rx + rw / 2}" y="${ry + rh / 2 - 6}" text-anchor="middle"
        font-family="Arial,sans-serif" font-size="10" font-weight="600" fill="${colors.text}">
    ${r.name}
  </text>
  <text x="${rx + rw / 2}" y="${ry + rh / 2 + 8}" text-anchor="middle"
        font-family="Arial,sans-serif" font-size="9" fill="#5D6D7E">
    ${r.width.toFixed(1)} × ${r.height.toFixed(1)} m
  </text>`;
  });

  // Scale bar
  const scaleY = pad + t.length * scale + 30;
  svg += `
  <line x1="${pad}" y1="${scaleY}" x2="${pad + 5 * scale}" y2="${scaleY}" stroke="#333" stroke-width="2"/>
  <line x1="${pad}" y1="${scaleY - 5}" x2="${pad}" y2="${scaleY + 5}" stroke="#333"/>
  <line x1="${pad + 5 * scale}" y1="${scaleY - 5}" x2="${pad + 5 * scale}" y2="${scaleY + 5}" stroke="#333"/>
  <text x="${pad + 2.5 * scale}" y="${scaleY + 18}" text-anchor="middle" font-size="10" fill="#333">5 m</text>
  <!-- Norte -->
  <g transform="translate(${w - 50}, ${pad + 20})">
    <polygon points="0,-18 6,6 -6,6" fill="#2C3E50"/>
    <text y="20" text-anchor="middle" font-size="11" font-weight="bold">N</text>
  </g>
  <!-- Título -->
  <text x="${w / 2}" y="${h - 25}" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" fill="#2C3E50">
    ${project.project_name || 'Projeto Residencial'} — Área est.: ${project.construction?.estimated_area || '-'} m²
  </text>
  <text x="${w / 2}" y="${h - 10}" text-anchor="middle" font-size="9" fill="#7F8C8D">
    Projeto preliminar — sujeito a análise técnica profissional
  </text>
</svg>`;
  return svg;
}

// Simple PDF (text-based mock using HTML-like, real PDF needs pdfkit)
function generatePDFContent(project, customer) {
  return `PROJETO RESIDENCIAL PERSONALIZADO
Código: ${project.id}
Cliente: ${customer.name}
Cidade: ${customer.city}/${customer.state}
Data: ${new Date().toLocaleDateString('pt-BR')}

RESUMO
${project.ai_result?.summary || ''}

Terreno: ${project.ai_result?.terrain?.width}m × ${project.ai_result?.terrain?.length}m
Área construída estimada: ${project.ai_result?.construction?.estimated_area} m²
Quartos: ${project.ai_result?.bedrooms}
Banheiros: ${project.ai_result?.bathrooms}

AVISO: Este material possui caráter preliminar e foi desenvolvido para planejamento,
visualização e preparação do projeto residencial. Antes da execução da obra,
compra de materiais, solicitação de alvará ou aprovação municipal, o conteúdo deve
ser analisado, adaptado e aprovado por engenheiro ou arquiteto legalmente habilitado,
responsável pela emissão da ART ou RRT correspondente.
`;
}

// Routes
async function handleAPI(req, res, pathname) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  // POST /api/projects - criar projeto a partir do quiz
  if (pathname === '/api/projects' && req.method === 'POST') {
    const body = await parseBody(req);
    const id = generateId();
    const token = generateToken();

    const answers = {
      terrain: body.terrain || { width: 10, length: 20 },
      bedrooms: body.bedrooms || '3',
      bathrooms: body.bathrooms || '2',
      garage: body.garage || '2',
      extras: body.extras || [],
      style: body.style || 'moderna',
      priority: body.priority || 'aproveitar'
    };

    const customer = {
      name: body.name || '',
      email: body.email || '',
      phone: body.phone || '',
      city: body.city || '',
      state: body.state || ''
    };

    // Gerar com mock (ou OpenAI se chave disponível)
    let aiResult = generateMockProject(answers);

    // Validação simples
    const validation = { valid: true, errors: [] };
    if (!aiResult.rooms || aiResult.rooms.length < 2) {
      validation.valid = false;
      validation.errors.push('Poucos ambientes gerados');
    }

    const project = {
      id,
      customer,
      answers,
      ai_result: aiResult,
      validation,
      payment: { status: 'pending', transaction_id: null, amount: PRICE },
      access: { released: false, token },
      files: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Salvar pasta do projeto
    const projDir = path.join(GENERATED_DIR, id);
    if (!fs.existsSync(projDir)) fs.mkdirSync(projDir, { recursive: true });

    // Gerar SVGs
    const svgHuman = generateSVG(aiResult, true);
    const svgTech = generateSVG(aiResult, false);
    fs.writeFileSync(path.join(projDir, 'planta-humanizada.svg'), svgHuman);
    fs.writeFileSync(path.join(projDir, 'planta-tecnica.svg'), svgTech);

    // PDF mock
    fs.writeFileSync(path.join(projDir, '01-apresentacao.txt'), generatePDFContent(project, customer));

    project.files = [
      'planta-humanizada.svg',
      'planta-tecnica.svg',
      '01-apresentacao.txt'
    ];

    const projects = readJSON('projects.json');
    projects.push(project);
    writeJSON('projects.json', projects);

    return sendJSON(res, 201, {
      success: true,
      projectId: id,
      token,
      preview: {
        name: aiResult.project_name,
        summary: aiResult.summary,
        terrain: aiResult.terrain,
        construction: aiResult.construction,
        bedrooms: aiResult.bedrooms,
        bathrooms: aiResult.bathrooms,
        garage: aiResult.garage,
        style: aiResult.style,
        rooms: aiResult.rooms.map(r => ({ name: r.name, type: r.type, area: (r.width * r.height).toFixed(1) })),
        explanations: aiResult.project_explanations
      }
    });
  }

  // GET /api/projects/:id/svg
  if (pathname.match(/^\/api\/projects\/[^/]+\/svg/) && req.method === 'GET') {
    const id = pathname.split('/')[3];
    const type = url.parse(req.url, true).query.type || 'humanized';
    const file = type === 'tech' ? 'planta-tecnica.svg' : 'planta-humanizada.svg';
    const filePath = path.join(GENERATED_DIR, id, file);
    if (fs.existsSync(filePath)) {
      return sendFile(res, filePath, 'image/svg+xml');
    }
    return sendJSON(res, 404, { error: 'SVG não encontrado' });
  }

  // GET /api/projects/:id
  if (pathname.startsWith('/api/projects/') && req.method === 'GET') {
    const parts = pathname.split('/');
    const id = parts[3];
    const projects = readJSON('projects.json');
    const project = projects.find(p => p.id === id);
    if (!project) return sendJSON(res, 404, { error: 'Projeto não encontrado' });

    const q = url.parse(req.url, true).query;
    // Se não liberado, retornar só preview
    if (!project.access.released && q.token !== project.access.token) {
      return sendJSON(res, 200, {
        id: project.id,
        preview: true,
        name: project.ai_result.project_name,
        summary: project.ai_result.summary,
        terrain: project.ai_result.terrain,
        construction: project.ai_result.construction,
        bedrooms: project.ai_result.bedrooms,
        bathrooms: project.ai_result.bathrooms,
        garage: project.ai_result.garage,
        style: project.ai_result.style,
        rooms: project.ai_result.rooms.map(r => ({ name: r.name, type: r.type })),
        explanations: project.ai_result.project_explanations,
        payment: { status: project.payment.status }
      });
    }

    return sendJSON(res, 200, project);
  }

  // POST /api/payments/create
  if (pathname === '/api/payments/create' && req.method === 'POST') {
    const body = await parseBody(req);
    const projects = readJSON('projects.json');
    const project = projects.find(p => p.id === body.projectId);
    if (!project) return sendJSON(res, 404, { error: 'Projeto não encontrado' });

    // Mock Mercado Pago - em desenvolvimento aprova automaticamente se mock=true
    const transactionId = 'MP-' + Date.now();
    project.payment.transaction_id = transactionId;
    project.payment.status = body.mockApprove ? 'approved' : 'pending';
    project.updated_at = new Date().toISOString();

    if (body.mockApprove) {
      project.access.released = true;
    }

    writeJSON('projects.json', projects);

    const payments = readJSON('payments.json');
    payments.push({
      id: transactionId,
      projectId: project.id,
      amount: PRICE,
      status: project.payment.status,
      created_at: new Date().toISOString()
    });
    writeJSON('payments.json', payments);

    return sendJSON(res, 200, {
      success: true,
      transactionId,
      status: project.payment.status,
      amount: PRICE / 100,
      pixCode: body.mockApprove ? null : '00020126580014BR.GOV.BCB.PIX0136' + crypto.randomBytes(16).toString('hex'),
      accessToken: project.access.token,
      released: project.access.released
    });
  }

  // POST /api/payments/webhook (simulado)
  if (pathname === '/api/payments/webhook' && req.method === 'POST') {
    const body = await parseBody(req);
    const projects = readJSON('projects.json');
    const project = projects.find(p => p.payment.transaction_id === body.transactionId || p.id === body.projectId);
    if (project && body.status === 'approved') {
      project.payment.status = 'approved';
      project.access.released = true;
      project.updated_at = new Date().toISOString();
      writeJSON('projects.json', projects);
    }
    return sendJSON(res, 200, { received: true });
  }

  // GET /api/access/:token
  if (pathname.startsWith('/api/access/') && req.method === 'GET') {
    const token = pathname.split('/')[3];
    const projects = readJSON('projects.json');
    const project = projects.find(p => p.access.token === token);
    if (!project) return sendJSON(res, 404, { error: 'Acesso inválido' });
    if (!project.access.released) return sendJSON(res, 403, { error: 'Projeto ainda não liberado. Aguarde confirmação do pagamento.' });
    return sendJSON(res, 200, {
      id: project.id,
      customer: project.customer,
      ai_result: project.ai_result,
      files: project.files,
      created_at: project.created_at
    });
  }

  // Admin simple
  if (pathname === '/api/admin/projects' && req.method === 'GET') {
    const auth = req.headers.authorization || '';
    if (auth !== 'Bearer admin123') return sendJSON(res, 401, { error: 'Não autorizado' });
    return sendJSON(res, 200, readJSON('projects.json'));
  }

  sendJSON(res, 404, { error: 'Endpoint não encontrado' });
}

// Main server
const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  let pathname = parsed.pathname;

  // API
  if (pathname.startsWith('/api/')) {
    try {
      await handleAPI(req, res, pathname);
    } catch (err) {
      console.error(err);
      sendJSON(res, 500, { error: 'Erro interno', message: err.message });
    }
    return;
  }

  // Static files
  if (pathname === '/') pathname = '/index.html';
  const filePath = path.join(PUBLIC_DIR, pathname);
  const ext = path.extname(filePath);

  // Security: prevent path traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return sendFile(res, filePath, mime(ext));
  }

  // SPA fallback for known pages
  const pages = ['/quiz', '/resultado', '/checkout', '/obrigado', '/projeto', '/admin'];
  if (pages.includes(pathname) || pages.some(p => pathname.startsWith(p))) {
    const html = path.join(PUBLIC_DIR, pathname.replace(/^\//, '') + '.html');
    if (fs.existsSync(html)) return sendFile(res, html, 'text/html; charset=utf-8');
  }

  res.writeHead(404, { 'Content-Type': 'text/html' });
  res.end('<h1>404 - Página não encontrada</h1><a href="/">Voltar</a>');
});

server.listen(PORT, () => {
  console.log(`🏠 Meu Projeto de Casa rodando em http://localhost:${PORT}`);
  console.log(`   Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Dados em: ${DATA_DIR}`);
});
