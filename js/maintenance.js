
document.addEventListener('DOMContentLoaded', async () => {
  const tbl = document.querySelector('#tbl-m tbody'); const btnAdd = document.getElementById('btn-add-m'); const modal = document.getElementById('modal'); const mb = document.getElementById('modal-body'); const search = document.getElementById('search-m');

  let maintenance = [];
  let applianceNames = [];

  // Load maintenance records from API
  async function loadMaintenance() {
    try {
      const result = await apiRequest('/maintenance', 'GET');
      maintenance = result.data.map(m => ({
        id: m.id,
        appliance: m.appliance,
        appliance_id: m.appliance_id,
        date: m.date,
        issue: m.issue,
        notes: m.notes
      }));
      render();
    } catch (error) {
      alert('Failed to load maintenance records: ' + error.message);
    }
  }

  // Load appliance names for dropdown
  async function loadAppliances() {
    try {
      const result = await apiRequest('/appliances', 'GET');
      applianceNames = result.data.map(a => a.name);
    } catch (error) {
      console.error('Failed to load appliances:', error);
    }
  }

  function render(filter = '') {
    tbl.innerHTML = '';
    maintenance.forEach((r, i) => {
      if (filter && !(`${r.appliance} ${r.issue} ${r.notes}`).toLowerCase().includes(filter.toLowerCase())) return;
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${r.appliance}</td><td>${fmt(r.date)}</td><td>${r.issue}</td><td>${r.notes || ''}</td><td><button data-act='edit' data-i='${i}' class='btn'>Edit</button> <button data-act='del' data-i='${i}' class='btn'>Delete</button></td>`;
      tbl.appendChild(tr);
    });
  }

  await loadAppliances();
  await loadMaintenance();
  search.addEventListener('input', e => render(e.target.value));
  btnAdd.addEventListener('click', () => openForm(-1));
  document.getElementById('close-modal').addEventListener('click', () => closeModal());

  function openForm(idx) {
    const isEdit = idx >= 0; const item = isEdit ? maintenance[idx] : { appliance: '', date: '', issue: '', notes: '' };
    document.getElementById('modal-title').textContent = isEdit ? 'Edit Maintenance' : 'Add Maintenance';
    mb.innerHTML = `<label>Appliance<select id='m-appliance'>${applianceNames.map(a => `<option${item.appliance === a ? ' selected' : ''}>${a}</option>`).join('')}</select></label><label>Date<input id='m-date' type='date' value='${item.date || ''}' /></label><label>Issue<input id='m-issue' value='${item.issue || ''}' /></label><label>Notes<input id='m-notes' value='${item.notes || ''}' /></label>`;
    document.getElementById('modal-footer').innerHTML = `<button id='save' class='btn primary'>Save</button> <button id='cancel' class='btn'>Cancel</button>`;

    document.getElementById('save').onclick = async () => {
      const appliance = document.getElementById('m-appliance').value;
      const date = document.getElementById('m-date').value;
      const issue = document.getElementById('m-issue').value.trim();
      const notes = document.getElementById('m-notes').value.trim();

      if (!appliance || !date || !issue) { alert('Please fill required fields'); return; }

      try {
        const data = {
          appliance_name: appliance,
          date,
          issue,
          notes: notes || null
        };

        if (isEdit) {
          await apiRequest(`/maintenance/${maintenance[idx].id}`, 'PUT', data);
        } else {
          await apiRequest('/maintenance', 'POST', data);
        }

        await loadMaintenance();
        closeModal();
      } catch (error) {
        alert('Failed to save maintenance record: ' + error.message);
      }
    };

    document.getElementById('cancel').onclick = () => closeModal();
    showModal();
  }

  function showModal() { modal.classList.remove('hidden'); } function closeModal() { modal.classList.add('hidden'); mb.innerHTML = ''; document.getElementById('modal-footer').innerHTML = ''; }

  tbl.addEventListener('click', async e => {
    const b = e.target;
    if (b.dataset.act === 'edit') openForm(Number(b.dataset.i));
    if (b.dataset.act === 'del') {
      if (confirm('Delete record?')) {
        try {
          await apiRequest(`/maintenance/${maintenance[Number(b.dataset.i)].id}`, 'DELETE');
          await loadMaintenance();
        } catch (error) {
          alert('Failed to delete maintenance record: ' + error.message);
        }
      }
    }
  });
});
