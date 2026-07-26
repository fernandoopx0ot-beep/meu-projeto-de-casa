(function () {
  const params = new URLSearchParams(window.location.search);
  const projectId = params.get('id') || localStorage.getItem('mpc_projectId');
  const preview = JSON.parse(localStorage.getItem('mpc_preview') || '{}');
  const answers = JSON.parse(localStorage.getItem('mpc_answers') || '{}');

  if (!projectId) {
    window.location.href = '/';
    return;
  }

  document.getElementById('cName').value = answers.name || '';
  document.getElementById('cEmail').value = answers.email || '';
  document.getElementById('cPhone').value = answers.phone || '';

  document.getElementById('summaryContent').innerHTML =
    '<p><strong>' + (preview.name || 'Projeto Residencial') + '</strong></p>' +
    '<p style="color:var(--text-muted);font-size:0.9rem;margin:8px 0;">' + (preview.summary || '') + '</p>' +
    '<ul style="font-size:0.9rem;color:var(--text-muted);padding-left:18px;margin-top:12px;">' +
    '<li>Planta baixa e humanizada</li><li>Fachadas e cortes</li><li>Elétrico e hidráulico preliminar</li>' +
    '<li>Memorial e quadro de áreas</li><li>PDF completo + arquivos</li></ul>';

  let payMethod = 'pix';
  document.getElementById('payPix').addEventListener('click', function() {
    payMethod = 'pix';
    this.classList.add('selected');
    this.querySelector('.option-check').textContent = '✓';
    document.getElementById('payCard').classList.remove('selected');
    document.getElementById('payCard').querySelector('.option-check').textContent = '';
  });
  document.getElementById('payCard').addEventListener('click', function() {
    payMethod = 'card';
    this.classList.add('selected');
    this.querySelector('.option-check').textContent = '✓';
    document.getElementById('payPix').classList.remove('selected');
    document.getElementById('payPix').querySelector('.option-check').textContent = '';
  });

  document.getElementById('btnPay').addEventListener('click', async function() {
    var btn = this;
    btn.disabled = true;
    btn.textContent = 'Processando...';

    try {
      // Modo desenvolvimento: mockApprove = true
      var res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: projectId,
          method: payMethod,
          cpf: document.getElementById('cCpf').value,
          mockApprove: true
        })
      });
      var data = await res.json();
      if (data.success) {
        localStorage.setItem('mpc_token', data.accessToken || localStorage.getItem('mpc_token'));
        if (data.released || data.status === 'approved') {
          window.location.href = '/obrigado.html?status=approved&id=' + projectId;
        } else {
          window.location.href = '/obrigado.html?status=pending&id=' + projectId + '&tx=' + data.transactionId;
        }
      } else {
        alert('Erro no pagamento. Tente novamente.');
        btn.disabled = false;
        btn.textContent = 'Pagar R$ 47,90';
      }
    } catch (e) {
      console.error(e);
      alert('Erro de conexão.');
      btn.disabled = false;
      btn.textContent = 'Pagar R$ 47,90';
    }
  });
})();
