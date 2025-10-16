//  const form = document.getElementById('signupForm');
  const passwordInput = document.getElementById('password');
  const feedback = document.getElementById('passwordFeedback');

  const username = document.getElementById('username');
  const usernameFeedback = document.getElementById('usernameFeedback');

  // form.addEventListener('submit', (e) => {
  //   const val = passwordInput.value;
  //   let valid = true;
  //   let message = '';

  //   if (val.length < 8) { valid = false; message += ' At least 8 characters<br>'; }
  //   if (!/[A-Z]/.test(val)) { valid = false; message += ' At least 1 uppercase letter<br>'; }
  //   if (!/[a-z]/.test(val)) { valid = false; message += ' At least 1 lowercase letter<br>'; }
  //   if (!/[0-9]/.test(val)) { valid = false; message += ' At least 1 number<br>'; }

  //   if (!valid) {
  //     e.preventDefault(); // Prevent the form submission
  //     feedback.innerHTML = message; // Update feedback message
  //     passwordInput.classList.add('is-invalid');
  //     passwordInput.classList.remove('is-valid');
  //   } else {
  //     passwordInput.classList.remove('is-invalid');
  //     passwordInput.classList.add('is-valid');
  //   }
  // });

  //real-time typing error for feedback
  passwordInput.addEventListener('input', () => {
    const val = passwordInput.value;
    let valid = true;
    let message = '';

    if (val.length < 8) { valid = false; message += ' At least 8 characters<br>'; }
    if (val.length > 30) { valid = false; message += ' Max 30 characters are only allowed<br>'; }
    if (!/[A-Z]/.test(val)) { valid = false; message += ' At least 1 uppercase letter<br>'; }
    if (!/[a-z]/.test(val)) { valid = false; message += ' At least 1 lowercase letter<br>'; }
    if (!/[0-9]/.test(val)) { valid = false; message += ' At least 1 number<br>'; }

    if (!valid) {
      feedback.innerHTML = message;
      passwordInput.classList.add('is-invalid');
      passwordInput.classList.remove('is-valid');
    } else {
      feedback.innerHTML = '';
      passwordInput.classList.remove('is-invalid');
      passwordInput.classList.add('is-valid');
    }
  });

  username.addEventListener('input', () => {
    const val = username.value;
    let valid = true;
    let message = '';

    if (!/^\S+$/.test(val)) { valid = false; message += 'Username does not contain spaces <br>'; }
    if (val.length < 5) { valid = false; message += ' At least 5 characters<br>'; }
    if (val.length > 30) { valid = false; message += ' Max 30 characters are only allowed<br>'; }

    if (!valid) {
      usernameFeedback.innerHTML = message;
      username.classList.add('is-invalid');
      username.classList.remove('is-valid');
    } else {
      usernameFeedback.innerHTML = '';
      username.classList.remove('is-invalid');
      username.classList.add('is-valid');
    }
  });