
document.addEventListener('DOMContentLoaded', async () => {
  const tbl = document.querySelector('#tbl-inv tbody'); const btnAdd = document.getElementById('btn-add'); const modal = document.getElementById('modal'); const mb = document.getElementById('modal-body');
  const search = document.getElementById('search-inv');

  let invoices = [];
  let applianceNames = [];

  // Load invoices from API
  async function loadInvoices() {
    try {
      const result = await apiRequest('/invoices', 'GET');
      invoices = result.data.map(inv => ({
        id: inv.id,
        appliance: inv.appliance,
        appliance_id: inv.appliance_id,
        number: inv.invoice_number,
        date: inv.date,
        amount: inv.amount,
        store: inv.store
      }));
      render();
    } catch (error) {
      alert('Failed to load invoices: ' + error.message);
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
    invoices.forEach((a, i) => {
      if (filter && !(`${a.appliance} ${a.number} ${a.store}`).toLowerCase().includes(filter.toLowerCase())) return;
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${a.appliance}</td><td>${a.number}</td><td>${fmt(a.date)}</td><td>${Number(a.amount).toFixed(2)}</td><td>${a.store}</td><td><button data-act='edit' data-i='${i}' class='btn'>Edit</button> <button data-act='del' data-i='${i}' class='btn'>Delete</button></td>`;
      tbl.appendChild(tr);
    });
  }

  await loadAppliances();
  await loadInvoices();
  search.addEventListener('input', e => render(e.target.value));
  btnAdd.addEventListener('click', () => openForm(-1));
  document.getElementById('close-modal').addEventListener('click', () => closeModal());

  function openForm(idx) {
    const isEdit = idx >= 0; const item = isEdit ? invoices[idx] : { appliance: '', number: '', date: '', amount: '', store: '' };
    document.getElementById('modal-title').textContent = isEdit ? 'Edit Invoice' : 'Add Invoice';
    mb.innerHTML = `<label>Appliance<select id='i-appliance'>${applianceNames.map(a => `<option${item.appliance === a ? ' selected' : ''}>${a}</option>`).join('')}</select></label><label>Invoice #<input id='i-number' value='${item.number || ''}' /></label><label>Date<input id='i-date' type='date' value='${item.date || ''}' /></label><label>Amount<input id='i-amount' type='number' step='0.01' value='${item.amount || ''}' /></label><label>Store<input id='i-store' value='${item.store || ''}' /></label>`;
    document.getElementById('modal-footer').innerHTML = `<button id='save' class='btn primary'>Save</button> <button id='cancel' class='btn'>Cancel</button>`;

    document.getElementById('save').onclick = async () => {
      const appliance = document.getElementById('i-appliance').value;
      const number = document.getElementById('i-number').value.trim();
      const date = document.getElementById('i-date').value;
      const amount = document.getElementById('i-amount').value;
      const store = document.getElementById('i-store').value.trim();

      if (!appliance || !number || !date || !amount || !store) { alert('Fill all fields'); return; }

      try {
        const data = {
          appliance_name: appliance,
          invoice_number: number,
          date,
          amount,
          store
        };

        if (isEdit) {
          await apiRequest(`/invoices/${invoices[idx].id}`, 'PUT', data);
        } else {
          await apiRequest('/invoices', 'POST', data);
        }

        await loadInvoices();
        closeModal();
      } catch (error) {
        alert('Failed to save invoice: ' + error.message);
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
      if (confirm('Delete invoice?')) {
        try {
          await apiRequest(`/invoices/${invoices[Number(b.dataset.i)].id}`, 'DELETE');
          await loadInvoices();
        } catch (error) {
          alert('Failed to delete invoice: ' + error.message);
        }
      }
    }
  });
});
