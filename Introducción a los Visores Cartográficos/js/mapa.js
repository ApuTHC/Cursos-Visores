(function() {

  var map;
  
  $(document).ready(function () {
    
    map = L.map('map').setView([6.24, -75.57], 12);
    
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    
  });


})();