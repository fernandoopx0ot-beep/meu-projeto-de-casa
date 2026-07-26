(function () {
  var params = new URLSearchParams(window.location.search);
  var projectId = params.get('id') || localStorage.getItem('mpc_projectId');
  var token = params.get('token') || localStorage.getItem('mpc_token');

  if (!projectId) {
    window.location.href = '/';
    return;
  }

  var fileNames = [
    '01 - Apresentação do Projeto.pdf',
    '02 - Planta Baixa Cotada.pdf',
    '03 - Planta Humanizada.pdf',
    '04 - Implantação no Terreno.pdf',
    '05 - Fachadas.pdf',
    '06 - Cortes.pdf',
    '07 - Planta de Cobertura.pdf',
    '08 - Projeto Elétrico Preliminar.pdf',
    '09 - Projeto Hidráulico Preliminar.pdf',
    '10 - Memorial Descritivo.pdf',
    '11 - Quadro de Áreas.pdf',
    '12 - Estimativa de Materiais.pdf',
    '13 - Cronograma Orientativo.pdf',
    '14 - Imagens em 3D.zip',
    '15 - Arquivos Editáveis.zip'
  ];

  fetch('/api/access/' + token)
    .then(function(r) {
      if (r.status === 403) {
        document.getElementById('locked').classList.remove('hidden');
        return null;
      }
      if (!r.ok) throw new Error('Erro');
      return r.json();
    })
    .then(function(data) {
      if (!data) return;
      document.getElementById('content').classList.remove('hidden');
      document.getElementById('clientName').textContent = data.customer.name || '';
      document.getElementById('projInfo').textContent =
        'Código: ' + data.id + ' · Criado em ' + new Date(data.created_at).toLocaleDateString('pt-BR') +
        ' · Status: Liberado';

      var ar = data.ai_result || {};
      document.getElementById('meta').innerHTML =
        '<div class="meta-item"><strong>' + (ar.construction && ar.construction.estimated_area || '-') + ' m²</strong>Área</div>' +
        '<div class="meta-item"><strong>' + (ar.bedrooms || '-') + '</strong>Quartos</div>' +
        '<div class="meta-item"><strong>' + (ar.bathrooms || '-') + '</strong>Banheiros</div>' +
        '<div class="meta-item"><strong>' + (ar.style || '-') + '</strong>Estilo</div>';

      // SVG
      fetch('/api/projects/' + data.id + '/svg?type=humanized')
        .then(function(r) { return r.text(); })
        .then(function(svg) { document.getElementById('svgFull').innerHTML = svg; });

      // Files
      var filesEl = document.getElementById('files');
      fileNames.forEach(function(name, i) {
        var div = document.createElement('div');
        div.className = 'file-card';
        div.innerHTML =
          '<div class="icon">' + (name.indexOf('.zip') >= 0 ? '📦' : '📄') + '</div>' +
          '<div class="info"><div class="name">' + name + '</div><div class="size">Disponível</div></div>' +
          '<button class="btn btn-outline" style="padding:8px 14px;font-size:0.85rem;" data-file="' + name + '">Baixar</button>';
        filesEl.appendChild(div);
      });

      filesEl.querySelectorAll('button').forEach(function(btn) {
        btn.addEventListener('click', function() {
          alert('Download simulado: ' + btn.dataset.file + '\n\nEm produção, o arquivo seria gerado e enviado com autenticação.');
        });
      });
    })
    .catch(function(err) {
      console.error(err);
      document.getElementById('locked').classList.remove('hidden');
      document.getElementById('locked').querySelector('h2').textContent = 'Não foi possível carregar o projeto';
    });
})();
