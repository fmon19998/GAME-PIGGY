(() => {
  'use strict';

  const form = document.querySelector('#loginForm');
  const emailInput = document.querySelector('#emailInput');
  const guestBtn = document.querySelector('#guestBtn');
  const statusText = document.querySelector('#statusText');
  const primaryButton = form?.querySelector('.primary-button');

  function setStatus(message, error = false) {
    statusText.textContent = message;
    const box = statusText.closest('.status-box');
    const dot = box?.querySelector('.status-dot');
    if (dot) {
      dot.style.background = error ? '#ff725f' : '#64d86d';
      dot.style.boxShadow = error
        ? '0 0 10px rgba(255,114,95,.72)'
        : '0 0 10px rgba(100,216,109,.72)';
    }
  }

  function saveProfile(email, name) {
    const profile = {
      uid: `local-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      email: email || null,
      displayName: name,
      demo: true
    };

    try {
      localStorage.setItem('piggyGoldProfile', JSON.stringify(profile));
    } catch {
      try {
        sessionStorage.setItem('piggyGoldProfile', JSON.stringify(profile));
      } catch {
        // Tetap lanjut sebagai tamu bila penyimpanan browser tidak tersedia.
      }
    }

    window.setTimeout(() => {
      window.location.href = 'game.html';
    }, 360);
  }

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = emailInput.value.trim();

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setStatus('Masukkan email yang valid terlebih dahulu.', true);
      emailInput.focus();
      emailInput.animate([
        { transform: 'translateX(0)' },
        { transform: 'translateX(-5px)' },
        { transform: 'translateX(5px)' },
        { transform: 'translateX(0)' }
      ], { duration: 240, easing: 'ease-out' });
      return;
    }

    primaryButton?.classList.add('is-loading');
    setStatus('Menyiapkan arena permainan...');
    saveProfile(email, email.split('@')[0]);
  });

  guestBtn?.addEventListener('click', () => {
    guestBtn.disabled = true;
    setStatus('Membuka mode tamu...');
    saveProfile(null, 'Pemain Tamu');
  });

  try {
    const raw = localStorage.getItem('piggyGoldProfile') || sessionStorage.getItem('piggyGoldProfile');
    const existing = JSON.parse(raw || 'null');
    if (existing?.email) {
      emailInput.value = existing.email;
      setStatus('Profil sebelumnya ditemukan. Siap masuk kembali.');
    } else if (existing) {
      setStatus('Profil tamu sebelumnya ditemukan.');
    }
  } catch {
    // Penyimpanan browser bersifat opsional.
  }
})();
