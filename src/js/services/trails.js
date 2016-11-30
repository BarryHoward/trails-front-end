function TrailsService ($http, $cookies, NgMap) {

  const SERVER = "https://trails-back-end.herokuapp.com/"

  let vm = this;

  vm.drawLine = drawLine;
  vm.getMap = getMap;
  vm.loadMarker = loadMarker;
  vm.placeMarker = placeMarker;
  vm.getTrail = getTrail;
  vm.updateTrail = updateTrail;


  function getMap(id, trail_id){
     NgMap.getMap(id).then(function (map) {
      vm.map = map;
      vm.markers = [];
      vm.trail = undefined;
      vm.getTrail(trail_id);
    })
  }


  function getTrail(trail_id){
      $http.get(`${SERVER}trails/${trail_id}`).then(
        (resp) => {
          resp.data.waypoints.forEach(function (waypoint) {
            vm.loadMarker(waypoint);
          });
          vm.drawLine();
          vm.trailTitle = resp.data.trailInfo.title;
      }, (reject) => {
          console.log(reject)
      });
    }

  function loadMarker(waypoint){
    var myLatlng = new google.maps.LatLng(waypoint.lat, waypoint.lng)
    var marker = new google.maps.Marker({
        map: vm.map,
        draggable: true,
        animation: google.maps.Animation.DROP,
        position: myLatlng,
        lat: myLatlng.lat(),
        lng: myLatlng.lng()
    });
    vm.markers.push(marker);
    google.maps.event.addListener(marker, 'dragend', function (event){
      marker.lat = marker.getPosition().lat();
      marker.lng = marker.getPosition().lng();
      vm.drawLine(vm.trail, vm.markers, vm.map);
    })
  }

  function placeMarker(location) {
      var marker = new google.maps.Marker({
          position: location.latLng,
          map: vm.map,
          draggable: true,
          lat: location.latLng.lat(),
          lng: location.latLng.lng()
      });
      vm.markers.push(marker);
      vm.drawLine(vm.trail, vm.markers, vm.map);
      google.maps.event.addListener(marker, 'dragend', function (event){
        marker.lat = marker.getPosition().lat();
        marker.lng = marker.getPosition().lng();
        vm.drawLine(vm.trail, vm.markers, vm.map);
      })
  }


  function drawLine() {
    if (vm.trail){
      vm.trail.setMap(null);
    }
    var addTrail = new google.maps.Polyline({
        path: vm.markers,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
      });

    addTrail.setMap(vm.map);
    vm.trail = addTrail;
  }

  function updateTrail(event, id) {
      let newTrail = {};
      newTrail.waypoints = [];
      vm.markers.forEach(function (marker) {
        let waypoint = {};
        waypoint.lat = marker.lat;
        waypoint.lng = marker.lng;
        newTrail.waypoints.push(waypoint);
      });
      newTrail.title = vm.trailTitle;

      $http.patch(`${SERVER}trails/${id}`, newTrail).then((resp) => {
        console.log(resp.data)
      }, (reject) => {
        console.log(reject)
      });
  }

};

TrailsService.$inject = ['$http', '$cookies', 'NgMap'];
export { TrailsService };