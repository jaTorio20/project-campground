(() => {
  'use strict';

  const form = document.querySelector('.validated-form');
  const password = form.querySelector('#password');
  const passwordConfirmation = form.querySelector('#passwordConfirmation');

  form.addEventListener('submit', (event) => {
    if (password.value !== passwordConfirmation.value) {
      event.preventDefault();
      event.stopPropagation();

      passwordConfirmation.classList.add('is-invalid');
      passwordConfirmation.classList.remove('is-valid');
    } else {
      passwordConfirmation.classList.remove('is-invalid');
      passwordConfirmation.classList.add('is-valid');
    }

    form.classList.add('was-validated');
  });
})();