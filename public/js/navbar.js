const darkSwitch = document.getElementById('darkModeSwitch');

// Load previous preference
if (localStorage.getItem('darkMode') === 'enabled') {
  document.body.classList.add('dark-mode');
  darkSwitch.checked = true;
}

darkSwitch.addEventListener('change', () => {
  const isEnabled = darkSwitch.checked;

  document.body.classList.toggle('dark-mode', isEnabled);
  localStorage.setItem('darkMode', isEnabled ? 'enabled' : 'disabled');

  window.dispatchEvent(new Event('darkModeToggle'));
});
