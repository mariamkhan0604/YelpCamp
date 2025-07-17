document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // Initialize custom file input (if using bsCustomFileInput for BS4 only)
  if (typeof bsCustomFileInput !== 'undefined') {
    bsCustomFileInput.init();
  }

  // Custom validation
  const forms = document.querySelectorAll('.validated-form');
  Array.from(forms).forEach(function (form) {
    form.addEventListener('submit', function (event) {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      form.classList.add('was-validated');
    }, false);
  });

  // Show selected file names
  const fileInput = document.getElementById('image');
  const fileNamesContainer = document.getElementById('file-names');

  if (fileInput && fileNamesContainer) {
    fileInput.addEventListener('change', () => {
      const files = Array.from(fileInput.files);
      if (files.length) {
        const names = files.map(file => file.name).join(', ');
        fileNamesContainer.textContent = `Selected: ${names}`;
      } else {
        fileNamesContainer.textContent = '';
      }
    });
  }
});
