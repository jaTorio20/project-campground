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
      cardCol.className = 'mb-3 col-12 col-sm-10 col-lg-6';

      const card = document.createElement('div');
      card.className = 'card card-index border-0 h-100';

      const authorName = campground.author?.username || 'Unknown';
      const authorAvatar = campground.author?.avatar?.url || '/images/default-profile-icon.png';
      const createdAt = campground.createdAt
        ? moment(campground.createdAt).tz('Asia/Manila').format('MMMM D, YYYY, h:mm A')
        : '';

      card.innerHTML = `
        <div class="card-body">
          <div class="d-flex align-items-center">
            <img src="${authorAvatar}" class="rounded-circle border border-1 border-tertiary uploadAvatarImg" alt="Author avatar">
            <div class="ms-2">
              <span class="fw-semibold">${authorName}</span><br>
              <small class="text-muted">Created on: ${createdAt}</small>
            </div>
          </div>

          <h5 class="card-title mt-3">${campground.title}</h5>
          <p class="card-text mb-1"><small><strong>Location:</strong> ${campground.location}</small></p>
          <p class="card-text text-muted">${campground.description}</p>
        </div>

        <div class="campground-image-wrapper">
          <img src="${campground.images?.[0]?.url || '/images/default.jpg'}" class="campground-img rounded-bottom" alt="Campground image">
        </div>

        <div class="d-flex justify-content-center pb-4 mt-4">
          <a href="/campgrounds/${campground._id}" class="btn btn-outline-primary w-50">View</a>
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
