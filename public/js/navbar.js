
  const darkSwitch = document.getElementById('darkModeSwitch');

  // Load previous preference
  if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    darkSwitch.checked = true;
  }

  darkSwitch.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode', darkSwitch.checked);
    localStorage.setItem('darkMode', darkSwitch.checked ? 'enabled' : 'disabled');
  });

