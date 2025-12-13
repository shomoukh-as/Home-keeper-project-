
document.addEventListener('DOMContentLoaded', async () => {
  const user = getCurrentUser();
  if (!user) { window.location.href = 'index.html'; return; }

  const tbl = document.querySelector('#tbl-w tbody');
  const btnAdd = document.getElementById('btn-add-w');
  const btnExport = document.getElementById('btn-export');
  const modal = document.getElementById('modal');
  const mb = document.getElementById('modal-body');

  let warranties = [];
  let applianceNames = [];
  let sortColumn = 'appliance';
  let sortDirection = 'asc';
  let filterStatus = '';

  // Status filter handler
  const filterStatusEl = document.getElementById('filter-status');
  if (filterStatusEl) {
    filterStatusEl.addEventListener('change', () => {
      filterStatus = filterStatusEl.value;
      render();
    });
  }

  // Initialize modal utilities
  ModalUtils.initClickOutside(modal, closeModal);
  ModalUtils.initEscapeClose(modal, closeModal);

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
      ToastManager.error('Failed to load warranties: ' + error.message);
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

    // Apply status filter
    let filtered = warranties;
    if (filterStatus) {
      filtered = warranties.filter(w => {
        const days = daysBetween(w.end);
        if (filterStatus === 'safe') return days > 90;
        if (filterStatus === 'warning') return days >= 30 && days <= 90;
        if (filterStatus === 'danger') return days >= 0 && days < 30;
        if (filterStatus === 'expired') return days < 0;
        return true;
      });
    }

    // Apply sorting
    const sorted = sortData(filtered, sortColumn, sortDirection);

    sorted.forEach((w, i) => {
      const days = daysBetween(w.end);
      const originalIdx = warranties.findIndex(war => war.id === w.id);
      const statusClass = getWarrantyStatusClass(days);
      const badgeClass = getWarrantyBadgeClass(days);

      const tr = document.createElement('tr');
      tr.className = statusClass;

      let statusText = '';
      if (days < 0) {
        statusText = `<span class="warranty-badge ${badgeClass}">Expired</span>`;
      } else if (days <= 30) {
        statusText = `<span class="warranty-badge ${badgeClass}">${days} days - Urgent!</span>`;
      } else if (days <= 90) {
        statusText = `<span class="warranty-badge ${badgeClass}">${days} days</span>`;
      } else {
        statusText = `<span class="warranty-badge ${badgeClass}">${days} days</span>`;
      }

      tr.innerHTML = `
        <td>${w.appliance}</td>
        <td>${fmt(w.start)}</td>
        <td>${fmt(w.end)}</td>
        <td>${statusText}</td>
        <td>
          <button data-act='edit' data-i='${originalIdx}' class='btn'>Edit</button>
          <button data-act='del' data-i='${originalIdx}' class='btn danger'>Delete</button>
        </td>`;
      tbl.appendChild(tr);
    });
  }

  await loadAppliances();
  await loadWarranties();

  // Export handler
  if (btnExport) {
    btnExport.addEventListener('click', () => {
      const exportData = warranties.map(w => {
        const days = daysBetween(w.end);
        return {
          'Appliance': w.appliance,
          'Start Date': fmt(w.start),
          'End Date': fmt(w.end),
          'Days Remaining': days < 0 ? 'Expired' : days,
          'Status': days < 0 ? 'Expired' : days <= 30 ? 'Critical' : days <= 90 ? 'Warning' : 'Active'
        };
      });
      exportToExcel(exportData, 'warranties', 'Warranties');
    });
  }

  // Sortable headers
  document.querySelectorAll('#tbl-w th.sortable').forEach(th => {
    th.addEventListener('click', () => {
      const column = th.dataset.column;

      if (sortColumn === column) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        sortColumn = column;
        sortDirection = 'asc';
      }

      document.querySelectorAll('#tbl-w th.sortable').forEach(h => {
        h.classList.remove('sort-asc', 'sort-desc');
      });
      th.classList.add(sortDirection === 'asc' ? 'sort-asc' : 'sort-desc');

      render();
    });
  });

  btnAdd.addEventListener('click', () => openForm(-1));
  document.getElementById('close-modal').addEventListener('click', () => closeModal());

  function openForm(idx) {
    const isEdit = idx >= 0;
    const item = isEdit ? warranties[idx] : { appliance: '', start: '', end: '' };

    document.getElementById('modal-title').textContent = isEdit ? 'Edit Warranty' : 'Add Warranty';
    mb.innerHTML = `
      <label>Appliance
        <select id='w-appliance'>
          <option value=''>Select an appliance</option>
          ${applianceNames.map(a => `<option${item.appliance === a ? ' selected' : ''}>${a}</option>`).join('')}
        </select>
      </label>
      <label>Start Date<input id='w-start' type='date' value='${item.start || ''}' /></label>
      <label>End Date<input id='w-end' type='date' value='${item.end || ''}' /></label>`;
    document.getElementById('modal-footer').innerHTML = `
      <button id='save' class='btn primary'>Save</button>
      <button id='cancel' class='btn'>Cancel</button>`;

    document.getElementById('save').onclick = async () => {
      const saveBtn = document.getElementById('save');

      FormValidator.clearErrors(mb);

      const isValid = FormValidator.validateForm(mb, {
        'w-appliance': { required: true, message: 'Please select an appliance' },
        'w-start': { required: true, message: 'Start date is required' },
        'w-end': { required: true, message: 'End date is required' }
      });

      if (!isValid) return;

      const appliance = document.getElementById('w-appliance').value;
      const start = document.getElementById('w-start').value;
      const end = document.getElementById('w-end').value;

      try {
        ModalUtils.setButtonLoading(saveBtn, true);

        const data = {
          appliance_name: appliance,
          start_date: start,
          end_date: end
        };

        if (isEdit) {
          await apiRequest(`/warranties/${warranties[idx].id}`, 'PUT', data);
          ToastManager.success('Warranty updated successfully');
        } else {
          await apiRequest('/warranties', 'POST', data);
          ToastManager.success('Warranty added successfully');
        }

        await loadWarranties();
        closeModal();
      } catch (error) {
        ToastManager.error('Failed to save warranty: ' + error.message);
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
      const warranty = warranties[idx];

      UndoManager.stageDelete(
        'Warranty',
        warranty.id,
        { ...warranty },
        async () => {
          try {
            await apiRequest(`/warranties/${warranty.id}`, 'DELETE');
            await loadWarranties();
          } catch (error) {
            ToastManager.error('Failed to delete: ' + error.message);
          }
        },
        async (data) => {
          try {
            await apiRequest('/warranties', 'POST', {
              appliance_name: data.appliance,
              start_date: data.start,
              end_date: data.end
            });
            await loadWarranties();
          } catch (error) {
            ToastManager.error('Failed to restore: ' + error.message);
          }
        }
      );
    }
  });
});
