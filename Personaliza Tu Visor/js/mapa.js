// Función anónima autoejecutable para evitar conflictos con otras librerías
(function() {
  // Declaramos una variable global para el mapa
  var map;
  var contador = 0;
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
      color: 'red',
      fillColor: '#f00',
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

    var imagery = L.esri.basemapLayer('Imagery');


    const overlays = [
      {name: 'Parque Norte', layer: parque_norte},
      {name: 'Estación', layer: estacion_san_antonio},
    ];
    const legend = L.multiControl(overlays, {position:'topright', label: 'Control de capas'}).addTo(map);
    

    sidebar = L.control.sidebar({
      autopan: false,       // whether to maintain the centered map point when opening the sidebar
      closeButton: true,    // whether t add a close button to the panes
      container: 'sidebar', // the DOM container or #ID of a predefined sidebar container that should be used
      position: 'left',     // left or right
    }).addTo(map);

    $("#capasContent").append($(legend._container).find(".leaflet-controllable-legend-body"));
    $(legend._container).remove();

    legend.addOverlay({name: 'Estadio', layer: estadio});


    const basemaps = new L.basemapsSwitcher([
      {
        layer: osm, //DEFAULT MAP
        icon: 'img/img1.PNG',
        name: 'OpenStreetMap'
      },
      {
        layer: imagery,
        icon: 'img/img4.PNG',
        name: 'Imagery ESRI'
      },
      {
        layer: L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png',{
          attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
        }),
        icon: 'img/img2.PNG',
        name: 'Stadia Maps'
      },
      {
        layer: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
          attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
        }),
        icon: 'img/img3.PNG',
        name: 'OpenTopoMap'
      },
    ], { position: 'topright' }).addTo(map);
    

    $("#basemapContent").append($(basemaps._container));
    $(basemaps._container).find(".basemapImg").removeClass("hidden");


    map.pm.addControls({
      position: 'topright',
      drawMarker: true,
      drawPolyline: true,
      drawPolygon: true,
      
      drawRectangle: false,
      drawCircle: false,
      drawCircleMarker: false,
      drawText: false,

      editMode: false,
      dragMode:true,
      cutPolygon:false,
      removalMode: false,
      rotateMode: false
    });

    map.on('pm:create', function (e) {
        const layer = e.layer;
        const geojson = layer.toGeoJSON();
        console.log(geojson);
        const nombre = layer.pm._shape + " " + contador;
        contador++;
        legend.addOverlay({name: nombre, layer: layer});
    });

    searchCtrl = L.control.fuseSearch()
    searchCtrl.addTo(map);

    $("#buscadorContent").append($(".leaflet-fusesearch-panel .content"));
    $(searchCtrl._container).remove();
    $(".content .header").prepend('<i class="fa-solid fa-magnifying-glass-location"></i>');
    $(".content .header .close").remove();


    const muni = L.geoJson(municipios,{
      onEachFeature: function (feature, layer) {
        feature.layer = layer;
        if (feature.properties) {
          layer.bindPopup(Object.keys(feature.properties).map(function(k) {
              return k + ": " + feature.properties[k];
          }).join("<br />"), {
              maxHeight: 200
          });
        }
      }
    });

    legend.addOverlay({name: 'Municipio', layer: muni});

    searchCtrl.indexFeatures(muni.toGeoJSON(), ['MPIO_NOMBR', 'COD_MPIO', 'TERRIT_CAR', 'ZONA']);
		
    
    var osm2 = new L.TileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {minZoom: 0, maxZoom: 13, attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>' });
    var rect1 = {color: "#ff1100", weight: 3};
		var rect2 = {color: "#0000AA", weight: 1, opacity:0, fillOpacity:0};
		var miniMap = new L.Control.MiniMap(osm2, { toggleDisplay: true, aimingRectOptions : rect1, shadowRectOptions: rect2}).addTo(map);


  });
})();
