// Función anónima autoejecutable para evitar conflictos con otras librerías
(function() {
  // Declaramos una variable global para el mapa
  var map;
  // Esperamos a que el documento esté listo
  $(document).ready(function () {
    // Inicializamos el mapa en una posición y con un zoom determinados
    map = L.map('map').setView([6.24, -75.57], 12);
    // Añadimos el mapa base de OpenStreetMap
    var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    var estacion_san_antonio = L.marker([6.247177, -75.569686]).addTo(map).bindPopup("<b>Estación San Antonio</b>");


    var metrocable_arvi = L.polyline([
      [6.3003,-75.55839],
      [6.296306,-75.551878],
      [6.295112,-75.548166],
      [6.293185,-75.541711],
      [6.29278,-75.541893],
      [6.281497,-75.502922]
    ]).addTo(map).bindPopup("<b>Metrocable Arví</b>");


    var parque_norte = L.polygon([
      [6.275041,-75.569252],
      [6.271726,-75.570164],
      [6.271065,-75.569617],
      [6.270297,-75.568179],
      [6.272131,-75.567128],
      [6.27163,-75.566087],
      [6.272547,-75.565658],
      [6.275553,-75.568748],
      [6.275585,-75.569048],
      [6.275041,-75.569252]
    ], {
      color: 'black',
      fillColor: '#f03',
      fillOpacity: 0.5,
    }).addTo(map).bindPopup("<b>Soy el Parque Norte</b>");


    var geojson_estadio = {
      "type": "Feature",
      "properties": {
        "name": "Estadio Atanasio Girardot",  
        "ciudad": "Medellín",
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [-75.590025,6.260207],
            [-75.592162,6.255983],
            [-75.591476,6.254458],
            [-75.590274,6.253947],
            [-75.589199,6.253969],
            [-75.588437,6.254193],
            [-75.586283,6.258415],
            [-75.590025,6.260207]
          ]
        ]
      }
    }

    var estadio = L.geoJSON(geojson_estadio).addTo(map).bindPopup("<b>Estadio Atanasio Girardot</b>");


    var poligonos_sitios = L.layerGroup([parque_norte, estadio]).addTo(map);


    var imagery = L.esri.basemapLayer('Imagery');

    var baseMaps = {
      "OpenStreetMap": osm,
      "ESRI Imagery": imagery
    };
  
    var overlayMaps = {
      "Sitios": poligonos_sitios,
      "Estación San Antonio": estacion_san_antonio,
      "Metrocable Arví": metrocable_arvi
    };

    var layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);

    var popup = L.popup();

    function onMapClick(e) {
        popup.setLatLng(e.latlng).setContent("Este sitio tiene las siquientes coordenadas: " + e.latlng.toString()).openOn(map);
    }

    map.on('click', onMapClick);
    
  });
})();
