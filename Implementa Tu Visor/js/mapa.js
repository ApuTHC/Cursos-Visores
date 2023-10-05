var miApp = {};

// Función anónima autoejecutable para evitar conflictos con otras librerías
(function() {
  // Declaramos una variable global para el mapa
  var map;

  const firebaseConfig = {
    
  };

  const app = firebase.initializeApp(firebaseConfig);
  const database = firebase.database();
  
  // Esperamos a que el documento esté listo
  $(document).ready(function () {


    // Inicializamos el mapa en una posición y con un zoom determinados
    map = L.map('map').setView([6.24, -75.57], 12);
    // Añadimos el mapa base de OpenStreetMap
    var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    // Creamos un marcador y lo añadimos al mapa
    // var estacion_san_antonio = L.marker([6.247177, -75.569686]).addTo(map).bindPopup("<b>Estación San Antonio</b>");
    // Creamos un polígono definiendo sus estilos y lo añadimos al mapa
    // var parque_norte = L.polygon([
    //   [6.275041,-75.569252],
    //   [6.271726,-75.570164],
    //   [6.271065,-75.569617],
    //   [6.270297,-75.568179],
    //   [6.272131,-75.567128],
    //   [6.27163,-75.566087],
    //   [6.272547,-75.565658],
    //   [6.275553,-75.568748],
    //   [6.275585,-75.569048],
    //   [6.275041,-75.569252]
    // ], {
    //   color: 'red',
    //   fillColor: '#f00',
    //   fillOpacity: 0.5,
    // }).addTo(map).bindPopup("<b>Soy el Parque Norte</b>");

    // Creamos un geojson que representa un polígono
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
    // Creamos una capa a partir del geojson anterior y la añadimos al mapa
    // var estadio = L.geoJSON(geojson_estadio).addTo(map).bindPopup("<b>Estadio Atanasio Girardot</b>");

    // Creamos un mapa base satelital de ESRI
    var imagery = L.esri.basemapLayer('Imagery');

    /* <------------------- Barra Lateral -------------------> */

    // Inicializamos la barra lateral y la añadimos al mapa
    sidebar = L.control.sidebar({
      autopan: false,       // whether to maintain the centered map point when opening the sidebar
      closeButton: true,    // whether t add a close button to the panes
      container: 'sidebar', // the DOM container or #ID of a predefined sidebar container that should be used
      position: 'left',     // left or right
    }).addTo(map);


    notification = L.control.notifications({
      timeout: 4000,
      position: 'bottomright',
      closable: true,
      dismissable: true,
      className: 'pastel'
    }).addTo(map);

    cargarEstaciones();


    /* <------------------- Control de Capas -------------------> */

    // Creamos un objeto con las capas y sus nombres que queremos que aparezcan en el control de capas
    const overlays = [
      // {name: 'Parque Norte', layer: parque_norte},
      // {name: 'Estación', layer: estacion_san_antonio},
    ];
    // Creamos el control de capas y lo añadimos al mapa
    const legend = L.multiControl(overlays, {position:'topright', label: 'Control de capas'}).addTo(map);
    
    // Añadimos el contenido del control de capas a la barra lateral
    $("#capasContent").append($(legend._container).find(".leaflet-controllable-legend-body"));
    // Borramos el contenedor del control de capas del mapa
    $(legend._container).remove();
    // Añadimos la capa de estadio al control de capas
    // legend.addOverlay({name: 'Estadio', layer: estadio});


    /* <------------------- Control de Mapa Base -------------------> */

    // Creamos un array con los objetos que contengan los mapas base, imagenes y nombres que queremos que aparezcan en el control de mapas base
    const basemaps_array = [
      {
        layer: osm, //DEFAULT MAP
        icon: 'img/img1.PNG',
        name: 'OpenStreetMap'
      },
      {
        layer: imagery,
        icon: 'img/img2.PNG',
        name: 'Imagery ESRI'
      },
      {
        layer: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
          attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
        }),
        icon: 'img/img3.PNG',
        name: 'OpenTopoMap'
      },
      {
        layer: L.tileLayer('http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}', {
          attribution: '© Google'
        }),
        icon: 'img/img4.PNG',
        name: 'Google Maps'
      },
    ];

    // Creamos el control de mapas base y lo añadimos al mapa
    const basemaps = new L.basemapsSwitcher(basemaps_array, { position: 'topright' }).addTo(map);
    
    // Añadimos el contenido del control de mapas base a la barra lateral
    $("#basemapContent").append($(basemaps._container));
    // Removemos la clase que oculta los mapabase
    $(basemaps._container).find(".basemapImg").removeClass("hidden");



    /* <------------------- Control de Herramienta de Dibujo -------------------> */

    // Creamos el control de dibujo y lo añadimos al mapa
    map.pm.addControls({
      position: 'topright',
      drawMarker: true,
      drawPolyline: true,
      drawPolygon: true,
      
      drawRectangle: false,
      drawCircle: false,
      drawCircleMarker: false,
      drawText: false,

      editMode: true,
      dragMode:true,
      cutPolygon:false,
      removalMode: false,
      rotateMode: false
    });

    // Declaramos una variable de contador de capas creadas
    var contador = 1;

    // Creamos una función que se ejecutará cada vez que se cree una nueva capa
    map.on('pm:create', function (e) {
      // Obtenemos la capa creada y su GeoJSON
      const layer = e.layer;
      const geojson = layer.toGeoJSON();
      // Creamos un nombre para la capa e incrementamos el contador de capas creadas
      const nombre = layer.pm._shape + " " + contador;
      contador++;
      // Añadimos la capa creada al control de capas
      legend.addOverlay({name: nombre, layer: layer});

      if (geojson.geometry.type === "Point") {
        layer.on('click', IngresarDatos);
      }
    });

    const idsArray = ["est_name","est_fecha","est_propietario","est_norte","est_este","est_estrato","est_personas","est_obs"];
    function IngresarDatos() {
      sidebar.open("datos");
      for (let ind = 0; ind < idsArray.length; ind++) {
        const element = idsArray[ind];
        $("#"+element).val("");
      }
      const layerEdit = this;
      const layergeojson = layerEdit.toGeoJSON();

      $("#est_norte").val(layergeojson.geometry.coordinates[1]);
      $("#est_este").val(layergeojson.geometry.coordinates[0]);
    }

    miApp.GuardarEstacion = function() {

      var valores = {};

      for (let i = 0; i < idsArray.length; i++) {
        const element = idsArray[i];
        valores[element] = $("#"+element).val();
      }

      valores["activo"] = true; 
      
      var postListRef = firebase.database().ref('estaciones');
      var newPostRef = postListRef.push();
      newPostRef.set(valores)
      .then(function() {
        notification.success('¡Listo!', 'Se guardó con exito la estación');
        for (let ind = 0; ind < idsArray.length; ind++) {
          const element = idsArray[ind];
          $("#"+element).val("");
        }
      })
      .catch(function(error) {
        notification.alert('¡Error!', 'No se pudo cargar la estación');
      });
    }

    var layerEstaciones = L.layerGroup();
    function cargarEstaciones() {
      
      database.ref().child('estaciones/').get().then((snapshot) => {
        if (snapshot.exists()) {
          const estaciones = snapshot.val();
          console.log(snapshot.val());
          for (estacion in estaciones) {
            var est = estaciones[estacion];
            est["cod"] = estacion;
            if (est?.activo) {
              var geojson_est = {
                "type": "Feature",
                "properties": est,
                "geometry": {
                  "type": "Point",
                  "coordinates": [
                    parseFloat(est["est_este"]),parseFloat(est["est_norte"])
                  ]
                }
              }
              console.log(geojson_est);
    
              L.geoJson(geojson_est,{
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
                })
                .addTo(layerEstaciones); 
            }
          }
          legend.addOverlay({name: "Estaciones", layer: layerEstaciones});
          notification.success('¡Listo!', 'Se cargaron con exito las estaciones');
          searchCtrl.indexFeatures(layerEstaciones.toGeoJSON(), ["est_name", "est_propietario"]);
        } else {
          console.log("No data available");
        }
      }).catch((error) => {
        console.log(error);
        notification.alert('¡Error!', 'No se pudo cargar la estación');
      });
    }


    /* <------------------- Control de Herramienta de Busqueda -------------------> */

    // Creamos el control de búsqueda y lo añadimos al mapa
    searchCtrl = L.control.fuseSearch().addTo(map);


    // Añadimos el contenido del control de búsqueda a la barra lateral
    $("#buscadorContent").append($(".leaflet-fusesearch-panel .content"));
    // Removemos el botón y contenedor del control de búsqueda del mapa
    $(searchCtrl._container).remove();
    // Añadimos un ícono de búsqueda al control de búsqueda
    $(".content .header").prepend('<i class="fa-solid fa-magnifying-glass-location"></i>');
    // Removemos el botón de cerrar del control de búsqueda
    $(".content .header .close").remove();

    // Creamos la capa de Municipio de Antioquia
    // const muni = L.geoJson(municipios,{
    //   onEachFeature: function (feature, layer) {
    //     feature.layer = layer;
    //     if (feature.properties) {
    //       layer.bindPopup(Object.keys(feature.properties).map(function(k) {
    //           return k + ": " + feature.properties[k];
    //       }).join("<br />"), {
    //           maxHeight: 200
    //       });
    //     }
    //   }
    // });

    // // Añadimos la capa de municipio al control de capas
    // legend.addOverlay({name: 'Municipios', layer: muni});

    // // Añadimos la capa de municipio al control de búsqueda con los campos que queremos filtrar y que se muestrarán en la busqueda
    // searchCtrl.indexFeatures(muni.toGeoJSON(), ["est_name", "est_propietario", 'MPIO_NOMBR', 'COD_MPIO', 'TERRIT_CAR', 'ZONA']);
		
    
    /* <------------------- Control de Herramienta de MiniMapa -------------------> */

    // Creamos el mapa base para el minimapa
    var osm2 = new L.TileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {minZoom: 0, maxZoom: 13, attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>' });
    // Se crean los estilos para el rectangulo y la sombra que representa el area visible en el minimapa
    var rect1 = {color: "#ff1100", weight: 3};
		var rect2 = {color: "#0000AA", weight: 1, opacity:0, fillOpacity:0};
    // Creamos el control de minimapa y lo añadimos al mapa
		var miniMap = new L.Control.MiniMap(osm2, { toggleDisplay: true, aimingRectOptions : rect1, shadowRectOptions: rect2}).addTo(map);


  });
})();
