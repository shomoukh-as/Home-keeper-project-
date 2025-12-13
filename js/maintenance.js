
document.addEventListener('DOMContentLoaded', async () => {
  const user = getCurrentUser();
  if (!user) { window.location.href = 'index.html'; return; }

  const tbl = document.querySelector('#tbl-m tbody');
  const btnAdd = document.getElementById('btn-add-m');
  const btnExport = document.getElementById('btn-export');
  const modal = document.getElementById('modal');
  const mb = document.getElementById('modal-body');
  const search = document.getElementById('search-m');

  let maintenance = [];
  let applianceNames = [];
  let sortColumn = 'date';
  let sortDirection = 'desc';

  // Initialize modal utilities
  ModalUtils.initClickOutside(modal, closeModal);
  ModalUtils.initEscapeClose(modal, closeModal);

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
      ToastManager.error('Failed to load maintenance records: ' + error.message);
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
    let filtered = maintenance;

    // Apply search filter
    if (filter) {
      filtered = maintenance.filter(r =>
        `${r.appliance} ${r.issue} ${r.notes}`.toLowerCase().includes(filter.toLowerCase())
      );
    }

    // Apply sorting
    filtered = sortData(filtered, sortColumn, sortDirection);

    filtered.forEach((r, i) => {
      const originalIdx = maintenance.findIndex(m => m.id === r.id);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${r.appliance}</td>
        <td>${fmt(r.date)}</td>
        <td>${r.issue}</td>
        <td>${r.notes || ''}</td>
        <td>
          <button data-act='edit' data-i='${originalIdx}' class='btn'>Edit</button>
          <button data-act='del' data-i='${originalIdx}' class='btn danger'>Delete</button>
        </td>`;
      tbl.appendChild(tr);
    });
  }

  await loadAppliances();
  await loadMaintenance();

  // Search handler
  search.addEventListener('input', e => render(e.target.value));

  // Export handler
  if (btnExport) {
    btnExport.addEventListener('click', () => {
      const exportData = maintenance.map(m => ({
        'Appliance': m.appliance,
        'Date': fmt(m.date),
        'Issue': m.issue,
        'Notes': m.notes || ''
      }));
      exportToExcel(exportData, 'maintenance', 'Maintenance');
    });
  }

  // Sortable headers
  document.querySelectorAll('#tbl-m th.sortable').forEach(th => {
    th.addEventListener('click', () => {
      const column = th.dataset.column;

      if (sortColumn === column) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        sortColumn = column;
        sortDirection = 'asc';
      }

      document.querySelectorAll('#tbl-m th.sortable').forEach(h => {
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
    const item = isEdit ? maintenance[idx] : { appliance: '', date: '', issue: '', notes: '' };

    document.getElementById('modal-title').textContent = isEdit ? 'Edit Maintenance' : 'Add Maintenance';
    mb.innerHTML = `
      <label>Appliance
        <select id='m-appliance'>
          <option value=''>Select an appliance</option>
          ${applianceNames.map(a => `<option${item.appliance === a ? ' selected' : ''}>${a}</option>`).join('')}
        </select>
      </label>
      <label>Date<input id='m-date' type='date' value='${item.date || ''}' /></label>
      <label>Issue<input id='m-issue' value='${item.issue || ''}' placeholder='e.g., Filter replacement' /></label>
      <label>Notes<textarea id='m-notes' rows='3' placeholder='Additional details...'>${item.notes || ''}</textarea></label>`;
    document.getElementById('modal-footer').innerHTML = `
      <button id='save' class='btn primary'>Save</button>
      <button id='cancel' class='btn'>Cancel</button>`;

    document.getElementById('save').onclick = async () => {
      const saveBtn = document.getElementById('save');

      FormValidator.clearErrors(mb);

      const isValid = FormValidator.validateForm(mb, {
        'm-appliance': { required: true, message: 'Please select an appliance' },
        'm-date': { required: true, message: 'Date is required' },
        'm-issue': { required: true, message: 'Issue description is required' }
      });

      if (!isValid) return;

      const appliance = document.getElementById('m-appliance').value;
      const date = document.getElementById('m-date').value;
      const issue = document.getElementById('m-issue').value.trim();
      const notes = document.getElementById('m-notes').value.trim();

      try {
        ModalUtils.setButtonLoading(saveBtn, true);

        const data = {
          appliance_name: appliance,
          date,
          issue,
          notes: notes || null
        };

        if (isEdit) {
          await apiRequest(`/maintenance/${maintenance[idx].id}`, 'PUT', data);
          ToastManager.success('Maintenance record updated successfully');
        } else {
          await apiRequest('/maintenance', 'POST', data);
          ToastManager.success('Maintenance record added successfully');
        }

        await loadMaintenance();
        closeModal();
      } catch (error) {
        ToastManager.error('Failed to save maintenance record: ' + error.message);
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
      const record = maintenance[idx];

      UndoManager.stageDelete(
        'Maintenance Record',
        record.id,
        { ...record },
        async () => {
          try {
            await apiRequest(`/maintenance/${record.id}`, 'DELETE');
            await loadMaintenance();
          } catch (error) {
            ToastManager.error('Failed to delete: ' + error.message);
          }
        },
        async (data) => {
          try {
            await apiRequest('/maintenance', 'POST', {
              appliance_name: data.appliance,
              date: data.date,
              issue: data.issue,
              notes: data.notes
            });
            await loadMaintenance();
          } catch (error) {
            ToastManager.error('Failed to restore: ' + error.message);
          }
        }
      );
    }
  });
});
