  // const input = document.getElementById('image');
  // const filePreview = document.getElementById('filePreview');
  // let selectedFiles = [];

  // input.addEventListener('change', function () {
  //   selectedFiles = Array.from(this.files);
  //   renderFiles();
  // });

  // function renderFiles() {
  //   filePreview.innerHTML = '';
  //   selectedFiles.forEach((file, index) => {
  //     const container = document.createElement('div');
  //     container.className = 'd-flex justify-content-between align-items-center border rounded px-3 py-2';

  //     const fileName = document.createElement('span');
  //     fileName.textContent = file.name;

  //     // const removeBtn = document.createElement('button');
  //     // removeBtn.className = 'btn btn-sm btn-outline-danger';
  //     // removeBtn.textContent = 'Remove';
  //     // removeBtn.onclick = () => {
  //     //   selectedFiles.splice(index, 1);
  //     //   renderFiles();
  //     //   updateInputFiles();
  //     // };

  //     container.appendChild(fileName);
  //     // container.appendChild(removeBtn);
  //     filePreview.appendChild(container);
  //   });
  // }

  // function updateInputFiles() {
  //   const dataTransfer = new DataTransfer();
  //   selectedFiles.forEach(file => dataTransfer.items.add(file));
  //   input.files = dataTransfer.files;
  // }