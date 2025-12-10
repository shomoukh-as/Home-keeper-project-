
document.addEventListener('DOMContentLoaded', async () => {
  const tbl = document.querySelector('#tbl-w tbody'); const btnAdd = document.getElementById('btn-add-w'); const modal = document.getElementById('modal'); const mb = document.getElementById('modal-body');

  let warranties = [];
  let applianceNames = [];

  // Load warranties from API
  async function loadWarranties() {
    try {
      const result = await apiRequest('/warranties', 'GET');
      warranties = result.data.map(w => ({
        id: w.id,
        appliance: w.appliance,
        appliance_id: w.appliance_id,
        start: w.start_date,
        end: w.end_date
      }));
      render();
    } catch (error) {
      alert('Failed to load warranties: ' + error.message);
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

  function render() {
    tbl.innerHTML = '';
    warranties.forEach((w, i) => {
      const days = daysBetween(w.end);
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${w.appliance}</td><td>${fmt(w.start)}</td><td>${fmt(w.end)}</td><td>${days >= 0 ? days + ' days' : 'expired'}</td><td><button data-act='edit' data-i='${i}' class='btn'>Edit</button> <button data-act='del' data-i='${i}' class='btn'>Delete</button></td>`;
      tbl.appendChild(tr);
    });
  }

  await loadAppliances();
  await loadWarranties();
  btnAdd.addEventListener('click', () => openForm(-1));
  document.getElementById('close-modal').addEventListener('click', () => closeModal());

  function openForm(idx) {
    const isEdit = idx >= 0; const item = isEdit ? warranties[idx] : { appliance: '', start: '', end: '' };
    document.getElementById('modal-title').textContent = isEdit ? 'Edit Warranty' : 'Add Warranty';
    mb.innerHTML = `<label>Appliance<select id='w-appliance'>${applianceNames.map(a => `<option${item.appliance === a ? ' selected' : ''}>${a}</option>`).join('')}</select></label><label>Start<input id='w-start' type='date' value='${item.start || ''}' /></label><label>End<input id='w-end' type='date' value='${item.end || ''}' /></label>`;
    document.getElementById('modal-footer').innerHTML = `<button id='save' class='btn primary'>Save</button> <button id='cancel' class='btn'>Cancel</button>`;

    document.getElementById('save').onclick = async () => {
      const appliance = document.getElementById('w-appliance').value;
      const start = document.getElementById('w-start').value;
      const end = document.getElementById('w-end').value;

      if (!appliance || !start || !end) { alert('Fill fields'); return; }

      try {
        const data = {
          appliance_name: appliance,
          start_date: start,
          end_date: end
        };

        if (isEdit) {
          await apiRequest(`/warranties/${warranties[idx].id}`, 'PUT', data);
        } else {
          await apiRequest('/warranties', 'POST', data);
        }

        await loadWarranties();
        closeModal();
      } catch (error) {
        alert('Failed to save warranty: ' + error.message);
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
      if (confirm('Delete warranty?')) {
        try {
          await apiRequest(`/warranties/${warranties[Number(b.dataset.i)].id}`, 'DELETE');
          await loadWarranties();
        } catch (error) {
          alert('Failed to delete warranty: ' + error.message);
        }
      }
    }
  });
});
