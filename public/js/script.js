    const form = document.querySelector("form");
    const priceInput = document.getElementById("price");

    form.addEventListener("submit", (e) => {
      const value = priceInput.value;

      // Check: is the value NOT a number (or empty)?
      if (!/^\d+$/.test(value)) {
        e.preventDefault(); // stop form from submitting
        alert("Only numbers are allowed!");
      }
    });