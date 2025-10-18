mapboxgl.accessToken = mapToken;

// function getMapThemeConfig() {
//   const mode = localStorage.getItem('darkMode');
//   const isEnabled = mode === 'enabled';
//   return {
//     basemap: {
//       theme: isEnabled ? 'cool' : 'default',
//       lightPreset: isEnabled ? 'night' : 'day'
//     }
//   };
// }

const map = new mapboxgl.Map({
  container: 'cluster-map',
  style:
    localStorage.getItem('darkMode') === 'enabled'
      ? 'mapbox://styles/mapbox/dark-v11'
      : 'mapbox://styles/mapbox/light-v11',
  center: [122.5106, 12.4908],
  zoom: 4.5
});

map.addControl(new mapboxgl.NavigationControl());

// function to add cluster layers & interactions
function addClusterLayers() {
  map.addSource('campgrounds', {
    type: 'geojson',
    generateId: true,
    data: campgrounds,
    cluster: true,
    clusterMaxZoom: 14,
    clusterRadius: 50
  });

  map.addLayer({
    id: 'clusters',
    type: 'circle',
    source: 'campgrounds',
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': [
        'step',
        ['get', 'point_count'],
        '#51bbd6',
        15,
        '#f1f075',
        30,
        '#f28cb1'
      ],
      'circle-radius': [
        'step',
        ['get', 'point_count'],
        12,
        10,
        18,
        30,
        23
      ],
      'circle-emissive-strength': 1
    }
  });

  map.addLayer({
    id: 'cluster-count',
    type: 'symbol',
    source: 'campgrounds',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': ['get', 'point_count_abbreviated'],
      'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
      'text-size': 12
    }
  });

  map.addLayer({
    id: 'unclustered-point',
    type: 'circle',
    source: 'campgrounds',
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': '#11b4da',
      'circle-radius': 4,
      'circle-stroke-width': 1,
      'circle-stroke-color': '#fff',
      'circle-emissive-strength': 1
    }
  });

  // Add interactions
  map.on('click', 'clusters', (e) => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: ['clusters']
    });
    const clusterId = features[0].properties.cluster_id;
    map
      .getSource('campgrounds')
      .getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return;
        map.easeTo({
          center: features[0].geometry.coordinates,
          zoom: zoom
        });
      });
  });

    map.on('click', 'unclustered-point', (e) => {
        const { popUpMarkup } = e.features[0].properties;
        const coordinates = e.features[0].geometry.coordinates.slice();
        new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(popUpMarkup)
        .addTo(map);
    });

    map.on('mouseenter', 'clusters', () => {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'clusters', () => {
        map.getCanvas().style.cursor = '';
    });
    map.on('mouseenter', 'unclustered-point', () => {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'unclustered-point', () => {
        map.getCanvas().style.cursor = '';
    });
    }

// Initial load
map.on('load', () => {
  try {
    map.setConfig();
  } catch (err) {
    console.warn('Initial theme set failed:', err);
  }
  addClusterLayers();
});

// Handle dark mode toggle and reapply clusters
function updateMapTheme() {
  const newStyle =
    localStorage.getItem('darkMode') === 'enabled'
      ? 'mapbox://styles/mapbox/dark-v11'
      : 'mapbox://styles/mapbox/light-v11';

  map.setStyle(newStyle);

  // When style reloads, add clusters again
  map.once('styledata', () => {
    addClusterLayers();
  });
}

window.addEventListener('storage', (event) => {
  if (event.key === 'darkMode') updateMapTheme();
});

window.addEventListener('darkModeToggle', updateMapTheme);
