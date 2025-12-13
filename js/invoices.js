
document.addEventListener('DOMContentLoaded', async () => {
  const user = getCurrentUser();
  if (!user) { window.location.href = 'index.html'; return; }

  const tbl = document.querySelector('#tbl-inv tbody');
  const btnAdd = document.getElementById('btn-add');
  const btnExport = document.getElementById('btn-export');
  const modal = document.getElementById('modal');
  const mb = document.getElementById('modal-body');
  const search = document.getElementById('search-inv');

  let invoices = [];
  let applianceNames = [];
  let sortColumn = 'date';
  let sortDirection = 'desc';

  // Initialize modal utilities
  ModalUtils.initClickOutside(modal, closeModal);
  ModalUtils.initEscapeClose(modal, closeModal);

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
      ToastManager.error('Failed to load invoices: ' + error.message);
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
    let filtered = invoices;

    // Apply search filter
    if (filter) {
      filtered = invoices.filter(a =>
        `${a.appliance} ${a.number} ${a.store}`.toLowerCase().includes(filter.toLowerCase())
      );
    }

    // Apply sorting
    filtered = sortData(filtered, sortColumn, sortDirection);

    // Calculate total
    const total = filtered.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0);
    updateTotalDisplay(total);

    filtered.forEach((a, i) => {
      const originalIdx = invoices.findIndex(inv => inv.id === a.id);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${a.appliance}</td>
        <td>${a.number}</td>
        <td>${fmt(a.date)}</td>
        <td>$${Number(a.amount).toFixed(2)}</td>
        <td>${a.store}</td>
        <td>
          <button data-act='edit' data-i='${originalIdx}' class='btn'>Edit</button>
          <button data-act='del' data-i='${originalIdx}' class='btn danger'>Delete</button>
        </td>`;
      tbl.appendChild(tr);
    });
  }

  function updateTotalDisplay(total) {
    const totalEl = document.getElementById('total-amount');
    if (totalEl) {
      totalEl.textContent = `$${total.toFixed(2)}`;
    }
  }

  await loadAppliances();
  await loadInvoices();

  // Search handler
  search.addEventListener('input', e => render(e.target.value));

  // Export handler
  if (btnExport) {
    btnExport.addEventListener('click', () => {
      const exportData = invoices.map(inv => ({
        'Appliance': inv.appliance,
        'Invoice Number': inv.number,
        'Date': fmt(inv.date),
        'Amount': Number(inv.amount).toFixed(2),
        'Store': inv.store
      }));
      exportToExcel(exportData, 'invoices', 'Invoices');
    });
  }

  // Sortable headers
  document.querySelectorAll('#tbl-inv th.sortable').forEach(th => {
    th.addEventListener('click', () => {
      const column = th.dataset.column;

      if (sortColumn === column) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        sortColumn = column;
        sortDirection = 'asc';
      }

      document.querySelectorAll('#tbl-inv th.sortable').forEach(h => {
        h.classList.remove('sort-asc', 'sort-desc');
      });
      th.classList.add(sortDirection === 'asc' ? 'sort-asc' : 'sort-desc');

      render(search.value);
    });
  });

  btnAdd.addEventListener('click', () => openForm(-1));
  document.getElementById('close-modal').addEventListener('click', () => closeModal());

  function openForm(idx) {
    const isEdit = idx >= 0;
    const item = isEdit ? invoices[idx] : { appliance: '', number: '', date: '', amount: '', store: '' };

    document.getElementById('modal-title').textContent = isEdit ? 'Edit Invoice' : 'Add Invoice';
    mb.innerHTML = `
      <label>Appliance
        <select id='i-appliance'>
          <option value=''>Select an appliance</option>
          ${applianceNames.map(a => `<option${item.appliance === a ? ' selected' : ''}>${a}</option>`).join('')}
        </select>
      </label>
      <label>Invoice #<input id='i-number' value='${item.number || ''}' placeholder='e.g., INV-001' /></label>
      <label>Date<input id='i-date' type='date' value='${item.date || ''}' /></label>
      <label>Amount<input id='i-amount' type='number' step='0.01' value='${item.amount || ''}' placeholder='0.00' /></label>
      <label>Store<input id='i-store' value='${item.store || ''}' placeholder='e.g., Best Buy' /></label>`;
    document.getElementById('modal-footer').innerHTML = `
      <button id='save' class='btn primary'>Save</button>
      <button id='cancel' class='btn'>Cancel</button>`;

    document.getElementById('save').onclick = async () => {
      const saveBtn = document.getElementById('save');

      FormValidator.clearErrors(mb);

      const isValid = FormValidator.validateForm(mb, {
        'i-appliance': { required: true, message: 'Please select an appliance' },
        'i-number': { required: true, message: 'Invoice number is required' },
        'i-date': { required: true, message: 'Date is required' },
        'i-amount': { required: true, message: 'Amount is required' },
        'i-store': { required: true, message: 'Store is required' }
      });

      if (!isValid) return;

      const appliance = document.getElementById('i-appliance').value;
      const number = document.getElementById('i-number').value.trim();
      const date = document.getElementById('i-date').value;
      const amount = document.getElementById('i-amount').value;
      const store = document.getElementById('i-store').value.trim();

      try {
        ModalUtils.setButtonLoading(saveBtn, true);

        const data = {
          appliance_name: appliance,
          invoice_number: number,
          date,
          amount,
          store
        };

        if (isEdit) {
          await apiRequest(`/invoices/${invoices[idx].id}`, 'PUT', data);
          ToastManager.success('Invoice updated successfully');
        } else {
          await apiRequest('/invoices', 'POST', data);
          ToastManager.success('Invoice added successfully');
        }

        await loadInvoices();
        closeModal();
      } catch (error) {
        ToastManager.error('Failed to save invoice: ' + error.message);
        ModalUtils.setButtonLoading(saveBtn, false);
      }
    };

    document.getElementById('cancel').onclick = () => closeModal();
    showModal();
  }

  function showModal() { modal.classList.remove('hidden'); }
  function closeModal() {
    modal.classList.add('hidden');
    mb.innerHTML = '';
    document.getElementById('modal-footer').innerHTML = '';
  }

  tbl.addEventListener('click', async e => {
    const b = e.target;
    if (b.dataset.act === 'edit') openForm(Number(b.dataset.i));
    if (b.dataset.act === 'del') {
      const idx = Number(b.dataset.i);
      const invoice = invoices[idx];

      UndoManager.stageDelete(
        'Invoice',
        invoice.id,
        { ...invoice },
        async () => {
          try {
            await apiRequest(`/invoices/${invoice.id}`, 'DELETE');
            await loadInvoices();
          } catch (error) {
            ToastManager.error('Failed to delete: ' + error.message);
          }
        },
        async (data) => {
          try {
            await apiRequest('/invoices', 'POST', {
              appliance_name: data.appliance,
              invoice_number: data.number,
              date: data.date,
              amount: data.amount,
              store: data.store
            });
            await loadInvoices();
          } catch (error) {
            ToastManager.error('Failed to restore: ' + error.message);
          }
        }
      );
    }
  });
});
