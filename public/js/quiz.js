(function () {
  const TOTAL_STEPS = 8;
  let current = 0;
  const answers = JSON.parse(localStorage.getItem('mpc_answers') || '{}');

  const questions = [
    {
      id: 'terrain',
      title: 'Qual é o tamanho do seu terreno?',
      type: 'single',
      options: [
        { value: '6x20', label: '6 × 20 metros' },
        { value: '8x20', label: '8 × 20 metros' },
        { value: '10x20', label: '10 × 20 metros' },
        { value: '10x25', label: '10 × 25 metros' },
        { value: '12x25', label: '12 × 25 metros' },
        { value: 'outro', label: 'Outro tamanho' }
      ]
    },
    {
      id: 'bedrooms',
      title: 'Quantos quartos sua casa deve ter?',
      type: 'single',
      options: [
        { value: '1', label: '1 quarto' },
        { value: '2', label: '2 quartos' },
        { value: '3', label: '3 quartos' },
        { value: '4', label: '4 quartos' },
        { value: '5', label: '5 ou mais' }
      ]
    },
    {
      id: 'bathrooms',
      title: 'Quantos banheiros você deseja?',
      type: 'single',
      options: [
        { value: '1', label: '1 banheiro' },
        { value: '2', label: '2 banheiros' },
        { value: '3', label: '3 banheiros' },
        { value: '4', label: '4 ou mais' }
      ]
    },
    {
      id: 'garage',
      title: 'Quantos carros devem caber na garagem?',
      type: 'single',
      options: [
        { value: '0', label: 'Sem garagem' },
        { value: '1', label: '1 carro' },
        { value: '2', label: '2 carros' },
        { value: '3', label: '3 ou mais' }
      ]
    },
    {
      id: 'extras',
      title: 'Quais espaços não podem faltar?',
      type: 'multi',
      options: [
        { value: 'suite', label: 'Suíte' },
        { value: 'closet', label: 'Closet' },
        { value: 'escritorio', label: 'Escritório' },
        { value: 'lavanderia', label: 'Lavanderia' },
        { value: 'area_gourmet', label: 'Área gourmet' },
        { value: 'varanda', label: 'Varanda' },
        { value: 'piscina', label: 'Piscina' },
        { value: 'despensa', label: 'Despensa' },
        { value: 'jardim', label: 'Jardim' },
        { value: 'banheiro_externo', label: 'Banheiro externo' }
      ]
    },
    {
      id: 'style',
      title: 'Qual estilo de casa você prefere?',
      type: 'single',
      grid: true,
      options: [
        { value: 'moderna', label: '🏠 Moderna' },
        { value: 'contemporanea', label: '✨ Contemporânea' },
        { value: 'classica', label: '🏛️ Clássica' },
        { value: 'colonial', label: '🏡 Colonial' },
        { value: 'economica', label: '💰 Econômica' },
        { value: 'minimalista', label: '⬜ Minimalista' }
      ]
    },
    {
      id: 'priority',
      title: 'Qual é sua principal prioridade?',
      type: 'single',
      options: [
        { value: 'economizar', label: 'Economizar na construção' },
        { value: 'aproveitar', label: 'Aproveitar melhor o terreno' },
        { value: 'ambientes_maiores', label: 'Ter ambientes maiores' },
        { value: 'privacidade', label: 'Ter mais privacidade' },
        { value: 'integrar', label: 'Integrar sala e cozinha' },
        { value: 'ampliar', label: 'Criar uma casa para ampliar no futuro' }
      ]
    },
    {
      id: 'contact',
      title: 'Quase lá! Seus dados para receber o projeto',
      type: 'form'
    }
  ];

  const card = document.getElementById('quizCard');
  const progress = document.getElementById('progress');
  const stepLabel = document.getElementById('stepLabel');

  function save() {
    localStorage.setItem('mpc_answers', JSON.stringify(answers));
  }

  function updateProgress() {
    const pct = ((current + 1) / TOTAL_STEPS) * 100;
    progress.style.width = pct + '%';
    stepLabel.textContent = 'Etapa ' + (current + 1) + ' de ' + TOTAL_STEPS;
  }

  function render() {
    updateProgress();
    const q = questions[current];
    let html = '<div class="quiz-step">Pergunta ' + (current + 1) + '</div><h2 class="quiz-question">' + q.title + '</h2>';

    if (q.type === 'form') {
      html += '<div class="input-group"><label>Nome completo</label><input type="text" id="name" value="' + (answers.name || '') + '" required placeholder="Seu nome"></div>';
      html += '<div class="input-group"><label>WhatsApp</label><input type="tel" id="phone" value="' + (answers.phone || '') + '" required placeholder="(11) 99999-9999"></div>';
      html += '<div class="input-group"><label>E-mail</label><input type="email" id="email" value="' + (answers.email || '') + '" required placeholder="seu@email.com"></div>';
      html += '<div class="input-group"><label>Cidade</label><input type="text" id="city" value="' + (answers.city || '') + '" required placeholder="Sua cidade"></div>';
      html += '<div class="input-group"><label>Estado</label><select id="state"><option value="">Selecione</option>';
      ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].forEach(function(s) {
        html += '<option value="' + s + '"' + (answers.state === s ? ' selected' : '') + '>' + s + '</option>';
      });
      html += '</select></div>';
      html += '<div class="quiz-nav"><button class="btn btn-outline" id="btnBack">Voltar</button><button class="btn btn-primary" id="btnNext">Desenvolver meu projeto</button></div>';
    } else if (q.type === 'multi') {
      var selected = answers.extras || [];
      html += '<div class="options multi option-grid">';
      q.options.forEach(function(o) {
        var sel = selected.indexOf(o.value) >= 0 ? 'selected' : '';
        html += '<button type="button" class="option ' + sel + '" data-value="' + o.value + '"><span class="option-check">' + (sel ? '✓' : '') + '</span><span>' + o.label + '</span></button>';
      });
      html += '</div><div class="quiz-nav"><button class="btn btn-outline" id="btnBack">Voltar</button><button class="btn btn-primary" id="btnNext">Continuar</button></div>';
    } else {
      var grid = q.grid ? 'option-grid' : '';
      html += '<div class="options ' + grid + '">';
      q.options.forEach(function(o) {
        var sel = answers[q.id] === o.value ? 'selected' : '';
        html += '<button type="button" class="option ' + sel + '" data-value="' + o.value + '"><span class="option-check">' + (sel ? '✓' : '') + '</span><span>' + o.label + '</span></button>';
      });
      html += '</div>';
      if (q.id === 'terrain' && answers.terrain === 'outro') {
        html += '<div class="input-group mt-2" id="customTerrain"><label>Largura (metros)</label><input type="number" id="tWidth" min="4" max="50" step="0.5" value="' + (answers.customWidth || '') + '" placeholder="Ex: 9"><label style="margin-top:12px">Comprimento (metros)</label><input type="number" id="tLength" min="8" max="60" step="0.5" value="' + (answers.customLength || '') + '" placeholder="Ex: 22"></div>';
      }
      html += '<div class="quiz-nav"><button class="btn btn-outline" id="btnBack"' + (current === 0 ? ' style="visibility:hidden"' : '') + '>Voltar</button><button class="btn btn-primary" id="btnNext"' + (!answers[q.id] ? ' disabled' : '') + '>Continuar</button></div>';
    }

    card.innerHTML = html;
    bindEvents(q);
  }

  function bindEvents(q) {
    var back = document.getElementById('btnBack');
    if (back) back.addEventListener('click', function() { if (current > 0) { current--; render(); } });

    var next = document.getElementById('btnNext');
    if (next) next.addEventListener('click', function() {
      if (q.type === 'form') {
        answers.name = document.getElementById('name').value.trim();
        answers.phone = document.getElementById('phone').value.trim();
        answers.email = document.getElementById('email').value.trim();
        answers.city = document.getElementById('city').value.trim();
        answers.state = document.getElementById('state').value;
        if (!answers.name || !answers.phone || !answers.email || !answers.city || !answers.state) {
          alert('Preencha todos os campos.');
          return;
        }
        save();
        submitProject();
        return;
      }
      if (q.id === 'terrain' && answers.terrain === 'outro') {
        var w = parseFloat(document.getElementById('tWidth') && document.getElementById('tWidth').value);
        var l = parseFloat(document.getElementById('tLength') && document.getElementById('tLength').value);
        if (!w || !l || w < 4 || l < 8) { alert('Informe largura e comprimento válidos.'); return; }
        answers.customWidth = w;
        answers.customLength = l;
      }
      if (!answers[q.id] && q.type !== 'multi') { alert('Selecione uma opção.'); return; }
      save();
      current++;
      render();
    });

    card.querySelectorAll('.option').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var val = btn.dataset.value;
        if (q.type === 'multi') {
          var arr = answers.extras || [];
          if (arr.indexOf(val) >= 0) arr = arr.filter(function(x) { return x !== val; });
          else arr.push(val);
          answers.extras = arr;
          save();
          render();
        } else {
          answers[q.id] = val;
          if (q.id === 'terrain' && val !== 'outro') {
            var parts = val.split('x');
            answers.terrainWidth = Number(parts[0]);
            answers.terrainLength = Number(parts[1]);
          }
          save();
          render();
        }
      });
    });
  }

  function parseTerrain() {
    if (answers.terrain === 'outro') return { width: answers.customWidth || 10, length: answers.customLength || 20 };
    var map = { '6x20': { width: 6, length: 20 }, '8x20': { width: 8, length: 20 }, '10x20': { width: 10, length: 20 }, '10x25': { width: 10, length: 25 }, '12x25': { width: 12, length: 25 } };
    return map[answers.terrain] || { width: 10, length: 20 };
  }

  async function submitProject() {
    card.innerHTML = '<div class="text-center"><div class="spinner"></div><p class="proc-msg" id="procMsg">Analisando as medidas do terreno...</p><div class="proc-bar"><div class="proc-fill" id="procFill"></div></div></div>';
    var messages = ['Analisando as medidas do terreno...', 'Organizando os ambientes...', 'Calculando a melhor distribuição...', 'Criando a planta personalizada...', 'Desenvolvendo a fachada...', 'Preparando sua apresentação...'];
    var i = 0;
    var fill = document.getElementById('procFill');
    var msg = document.getElementById('procMsg');
    var interval = setInterval(function() {
      i++;
      if (i < messages.length) { msg.textContent = messages[i]; fill.style.width = ((i + 1) / messages.length * 90) + '%'; }
    }, 700);

    var payload = {
      terrain: parseTerrain(),
      bedrooms: answers.bedrooms,
      bathrooms: answers.bathrooms,
      garage: answers.garage,
      extras: answers.extras || [],
      style: answers.style,
      priority: answers.priority,
      name: answers.name,
      email: answers.email,
      phone: answers.phone,
      city: answers.city,
      state: answers.state
    };

    try {
      var res = await fetch('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      var data = await res.json();
      clearInterval(interval);
      fill.style.width = '100%';
      msg.textContent = 'Projeto pronto!';
      if (data.success) {
        localStorage.setItem('mpc_projectId', data.projectId);
        localStorage.setItem('mpc_token', data.token);
        localStorage.setItem('mpc_preview', JSON.stringify(data.preview));
        setTimeout(function() { window.location.href = '/resultado.html?id=' + data.projectId; }, 600);
      } else {
        alert('Erro ao gerar projeto. Tente novamente.');
        current = 0; render();
      }
    } catch (err) {
      clearInterval(interval);
      console.error(err);
      alert('Erro de conexão. Verifique se o servidor está rodando.');
      current = TOTAL_STEPS - 1; render();
    }
  }

  render();
})();
