
document.addEventListener('DOMContentLoaded', () => {
  const user = getCurrentUser();
  if (!user) { window.location.href = 'index.html'; return; }

  document.getElementById('user-name').textContent = user.username;
  refresh();
});

async function refresh() {
  const apps = getUserArray('appliances');
  const maint = getUserArray('maintenance');
  const inv = getUserArray('invoices');
  const warranties = getUserArray('warranties');

  // Update main stats
  document.getElementById('cnt-appliances').textContent = apps.length;
  document.getElementById('cnt-maint').textContent = maint.length;
  document.getElementById('cnt-inv').textContent = inv.length;

  // Calculate and display total spending
  const totalSpent = inv.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
  const spendingEl = document.getElementById('total-spending');
  if (spendingEl) {
    spendingEl.textContent = '$' + totalSpent.toFixed(2);
  }

  // Show recent maintenance (last 5)
  const recent = document.getElementById('recent-maint');
  recent.innerHTML = '';
  const sorted = maint.slice().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  if (sorted.length === 0) {
    recent.innerHTML = '<li class="muted">No recent maintenance</li>';
  }
  sorted.forEach(r => {
    const li = document.createElement('li');
    li.textContent = `${r.appliance} — ${r.issue} (${fmt(r.date)})`;
    recent.appendChild(li);
  });

  // Warranty status distribution
  const warrantyStats = {
    safe: 0,
    warning: 0,
    danger: 0,
    expired: 0
  };

  warranties.forEach(w => {
    const days = daysBetween(w.end || w.end_date);
    if (days < 0) warrantyStats.expired++;
    else if (days <= 30) warrantyStats.danger++;
    else if (days <= 90) warrantyStats.warning++;
    else warrantyStats.safe++;
  });

  // Warranty alerts (<=30 days)
  const alertsDiv = document.getElementById('alerts');
  alertsDiv.innerHTML = '';

  warranties.forEach(w => {
    const days = daysBetween(w.end || w.end_date);
    if (days <= 30 && days >= 0) {
      const el = document.createElement('div');
      el.className = 'attention-item';
      el.innerHTML = `
        <div class="info">
          <span class="title">${w.appliance}</span>
          <span class="details">Warranty expires in ${days} day(s) - ${fmt(w.end || w.end_date)}</span>
        </div>
        <span class="warranty-badge ${days <= 7 ? 'danger' : 'warning'}">${days} days</span>
      `;
      alertsDiv.appendChild(el);
    }
  });

  // Add expired warranties
  warranties.forEach(w => {
    const days = daysBetween(w.end || w.end_date);
    if (days < 0) {
      const el = document.createElement('div');
      el.className = 'attention-item';
      el.style.background = 'rgba(100, 116, 139, 0.1)';
      el.style.borderColor = 'rgba(100, 116, 139, 0.2)';
      el.innerHTML = `
        <div class="info">
          <span class="title">${w.appliance}</span>
          <span class="details">Warranty expired ${Math.abs(days)} days ago</span>
        </div>
        <span class="warranty-badge expired">Expired</span>
      `;
      alertsDiv.appendChild(el);
    }
  });

  if (alertsDiv.children.length === 0) {
    alertsDiv.innerHTML = '<p class="muted">No warranty alerts - all appliances are covered!</p>';
  }

  // Appliances needing attention (overdue maintenance)
  const attentionDiv = document.getElementById('attention-items');
  if (attentionDiv) {
    attentionDiv.innerHTML = '';

    // Check for appliances with no recent maintenance (over 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    apps.forEach(app => {
      const appMaint = maint.filter(m => m.appliance === app.name || m.appliance_id === app.id);
      const lastMaint = appMaint.sort((a, b) => new Date(b.date) - new Date(a.date))[0];

      if (!lastMaint || new Date(lastMaint.date) < sixMonthsAgo) {
        const daysSince = lastMaint ?
          Math.floor((new Date() - new Date(lastMaint.date)) / (1000 * 60 * 60 * 24)) :
          'Never';

        const el = document.createElement('div');
        el.className = 'attention-item';
        el.innerHTML = `
          <div class="info">
            <span class="title">${app.name}</span>
            <span class="details">Last maintenance: ${lastMaint ? fmt(lastMaint.date) + ' (' + daysSince + ' days ago)' : 'Never'}</span>
          </div>
          <a href="maintenance.html" class="btn primary">Schedule</a>
        `;
        attentionDiv.appendChild(el);
      }
    });

    if (attentionDiv.children.length === 0) {
      attentionDiv.innerHTML = '<p class="muted">All appliances are well-maintained!</p>';
    }
  }

  // Render warranty distribution chart
  renderWarrantyChart(warrantyStats);
}

function renderWarrantyChart(stats) {
  const canvas = document.getElementById('warranty-chart');
  if (!canvas || typeof Chart === 'undefined') return;

  // Destroy existing chart if it exists
  if (window.warrantyChartInstance) {
    window.warrantyChartInstance.destroy();
  }

  const ctx = canvas.getContext('2d');

  window.warrantyChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Active (>90 days)', 'Warning (30-90 days)', 'Critical (<30 days)', 'Expired'],
      datasets: [{
        data: [stats.safe, stats.warning, stats.danger, stats.expired],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',  // Green
          'rgba(245, 158, 11, 0.8)',   // Yellow
          'rgba(239, 68, 68, 0.8)',    // Red
          'rgba(100, 116, 139, 0.8)'   // Gray
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(100, 116, 139, 1)'
        ],
        borderWidth: 2,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#94a3b8',
            padding: 16,
            font: {
              family: 'Inter, sans-serif',
              size: 12
            },
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          backgroundColor: 'rgba(30, 41, 59, 0.95)',
          titleColor: '#f8fafc',
          bodyColor: '#94a3b8',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
          displayColors: true,
          callbacks: {
            label: function (context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? ((context.raw / total) * 100).toFixed(1) : 0;
              return ` ${context.label}: ${context.raw} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}
