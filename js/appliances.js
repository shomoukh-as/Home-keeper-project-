
document.addEventListener('DOMContentLoaded', async () => {
  const user = getCurrentUser();
  if (!user) { window.location.href = 'index.html'; return; }

  const tbl = document.querySelector('#tbl tbody');
  const btnNew = document.getElementById('btn-new');
  const btnExport = document.getElementById('btn-export');
  const modal = document.getElementById('modal');
  const mb = document.getElementById('modal-body');
  const search = document.getElementById('search');

  let appliances = [];
  let sortColumn = 'name';
  let sortDirection = 'asc';

  // Initialize modal utilities
  ModalUtils.initClickOutside(modal, closeModal);
  ModalUtils.initEscapeClose(modal, closeModal);

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
      ToastManager.error('Failed to load appliances: ' + error.message);
    }
  }

  function render(filter = '') {
    tbl.innerHTML = '';
    let filtered = appliances;

    // Apply search filter
    if (filter) {
      filtered = appliances.filter(a =>
        `${a.name} ${a.brand} ${a.model}`.toLowerCase().includes(filter.toLowerCase())
      );
    }

    // Apply sorting
    filtered = sortData(filtered, sortColumn, sortDirection);

    filtered.forEach((a, i) => {
      const originalIdx = appliances.findIndex(app => app.id === a.id);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${a.name}</td>
        <td>${a.brand || ''}</td>
        <td>${a.model || ''}</td>
        <td>${fmt(a.purchase) || ''}</td>
        <td>${fmt(a.warrantyEnd) || ''}</td>
        <td>
          <button class='btn' data-i='${originalIdx}' data-act='edit'>Edit</button>
          <button class='btn danger' data-i='${originalIdx}' data-act='del'>Delete</button>
        </td>`;
      tbl.appendChild(tr);
    });
  }

  await loadAppliances();

  // Search handler
  search.addEventListener('input', e => render(e.target.value));

  // Export handler
  if (btnExport) {
    btnExport.addEventListener('click', () => {
      const exportData = appliances.map(a => ({
        'Name': a.name,
        'Brand': a.brand || '',
        'Model': a.model || '',
        'Purchase Date': fmt(a.purchase) || '',
        'Warranty End': fmt(a.warrantyEnd) || ''
      }));
      exportToExcel(exportData, 'appliances', 'Appliances');
    });
  }

  // Sortable headers
  document.querySelectorAll('#tbl th.sortable').forEach(th => {
    th.addEventListener('click', () => {
      const column = th.dataset.column;

      // Toggle direction if same column
      if (sortColumn === column) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        sortColumn = column;
        sortDirection = 'asc';
      }

      // Update header classes
      document.querySelectorAll('#tbl th.sortable').forEach(h => {
        h.classList.remove('sort-asc', 'sort-desc');
      });
      th.classList.add(sortDirection === 'asc' ? 'sort-asc' : 'sort-desc');

      render(search.value);
    });
  });

  btnNew.addEventListener('click', () => openForm(-1));
  document.getElementById('close-modal').addEventListener('click', () => closeModal());

  function openForm(idx) {
    const isEdit = idx >= 0;
    const item = isEdit ? appliances[idx] : { name: '', brand: '', model: '', purchase: '', warrantyEnd: '' };

    document.getElementById('modal-title').textContent = isEdit ? 'Edit Appliance' : 'Add Appliance';
    mb.innerHTML = `
      <label>Name<input id='f-name' value='${item.name || ''}' placeholder='e.g., Refrigerator' /></label>
      <label>Brand<input id='f-brand' value='${item.brand || ''}' placeholder='e.g., Samsung' /></label>
      <label>Model<input id='f-model' value='${item.model || ''}' placeholder='e.g., RT21M6215' /></label>
      <label>Purchase Date<input id='f-purchase' type='date' value='${item.purchase || ''}' /></label>
      <label>Warranty End<input id='f-wend' type='date' value='${item.warrantyEnd || ''}' /></label>`;
    document.getElementById('modal-footer').innerHTML = `
      <button class='btn primary' id='save'>Save</button>
      <button class='btn' id='cancel'>Cancel</button>`;

    document.getElementById('save').onclick = async () => {
      const saveBtn = document.getElementById('save');

      // Clear previous errors
      FormValidator.clearErrors(mb);

      // Validate fields
      const isValid = FormValidator.validateForm(mb, {
        'f-name': { required: true, message: 'Name is required' },
        'f-purchase': { required: true, message: 'Purchase date is required' },
        'f-wend': { required: true, message: 'Warranty end date is required' }
      });

      if (!isValid) return;

      const name = document.getElementById('f-name').value.trim();
      const brand = document.getElementById('f-brand').value.trim();
      const model = document.getElementById('f-model').value.trim();
      const purchase = document.getElementById('f-purchase').value;
      const wend = document.getElementById('f-wend').value;

      try {
        ModalUtils.setButtonLoading(saveBtn, true);

        const data = {
          name,
          brand: brand || null,
          model: model || null,
          purchase_date: purchase,
          warranty_end: wend
        };

        if (isEdit) {
          await apiRequest(`/appliances/${appliances[idx].id}`, 'PUT', data);
          ToastManager.success('Appliance updated successfully');
        } else {
          await apiRequest('/appliances', 'POST', data);
          ToastManager.success('Appliance added successfully');
        }

        await loadAppliances();
        closeModal();
      } catch (error) {
        ToastManager.error('Failed to save appliance: ' + error.message);
        ModalUtils.setButtonLoading(saveBtn, false);
      }
    };

    document.getElementById('cancel').onclick = () => closeModal();
    showModal();
  }

  function showModal() { modal.classList.remove('hidden'); }
  function closeModal() {
    modal.classList.add('hidden');
    document.getElementById('modal-body').innerHTML = '';
    document.getElementById('modal-footer').innerHTML = '';
  }

  tbl.addEventListener('click', async e => {
    const b = e.target;
    if (b.dataset.act === 'edit') openForm(Number(b.dataset.i));
    if (b.dataset.act === 'del') {
      const idx = Number(b.dataset.i);
      const appliance = appliances[idx];

      // Store data for undo
      const applianceData = { ...appliance };
      const relatedWarranties = getResourceData('warranties').filter(w =>
        w.appliance_id === appliance.id || w.appliance === appliance.name
      );
      const relatedInvoices = getResourceData('invoices').filter(i =>
        i.appliance_id === appliance.id || i.appliance === appliance.name
      );
      const relatedMaintenance = getResourceData('maintenance').filter(m =>
        m.appliance_id === appliance.id || m.appliance === appliance.name
      );

      UndoManager.stageDelete(
        'Appliance',
        appliance.id,
        { applianceData, relatedWarranties, relatedInvoices, relatedMaintenance },
        async () => {
          // Delete callback
          try {
            await deleteApplianceWithCleanup(appliance.id, appliance.name);
            await loadAppliances();
          } catch (error) {
            ToastManager.error('Failed to delete: ' + error.message);
          }
        },
        async (data) => {
          // Restore callback
          try {
            // Restore appliance
            const appData = {
              name: data.applianceData.name,
              brand: data.applianceData.brand,
              model: data.applianceData.model,
              purchase_date: data.applianceData.purchase,
              warranty_end: data.applianceData.warrantyEnd
            };
            await apiRequest('/appliances', 'POST', appData);

            // Restore related records
            for (const w of data.relatedWarranties) {
              await apiRequest('/warranties', 'POST', {
                appliance_name: w.appliance,
                start_date: w.start,
                end_date: w.end
              });
            }
            for (const i of data.relatedInvoices) {
              await apiRequest('/invoices', 'POST', {
                appliance_name: i.appliance,
                invoice_number: i.number,
                date: i.date,
                amount: i.amount,
                store: i.store
              });
            }
            for (const m of data.relatedMaintenance) {
              await apiRequest('/maintenance', 'POST', {
                appliance_name: m.appliance,
                date: m.date,
                issue: m.issue,
                notes: m.notes
              });
            }

            await loadAppliances();
          } catch (error) {
            ToastManager.error('Failed to restore: ' + error.message);
          }
        }
      );
    }
  });
});
