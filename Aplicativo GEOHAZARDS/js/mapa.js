var map;

// var dbCol = db["col"];
var dbCol = [];

var notification;
var markers = L.markerClusterGroup();

const firebaseConfig = {

};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();


// Función anónima autoejecutable para evitar conflictos con otras librerías

(function(){
  $(document).ready(function () {
    map = L.map('map').setView([6.24, -75.57], 12);
    // Añadimos el mapa base de OpenStreetMap
    var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    var facultad_minas = L.marker([6.274648, -75.59171]).addTo(map).bindPopup("<b>Facultad de Minas</b>");

    var pista_aeropuesto = L.polyline([
      [6.231048,-75.588341],
      [6.208949,-75.592675]
    ]).addTo(map).bindPopup("<b>Pista Aeropuerto</b>");

    var campus_volador = L.polygon([
        [6.266616,-75.576743],
        [6.264953,-75.575252],
        [6.259791,-75.575219],
        [6.259610,-75.575734],
        [6.260633,-75.579629],
        [6.261796,-75.579726],
        [6.262798,-75.579404],
        [6.266616,-75.576743]
    ], {
      color: 'black',
      fillColor: '#f03',
      fillOpacity: 0.5,
    }).addTo(map).bindPopup("<b>Soy el Campus Volador</b>");


    var campus_rio_geojosn = {
      "type": "Feature",
      "properties": {
        "name": "Campus Río",
        "universidad": "Universidad Nacional de Colombia",
        "ciudad": "Medellín",
      },
      "geometry": {
          "type": "Polygon",
          "coordinates": [
              [
                  [-75.574694, 6.264771],
                  [-75.573626, 6.264489],
                  [-75.573202, 6.263945],
                  [-75.573519, 6.262921],
                  [-75.573798, 6.262793],
                  [-75.574565, 6.262793],
                  [-75.574833, 6.263044],
                  [-75.574849, 6.264601],
                  [-75.574828, 6.264697],
                  [-75.574694, 6.264771]
              ]
          ]
      }
    }

    var campus_rio = L.geoJSON(campus_rio_geojosn).addTo(map).bindPopup("<b>Campus Río</b>");

    var unalMed = L.geoJSON(unal_med).addTo(map);

    var popup = L.popup();
  
    function onMapClick(e) {
      popup.setLatLng(e.latlng).setContent("Este sitio tiene las siguientes coordenadas: " + e.latlng.toString()).openOn(map);
    }
  
    map.on('click', onMapClick);

    /* <------------------- Barra Lateral -------------------> */

    // Inicializamos la barra lateral y la añadimos al mapa
    sidebar = L.control.sidebar({
      autopan: false,       // whether to maintain the centered map point when opening the sidebar
      closeButton: true,    // whether t add a close button to the panes
      container: 'sidebar', // the DOM container or #ID of a predefined sidebar container that should be used
      position: 'left',     // left or right
    }).addTo(map);

    /* <------------------- Control de Mapa Base -------------------> */

    const basemaps_array = [
      {
        layer: osm, //DEFAULT MAP
        icon: 'img/img1.PNG',
        name: 'OpenStreetMap'
      },
      {
        layer: L.esri.basemapLayer('Imagery'),
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


    notification = L.control.notifications({
      timeout: 4000,
      position: 'topright',
      closable: true,
      dismissable: true,
      className: 'pastel'
    }).addTo(map);


    // for (let i = 0; i < dbCol.length; i++) {
    //   const event = dbCol[i];
    //   if (event.active) {
    //     var dateEvent = new Date(event['date'].split(" ")[0])
    //     const auxLoc = event['location'].replace("[", "").replace("]", "").split(", ");
    //     const auxLng = parseFloat(auxLoc[0]);
    //     const auxLat = parseFloat(auxLoc[1]);
    //     var point = L.marker([auxLat, auxLng]).toGeoJSON();   
    //     L.extend(point.properties, {
    //       bd: "col",
    //       id: i,
    //       Tipo: event['type'],
    //       Fecha: dateEvent,
    //       Detonante: event['triggering'],
    //       Fuente: event['source'],
    //       Departamento: event['department'],
    //       Municipio: event['town'],
    //       Pueblo: event['county'],
    //       Sitio: event['site'],
    //       Incertidumbre: event['uncertainty'],
    //       Norte: auxLat,
    //       Este: auxLng,
    //       Fallecidos: event['fatalities'],
    //       Economicas: event['losses'],
    //       Notas: event['add']
    //     });
  //       L.geoJson(point,{
  //           onEachFeature: function(feature, layer) {
  //               if (feature.properties) {
  //                   layer.bindPopup(Object.keys(feature.properties).map(function(k) {
  //                       return k + ": " + feature.properties[k];
  //                   }).join("<br />"), {
  //                       maxHeight: 200
  //                   });
  //               }
  //           }
  //       }).addTo(markers);
    //   }
    // }
    // markers.addTo(map);
    // notification.success('¡Listo!', 'Se cargó con exito los eventos');


    agregarFiltros();
    agregarFiltrosRegistro();

    markers.on('click', function(e) {
      editPoint(e);
    }); 

  });
})();

function agregarFiltros() {

  const getUnique = (arr) => [...new Set(arr)];
  var textAppend = "";
  var departamentos = ["Todos"];
  var ciudades = ["Todas"];
  var tipos = ["Todos"];
  var trigger = ["Todos"];

  for (let i = 0; i < dbCol.length; i++) {
    const event = dbCol[i];
    departamentos.push(event["department"])
    ciudades.push(event["town"])
    tipos.push(event["type"])
    trigger.push(event["triggering"])
  }

  var departamentosUnique = getUnique(departamentos);
  var ciudadesUnique = getUnique(ciudades);
  var tiposUnique = getUnique(tipos);
  var triggerUnique = getUnique(trigger);

  textAppend += '<div class="col-12">'+
                  '<label for="afterDate" class="bold label-capas">Después de la Fecha:</label>'+
                  '<input type="date" class="form-control" id="afterDate" value=""></div>';
  textAppend += '<div class="col-12">'+
                  '<label for="beforeDate" class="bold label-capas">Antes de la Fecha:</label>'+
                  '<input type="date" class="form-control" id="beforeDate" value=""></div>';
  textAppend += '<div class="col-12">'+
                  '<label for="selectDepartamento" class="bold label-capas">Departamento:</label>'+
                  '<select class="form-control" id="selectDepartamento">';
  for (let i = 0; i < departamentosUnique.length; i++) {
      const element = departamentosUnique[i];
      textAppend += '<option value="'+element+'">'+element+'</option>';
  }
  textAppend += '</select></div>';
  textAppend += '<div class="col-12">'+
                  '<label for="selectCiudad" class="bold label-capas">Ciudad:</label>'+
                  '<select class="form-control" id="selectCiudad">';
  for (let i = 0; i < ciudadesUnique.length; i++) {
      const element = ciudadesUnique[i];
      textAppend += '<option value="'+element+'">'+element+'</option>';
  }
  textAppend += '</select></div>';
  textAppend += '<div class="col-12">'+
                  '<label for="selectTipo" class="bold label-capas">Tipo:</label>'+
                  '<select class="form-control" id="selectTipo">';
  for (let i = 0; i < tiposUnique.length; i++) {
      const element = tiposUnique[i];
      textAppend += '<option value="'+element+'">'+element+'</option>';
  }
  textAppend += '</select></div>';
  textAppend += '<div class="col-12">'+
                  '<label for="selectDetonante" class="bold label-capas">Detonante:</label>'+
                  '<select class="form-control" id="selectDetonante">';
  for (let i = 0; i < triggerUnique.length; i++) {
      const element = triggerUnique[i];
      textAppend += '<option value="'+element+'">'+element+'</option>';
  }
  textAppend += '</select></div>';
  textAppend += '<div class="col-12">'+
                  '<label for="selectMuertes" class="bold label-capas">Mínimo de Fallecidos:</label>'+
                  '<input type="number" class="form-control" id="selectMuertes" value="0"></div>';
  // textAppend += '<button class="btn btn-comun ml-3 mt-3" id="btn_Colombia" onclick="graficarCapa()">Buscar</button>';
  textAppend += '<button class="btn btn-comun ml-3 mt-3" id="btn_Colombia" onclick="descargarDB()">Buscar</button>';

  $("#eventContent").empty();
  $("#eventContent").append(textAppend);
}


function adjustDate(date) {
  const fecha = new Date(date);
  const fechaFormateada = fecha.getFullYear() + "-" + (fecha.getMonth() + 1).toString().padStart(2, '0') + "-" + fecha.getDate().toString().padStart(2, '0');
  return fechaFormateada; 
}

function descargarDB() {
  if (dbCol.length === 0) {
    database.ref().child("col").get().then((snapshot) => {
      if (snapshot.exists()) {
          dbCol = snapshot.val();
          console.log(dbCol);
          notification.success('¡Listo!', 'Se descargó la base de datos con exito');
          agregarFiltros();
          agregarFiltrosRegistro();
          graficarCapa();
      } else {
          console.log("No data available");
          notification.alert('¡Error!', 'Ocurrió un error al intentar cargar los eventos de la base de datos, no hay datos');
      }
    }).catch((error) => {
        console.log(error);
        notification.alert('¡Error!', 'Ocurrió un error al intentar conectarse a la base de datos');
    });   
  }
  else{
    graficarCapa();
  }
}

function graficarCapa() {

  markers.clearLayers();
  const afterDate = ($("#afterDate").val() !== '') ? new Date($("#afterDate").val()) : new Date("1925-01-01");
  const beforeDate = ($("#beforeDate").val() !== '') ? new Date($("#beforeDate").val()) : new Date();
  const depart = $("#selectDepartamento").val();
  const city = $("#selectCiudad").val();
  const type = $("#selectTipo").val();
  const detonante = $("#selectDetonante").val();
  const muertes = $("#selectMuertes").val();


  for (let i = 0; i < dbCol.length; i++) {
    const event = dbCol[i];
    if (event.active) {
      var dateEvent = new Date(event['date'].split(" ")[0]);
      const auxLoc = event['location'].replace("[", "").replace("]", "").split(", ");
      const auxLng = parseFloat(auxLoc[0]);
      const auxLat = parseFloat(auxLoc[1]);
      if ((event["department"] === depart || depart === "Todos" ) && (event["town"] === city || city === "Todas") && (event["type"] === type || type === "Todos") && (event["triggering"] === detonante || detonante === "Todos") && (event["fatalities"] >= muertes) && (dateEvent >= afterDate && dateEvent <= beforeDate)) {
        dateEvent = adjustDate(dateEvent);
        var point = L.marker([auxLat, auxLng]).toGeoJSON();   
        L.extend(point.properties, {
          bd: "col",
          id: i,
          Tipo: event['type'],
          Fecha: dateEvent,
          Detonante: event['triggering'],
          Fuente: event['source'],
          Departamento: event['department'],
          Municipio: event['town'],
          Pueblo: event['county'],
          Sitio: event['site'],
          Incertidumbre: event['uncertainty'],
          Norte: auxLat,
          Este: auxLng,
          Fallecidos: event['fatalities'],
          Economicas: event['losses'],
          Notas: event['add']
        });
        L.geoJson(point,{
            onEachFeature: function(feature, layer) {
                if (feature.properties) {
                    layer.bindPopup(Object.keys(feature.properties).map(function(k) {
                        return k + ": " + feature.properties[k];
                    }).join("<br />"), {
                        maxHeight: 200
                    });
                }
            }
        }).addTo(markers);
      }
    }
  }

  markers.addTo(map);
  notification.success('¡Listo!', 'Se cargó con exito los eventos');

}

function agregarFiltrosRegistro() {
  const getUnique = (arr) => [...new Set(arr)];
  var textAppend = "";
  var departamentos = [];
  var ciudades = [];
  var pueblos = [];
  var sitio = [];
  var incertidumbre = [];
  var tipos = [];
  var trigger = [];
  var fuente = [];
    
  if (dbCol.length !== 0) {
    for (let i = 0; i < dbCol.length; i++) {
        const element = dbCol[i];
        departamentos.push(element["department"])
        ciudades.push(element["town"])
        pueblos.push(element["county"])
        sitio.push(element["site"])
        incertidumbre.push(element["uncertainty"])
        tipos.push(element["type"])
        trigger.push(element["triggering"])
        fuente.push(element["source"])
    }
    var departamentosUnique = getUnique(departamentos);
    var ciudadesUnique = getUnique(ciudades);
    var pueblosUnique = getUnique(pueblos);
    var sitioUnique = getUnique(sitio);
    var tiposUnique = getUnique(tipos);
    var incertidumbreUnique = getUnique(incertidumbre);
    var triggerUnique = getUnique(trigger);
    var fuenteUnique = getUnique(fuente);
    textAppend += '<div class="col-12">'+
                    '<label for="lngRegister" class="bold label-capas">Longitud (Use el punto ej: -75.5):</label>'+
                    '<input type="text" class="form-control" id="lngRegister" value=""></div>';
    textAppend += '<div class="col-12">'+
                    '<label for="latRegister" class="bold label-capas">Latitud (Use el punto ej: 6.5):</label>'+
                    '<input type="text" class="form-control" id="latRegister" value=""></div>';
    textAppend += '<div class="col-12">'+
                    '<label for="fechita" class="bold label-capas">Fecha:</label>'+
                    '<input type="date" class="form-control" id="fechita" value=""></div>';
    textAppend += '<div class="col-12">'+
                    '<label for="selectTipo1" class="bold d-block label-capas">Tipo:</label>'+
                    '<input type="text" class="form-control col-6 d-inline-block" id="selectTipo0" value="">'+
                    '<select class="form-control col-6 d-inline-block" id="selectTipo1">';
    for (let i = 0; i < tiposUnique.length; i++) {
        const element = tiposUnique[i];
        textAppend += '<option value="'+element+'">'+element+'</option>';
    }
    textAppend += '</select></div>';
    textAppend += '<div class="col-12">'+
                    '<label for="selectDepartamento1" class="bold d-block label-capas">Departamento:</label>'+
                    '<input type="text" class="form-control col-6 d-inline-block" id="selectDepartamento0" value="">'+
                    '<select class="form-control col-6 d-inline-block" id="selectDepartamento1">';
    for (let i = 0; i < departamentosUnique.length; i++) {
        const element = departamentosUnique[i];
        textAppend += '<option value="'+element+'">'+element+'</option>';
    }
    textAppend += '</select></div>';
    textAppend += '<div class="col-12">'+
                    '<label for="selectCiudad1" class="bold d-block label-capas">Ciudad-Municipio:</label>'+
                    '<input type="text" class="form-control col-6 d-inline-block" id="selectCiudad0" value="">'+
                    '<select class="form-control col-6 d-inline-block" id="selectCiudad1">';
    for (let i = 0; i < ciudadesUnique.length; i++) {
        const element = ciudadesUnique[i];
        textAppend += '<option value="'+element+'">'+element+'</option>';
    }
    textAppend += '</select></div>';
    textAppend += '<div class="col-12">'+
                    '<label for="selectPueblo1" class="bold d-block label-capas">Pueblo-Vereda:</label>'+
                    '<input type="text" class="form-control col-6 d-inline-block" id="selectPueblo0" value="">'+
                    '<select class="form-control col-6 d-inline-block" id="selectPueblo1">';
    for (let i = 0; i < sitioUnique.length; i++) {
        const element = sitioUnique[i];
        textAppend += '<option value="'+element+'">'+element+'</option>';
    }
    textAppend += '</select></div>';
    textAppend += '<div class="col-12">'+
                    '<label for="selectSitio1" class="bold d-block label-capas">Sitio:</label>'+
                    '<input type="text" class="form-control col-6 d-inline-block" id="selectSitio0" value="">'+
                    '<select class="form-control col-6 d-inline-block" id="selectSitio1">';
    for (let i = 0; i < pueblosUnique.length; i++) {
        const element = pueblosUnique[i];
        textAppend += '<option value="'+element+'">'+element+'</option>';
    }
    textAppend += '</select></div>';
    textAppend += '<div class="col-12">'+
                    '<label for="selectIncert1" class="bold d-block label-capas">Incertidumbre:</label>'+
                    '<input type="text" class="form-control col-6 d-inline-block" id="selectIncert0" value="">'+
                    '<select class="form-control col-6 d-inline-block" id="selectIncert1">';
    for (let i = 0; i < incertidumbreUnique.length; i++) {
        const element = incertidumbreUnique[i];
        textAppend += '<option value="'+element+'">'+element+'</option>';
    }
    textAppend += '</select></div>';
    textAppend += '<div class="col-12">'+
                    '<label for="selectDetonante1" class="bold d-block label-capas">Detonante:</label>'+
                    '<input type="text" class="form-control col-6 d-inline-block" id="selectDetonante0" value="">'+
                    '<select class="form-control col-6 d-inline-block" id="selectDetonante1">';
    for (let i = 0; i < triggerUnique.length; i++) {
        const element = triggerUnique[i];
        textAppend += '<option value="'+element+'">'+element+'</option>';
    }
    textAppend += '</select></div>';
    textAppend += '<div class="col-12">'+
                    '<label for="selectMuertes" class="bold label-capas">Número de Fallecidos:</label>'+
                    '<input type="number" class="form-control" id="selectMuertes1" value="0"></div>';
    textAppend += '<div class="col-12">'+
                    '<label for="selectPerdidas" class="bold label-capas">Perdidas:</label>'+
                    '<input type="text" class="form-control" id="selectPerdidas" value="0"></div>';
    textAppend += '<div class="col-12">'+
                    '<label for="selectFuente1" class="bold d-block label-capas">Fuente:</label>'+
                    '<input type="text" class="form-control col-6 d-inline-block" id="selectFuente0" value="">'+
                    '<select class="form-control col-6 d-inline-block" id="selectFuente1">';
    for (let i = 0; i < fuenteUnique.length; i++) {
        const element = fuenteUnique[i];
        textAppend += '<option value="'+element+'">'+element+'</option>';
    }
    textAppend += '</select></div>';
    textAppend += '<div class="col-12">'+
                    '<label for="selectNotas" class="bold label-capas">Notas:</label>'+
                    '<textarea type="number" class="form-control" id="selectNotas" value="0"></textarea></div>';

    textAppend += '<button class="btn btn-comun ml-3 mt-3" id="btnAñadir_Col" onclick="anadirEvento()">Añadir</button>';
    textAppend += '<button class="btn btn-comun ml-3 mt-3 d-none" id="btnEditar_Col" onclick="editarEvento()">Editar</button>';
    textAppend += '<button class="btn btn-comun ml-3 mt-3 d-none" id="btnBorrar_Col" onclick="borrarEvento()">Borrar</button>';
  }
  else{
      textAppend = "<h5 class='mt-2'>Active la capa de eventos</h5>";
  }

  $("#registropane").empty();
  $("#registropane").append(textAppend);

  $("#selectTipo1").change(function() {
      $("#selectTipo0").val($("#selectTipo1").val());
  });
  $("#selectDepartamento1").change(function() {
      $("#selectDepartamento0").val($("#selectDepartamento1").val());
  });
  $("#selectCiudad1").change(function() {
      $("#selectCiudad0").val($("#selectCiudad1").val());
  });
  $("#selectPueblo1").change(function() {
      $("#selectPueblo0").val($("#selectPueblo1").val());
  });
  $("#selectSitio1").change(function() {
      $("#selectSitio0").val($("#selectSitio1").val());
  });
  $("#selectIncert1").change(function() {
      $("#selectIncert0").val($("#selectIncert1").val());
  });
  $("#selectDetonante1").change(function() {
      $("#selectDetonante0").val($("#selectDetonante1").val());
  });
  $("#selectFuente1").change(function() {
      $("#selectFuente0").val($("#selectFuente1").val());
  });
}

function anadirEvento(id) {

  const lngRegister = $("#lngRegister").val();
  const latRegister = $("#latRegister").val();

  database.ref('col/'+dbCol.length).set(
      {
          active:true,
          location : "["+lngRegister+", "+latRegister+"]",
          date : $("#fechita").val(),
          type : $("#selectTipo0").val(),
          department: $("#selectDepartamento0").val(),
          town : $("#selectCiudad0").val(),
          county : $("#selectPueblo0").val(),
          site : $("#selectSitio0").val(),
          uncertainty : $("#selectIncert0").val(),
          triggering : $("#selectDetonante0").val(),
          fatalities : $("#selectMuertes1").val(),
          losses : $("#selectPerdidas").val(),
          source : $("#selectFuente0").val(),
          add : $("#selectNotas").val(),
      }
  ).then((snapshot) => {
      console.log("Guardó");
      
      var point = L.marker([latRegister, lngRegister]).toGeoJSON();   
      L.extend(point.properties, {
        bd: "col",
        id: dbCol.length,
        Tipo: $("#selectTipo0").val(),
        Fecha: $("#fechita").val(),
        Detonante: $("#selectDetonante0").val(),
        Fuente: $("#selectFuente0").val(),
        Departamento: $("#selectDepartamento0").val(),
        Municipio: $("#selectCiudad0").val(),
        Pueblo: $("#selectPueblo0").val(),
        Sitio: $("#selectSitio0").val(),
        Incertidumbre: $("#selectIncert0").val(),
        Norte: latRegister,
        Este: lngRegister,
        Fallecidos: $("#selectMuertes1").val(),
        Economicas: $("#selectPerdidas").val(),
        Notas: $("#selectNotas").val()
      });
      L.geoJson(point,{
          onEachFeature: function(feature, layer) {
              if (feature.properties) {
                  layer.bindPopup(Object.keys(feature.properties).map(function(k) {
                      return k + ": " + feature.properties[k];
                  }).join("<br />"), {
                      maxHeight: 200
                  });
              }
          }
      }).addTo(markers);

      dbCol.push({
          active:true,
          location : "["+lngRegister+", "+latRegister+"]",
          date : $("#fechita").val(),
          type : $("#selectTipo0").val(),
          department: $("#selectDepartamento0").val(),
          town : $("#selectCiudad0").val(),
          county : $("#selectPueblo0").val(),
          site : $("#selectSitio0").val(),
          uncertainty : $("#selectIncert0").val(),
          triggering : $("#selectDetonante0").val(),
          fatalities : $("#selectMuertes1").val(),
          losses : $("#selectPerdidas").val(),
          source : $("#selectFuente0").val(),
          add : $("#selectNotas").val(),
      })

      notification.success('¡Listo!', 'Se guardó con exito el evento');
      $("#"+id).attr("disabled", false);
  }).catch((error) => {
      console.error(error);
      notification.alert('¡Error!', 'Ocurrió un error al intentar guardar el evento');
  });

  
}

var id_edit = "";

function editPoint(e) {
  layergeojson = e.layer.toGeoJSON().properties;
  console.log(layergeojson);
  sidebar.open('registrarEvento');

  id_edit = layergeojson.id;

  $("#lngRegister").val(layergeojson.Este);
  $("#latRegister").val(layergeojson.Norte);
  $("#fechita").val(layergeojson.Fecha);
  $("#selectTipo0").val(layergeojson.Tipo);
  $("#selectDepartamento0").val(layergeojson.Departamento);
  $("#selectCiudad0").val(layergeojson.Municipio);
  $("#selectPueblo0").val(layergeojson.Pueblo);
  $("#selectSitio0").val(layergeojson.Sitio);
  $("#selectIncert0").val(layergeojson.Incertidumbre);
  $("#selectDetonante0").val(layergeojson.Detonante);
  $("#selectMuertes1").val(layergeojson.Fallecidos);
  $("#selectPerdidas").val(layergeojson.Economicas);
  $("#selectFuente0").val(layergeojson.Fuente);
  $("#selectNotas").val(layergeojson.Notas);


  $("#btnEditar_Col").removeClass("d-none");
  $("#btnBorrar_Col").removeClass("d-none");
  $("#btnAñadir_Col").addClass("d-none");
}


function editarEvento() {
  idPoint = id_edit;
  auxpoint = {
      active: true,
      bd: "col",
      location : "["+$("#lngRegister").val()+", "+$("#latRegister").val()+"]",
      date : $("#fechita").val(),
      type : $("#selectTipo0").val(),
      department: $("#selectDepartamento0").val(),
      town : $("#selectCiudad0").val(),
      county : $("#selectPueblo0").val(),
      site : $("#selectSitio0").val(),
      uncertainty : $("#selectIncert0").val(),
      triggering : $("#selectDetonante0").val(),
      fatalities : $("#selectMuertes1").val(),
      losses : $("#selectPerdidas").val(),
      source : $("#selectFuente0").val(),
      add : $("#selectNotas").val(),
  }
  database.ref('col/'+idPoint).set(
      auxpoint
  ).then((snapshot) => {
      console.log("Guardó");
      dbCol[idPoint] = auxpoint;
      notification.success('¡Listo!', 'Se editó con exito el evento');
  }).catch((error) => {
      console.error(error);
      notification.alert('¡Error!', 'Ocurrió un error al intentar editar el evento');
  });
  
}

function borrarEvento() {
  idPoint = id_edit;
  database.ref('col/'+idPoint+'/'+'active').set(
      false
  ).then((snapshot) => {
      console.log("Guardó");
      dbCol[idPoint].active = false;
      notification.success('¡Listo!', 'Se desactivó con exito el evento');
  }).catch((error) => {
      console.error(error);
      notification.alert('¡Error!', 'Ocurrió un error al intentar desacrtivar el evento');
  });
}