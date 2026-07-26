(function () {
  const params = new URLSearchParams(window.location.search);
  const projectId = params.get('id') || localStorage.getItem('mpc_projectId');
  const preview = JSON.parse(localStorage.getItem('mpc_preview') || '{}');

  if (!projectId) {
    window.location.href = '/quiz.html';
    return;
  }

  document.getElementById('btnCheckout').href = '/checkout.html?id=' + projectId;

  // Meta
  const meta = document.getElementById('meta');
  meta.innerHTML = [
    '<div class="meta-item"><strong>' + (preview.name || 'Projeto Residencial') + '</strong>Nome</div>',
    '<div class="meta-item"><strong>' + (preview.terrain ? preview.terrain.width + '×' + preview.terrain.length + ' m' : '-') + '</strong>Terreno</div>',
    '<div class="meta-item"><strong>' + (preview.construction ? preview.construction.estimated_area + ' m²' : '-') + '</strong>Área est.</div>',
    '<div class="meta-item"><strong>' + (preview.bedrooms || '-') + '</strong>Quartos</div>',
    '<div class="meta-item"><strong>' + (preview.bathrooms || '-') + '</strong>Banheiros</div>',
    '<div class="meta-item"><strong>' + (preview.garage || 0) + '</strong>Garagem</div>',
    '<div class="meta-item"><strong>' + (preview.style || '-') + '</strong>Estilo</div>'
  ].join('');

  // Explanations
  if (preview.explanations && preview.explanations.length) {
    document.getElementById('explanations').innerHTML =
      '<h3 style="margin-bottom:12px;">Decisões do projeto</h3><ul style="color:var(--text-muted);padding-left:20px;">' +
      preview.explanations.map(function(e) { return '<li style="margin-bottom:6px;">' + e + '</li>'; }).join('') +
      '</ul>';
  }

  // Rooms list
  if (preview.rooms && preview.rooms.length) {
    var list = '<div style="margin:16px 0;"><h3 style="margin-bottom:12px;">Ambientes</h3><div style="display:flex;flex-wrap:wrap;gap:8px;">';
    preview.rooms.forEach(function(r) {
      list += '<span style="background:var(--white);border:1px solid var(--border);border-radius:8px;padding:6px 12px;font-size:0.9rem;">' + r.name + '</span>';
    });
    list += '</div></div>';
    document.getElementById('explanations').insertAdjacentHTML('beforebegin', list);
  }

  // Load SVG
  var container = document.getElementById('svgContainer');
  fetch('/api/projects/' + projectId + '/svg?type=humanized')
    .then(function(r) { return r.text(); })
    .then(function(svg) {
      container.innerHTML = svg;
    })
    .catch(function() {
      container.innerHTML = '<p style="padding:40px;color:var(--text-muted);">Planta em processamento. Atualize a página.</p>';
    });
})();
