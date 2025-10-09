// '<%-process.env.MAPBOX_TOKEN%>' this wont work on js file, as it will
//treat it as css, in ejs file require the token then pass the variable
//here in js
  mapboxgl.accessToken = mapToken;
  const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v12', // style URL
    center: campground.geometry.coordinates, // starting position [lng, lat]
    zoom: 12, // starting zoom
  });

     map.addControl(new mapboxgl.NavigationControl());

  new mapboxgl.Marker()
  .setLngLat(campground.geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup({offset: 25})
    .setHTML(
      `<h3>${campground.title}</h3> <p>${campground.location}</p>`
    )
  )
  .addTo(map)