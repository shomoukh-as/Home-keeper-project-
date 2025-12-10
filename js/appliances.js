
document.addEventListener('DOMContentLoaded', async () => {
  const user = getCurrentUser(); if (!user) { window.location.href = 'index.html'; return; }
  const tbl = document.querySelector('#tbl tbody');
  const btnNew = document.getElementById('btn-new'); const modal = document.getElementById('modal'); const mb = document.getElementById('modal-body');
  const search = document.getElementById('search');

  let appliances = [];

  // Load appliances from API
  async function loadAppliances() {
    try {
      const result = await apiRequest('/appliances', 'GET');
      appliances = result.data.map(a => ({
        id: a.id,
        name: a.name,
        brand: a.brand,
        model: a.model,
        purchase: a.purchase_date,
        warrantyEnd: a.warranty_end
      }));
      render();
    } catch (error) {
      alert('Failed to load appliances: ' + error.message);
    }
  }

  function render(filter = '') {
    tbl.innerHTML = '';
    appliances.forEach((a, i) => {
      if (filter && !(`${a.name} ${a.brand} ${a.model}`).toLowerCase().includes(filter.toLowerCase())) return;
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${a.name}</td><td>${a.brand || ''}</td><td>${a.model || ''}</td><td>${fmt(a.purchase) || ''}</td><td>${fmt(a.warrantyEnd) || ''}</td><td><button class='btn' data-i='${i}' data-act='edit'>Edit</button> <button class='btn' data-i='${i}' data-act='del'>Delete</button></td>`;
      tbl.appendChild(tr);
    });
  }

  await loadAppliances();
  search.addEventListener('input', e => render(e.target.value));
  btnNew.addEventListener('click', () => openForm(-1));
  document.getElementById('close-modal').addEventListener('click', () => closeModal());

  function openForm(idx) {
    const isEdit = idx >= 0; const item = isEdit ? appliances[idx] : { name: '', brand: '', model: '', purchase: '', warrantyEnd: '' };
    document.getElementById('modal-title').textContent = isEdit ? 'Edit Appliance' : 'Add Appliance';
    mb.innerHTML = `<label>Name<input id='f-name' value='${item.name || ''}' /></label>
      <label>Brand<input id='f-brand' value='${item.brand || ''}' /></label>
      <label>Model<input id='f-model' value='${item.model || ''}' /></label>
      <label>Purchase date<input id='f-purchase' type='date' value='${item.purchase || ''}' /></label>
      <label>Warranty end<input id='f-wend' type='date' value='${item.warrantyEnd || ''}' /></label>`;
    document.getElementById('modal-footer').innerHTML = `<button class='btn primary' id='save'>Save</button> <button class='btn' id='cancel'>Cancel</button>`;

    document.getElementById('save').onclick = async () => {
      const name = document.getElementById('f-name').value.trim();
      const brand = document.getElementById('f-brand').value.trim();
      const model = document.getElementById('f-model').value.trim();
      const purchase = document.getElementById('f-purchase').value;
      const wend = document.getElementById('f-wend').value;

      if (!name || !purchase || !wend) { alert('Please fill name, purchase date and warranty end'); return; }

      try {
        const data = {
          name,
          brand: brand || null,
          model: model || null,
          purchase_date: purchase,
          warranty_end: wend
        };

        if (isEdit) {
          await apiRequest(`/appliances/${appliances[idx].id}`, 'PUT', data);
        } else {
          await apiRequest('/appliances', 'POST', data);
        }

        await loadAppliances();
        closeModal();
      } catch (error) {
        alert('Failed to save appliance: ' + error.message);
      }
    }

    document.getElementById('cancel').onclick = () => closeModal();
    showModal();
  }

  function showModal() { modal.classList.remove('hidden'); }
  function closeModal() { modal.classList.add('hidden'); document.getElementById('modal-body').innerHTML = ''; document.getElementById('modal-footer').innerHTML = ''; }

  tbl.addEventListener('click', async e => {
    const b = e.target;
    if (b.dataset.act === 'edit') openForm(Number(b.dataset.i));
    if (b.dataset.act === 'del') {
      if (confirm('Delete appliance?')) {
        try {
          await apiRequest(`/appliances/${appliances[Number(b.dataset.i)].id}`, 'DELETE');
          await loadAppliances();
        } catch (error) {
          alert('Failed to delete appliance: ' + error.message);
        }
      }
    }
  });
});
