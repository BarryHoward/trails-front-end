function TrailsService ($http, $cookies, NgMap) {

  const SERVER = "https://trails-back-end.herokuapp.com/"

  let vm = this;

  vm.drawLine = drawLine;
  vm.getMap = getMap;
  vm.loadMarker = loadMarker;
  vm.placeMarker = placeMarker;
  vm.getTrail = getTrail;
  vm.updateTrail = updateTrail;
  vm.dragListener = dragListener;
  vm.newTrail = newTrail;


  function getMap(id){
     return NgMap.getMap(id)
  }

  function getTrail(trail_id){
    return $http.get(`${SERVER}trails/${trail_id}`)
  }

  function loadMarker(map, markers, waypoint){
    var myLatlng = new google.maps.LatLng(waypoint.lat, waypoint.lng)
    var marker = new google.maps.Marker({
        map: map,
        draggable: true,
        animation: google.maps.Animation.DROP,
        position: myLatlng,
        lat: myLatlng.lat(),
        lng: myLatlng.lng()
    });
    markers.push(marker);
    vm.dragListener(marker, markers, map)
  }

  function dragListener (marker, markers, map){
      google.maps.event.addListener(marker, 'dragend', function (event){
      marker.lat = marker.getPosition().lat();
      marker.lng = marker.getPosition().lng();
      vm.drawLine(map, markers);
    })
  }

  function placeMarker(markers, map, location) {
      var marker = new google.maps.Marker({
          position: location.latLng,
          map: map,
          draggable: true,
          lat: location.latLng.lat(),
          lng: location.latLng.lng()
      });
      markers.push(marker);
      vm.drawLine(map, markers);
      vm.dragListener(marker, markers, map)
  }


  function drawLine(map, markers) {
    if (vm.line){
      vm.line.setMap(null);
    }
    var addLine = new google.maps.Polyline({
        path: markers,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
      });

    addLine.setMap(map);
    vm.line = addLine;
  }

  function updateTrail(newTrail, id) {
      $http.patch(`${SERVER}trails/${id}`, newTrail).then((resp) => {
        console.log(resp.data)
      }, (reject) => {
        console.log(reject)
      });
  }

  function newTrail(newTrail){
      $http.post(`${SERVER}trails`, newTrail).then((resp) => {
        console.log(resp.data)
      }, (reject) => {
        console.log(reject)
      });
  }

};

TrailsService.$inject = ['$http', '$cookies', 'NgMap'];
export { TrailsService };