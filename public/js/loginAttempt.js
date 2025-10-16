document.addEventListener("DOMContentLoaded", () => {
  if (window.appData && window.appData.error) {
    const errorText = window.appData.error || "An unknown error occurred.";
    const errorMessageBody = document.getElementById("errorMessageBody");
    if (errorMessageBody) {
      errorMessageBody.innerText = errorText;
      const myModal = new bootstrap.Modal(document.getElementById("errorModal"));
      myModal.show();
    }
  }
});
