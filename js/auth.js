
// registerUser returns {success,message}
async function registerUser(username, password) {
  username = (username || '').trim();
  if (!username || !password) return { success: false, message: 'Fill both fields' };

  try {
    const result = await apiRequest('/auth/register', 'POST', { username, password });
    return { success: true, message: result.message || 'Registered' };
  } catch (error) {
    return { success: false, message: error.message || 'Registration failed' };
  }
}

async function loginUser(username, password) {
  username = (username || '').trim();

  try {
    const result = await apiRequest('/auth/login', 'POST', { username, password });

    if (result.success && result.token) {
      setAuthToken(result.token);
      setCurrentUser({ username: result.user.username, id: result.user.id });
      return { success: true, message: 'Logged in' };
    }

    return { success: false, message: result.message || 'Login failed' };
  } catch (error) {
    return { success: false, message: error.message || 'Invalid username or password' };
  }
}

async function logoutCurrent() {
  try {
    await apiRequest('/auth/logout', 'POST');
  } catch (error) {
    console.error('Logout error:', error);
  }
  clearAuthToken();
  clearCurrentUser();
  window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', () => {
  // attach forms if exist
  const regForm = document.getElementById('register-form'); if (regForm) { regForm.addEventListener('submit', async e => { e.preventDefault(); const u = document.getElementById('reg-username').value; const p = document.getElementById('reg-password').value; const res = await registerUser(u, p); const msg = document.getElementById('reg-msg'); msg.textContent = res.message; if (res.success) { msg.classList.add('ok'); setTimeout(() => { document.getElementById('register-section').classList.add('hidden'); document.getElementById('login-section').classList.remove('hidden'); }, 700) } else msg.classList.remove('ok'); }) }
  const loginForm = document.getElementById('login-form'); if (loginForm) { loginForm.addEventListener('submit', async e => { e.preventDefault(); const u = document.getElementById('login-username').value; const p = document.getElementById('login-password').value; const res = await loginUser(u, p); const msg = document.getElementById('login-msg'); msg.textContent = res.message; if (res.success) { window.location.href = 'dashboard.html' } else msg.classList.add('err'); }) }
  // logout buttons
  const logoutButtons = document.querySelectorAll('#logout'); logoutButtons.forEach(b => b.addEventListener('click', () => { logoutCurrent() }));
});
