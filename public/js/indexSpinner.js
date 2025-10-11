const loadMoreBtn = document.getElementById('loadMoreBtn');
const btnText = document.getElementById('btnText');
const btnSpinner = document.getElementById('btnSpinner');
const campgroundList = document.getElementById('campground-list');
const endText = document.getElementById('endText');

loadMoreBtn.addEventListener('click', async () => {
  let page = parseInt(loadMoreBtn.dataset.page) + 1;

  // Show spinner and disable button
  btnSpinner.style.display = 'inline-block';
  loadMoreBtn.disabled = true;

  try {
    // Optional
    // await new Promise(resolve => setTimeout(resolve, 3000));

    const res = await fetch(`/campgrounds?page=${page}`, {
      headers: { 'Accept': 'application/json' }
    });
    const campgrounds = await res.json();

    if (!campgrounds.length) {
      endText.style.display = 'block';
      loadMoreBtn.style.display = 'none';
      return;
    }

    // Append new campgrounds
for (let campground of campgrounds) {
  const cardCol = document.createElement('div');
  cardCol.className = 'mb-2 col-12 col-sm-10 col-lg-8';

  const card = document.createElement('div');
  card.className = 'card';

  card.innerHTML = `
    <div class="card-body">
      <h5 class="card-title">${campground.title}</h5>
      <p class="card-text">${campground.description}</p>
      <p class="card-text"><small>${campground.location}</small></p>
    </div>

    <div class="campground-image-wrapper bg-dark">
      <img src="${campground.images?.[0]?.url || '/images/default.jpg'}" class="campground-img" alt="Campground image">
    </div>

    <div class="d-flex justify-content-center p-5">
      <a href="/campgrounds/${campground._id}" class="btn btn-outline-primary w-50 shadow-sm">View</a>
    </div>
  `;

  cardCol.appendChild(card);
  campgroundList.appendChild(cardCol);
}

    loadMoreBtn.dataset.page = page;
  } catch (err) {
    console.error('Failed to load more campgrounds:', err);
  } finally {
    // Hide spinner and enable button again
    btnSpinner.style.display = 'none';
    loadMoreBtn.disabled = false;
  }
});
