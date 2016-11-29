const SERVER = "https://trails-back-end.herokuapp.com/"

function TrailNewController ($state, NgMap, $http) {
  let vm = this;
  vm.placeMarker = placeMarker;
  vm.addNewTrail = addNewTrail;
  vm.drawLine = drawLine;

  function init(){
      getMap('trailNewMap');
      vm.markers= [];
  }

  init();

  function placeMarker(location) {
      var latLong = {lat: -25.363, lng: 131.044};
      var marker = new google.maps.Marker({
          position: location.latLng,
          map: vm.map,
          draggable: true,
          lat: location.latLng.lat(),
          lng: location.latLng.lng()
      });
      console.log(location.latLng.lat())
      vm.markers.push(marker);
      vm.drawLine();
      google.maps.event.addListener(marker, 'dragend', function (event){
        marker.lat = marker.getPosition().lat();
        marker.lng = marker.getPosition().lng();
        vm.drawLine();
      })
  }

  function getMap(id){
    NgMap.getMap(id).then(function(map) {
      vm.map = map;
    });
  }

  function addNewTrail(trailData) {
      let newTrail = {};
      newTrail.waypoints = [];
      vm.markers.forEach(function (marker) {
        let waypoint = {};
        waypoint.lat = marker.lat;
        waypoint.lng = marker.lng;
        newTrail.waypoints.push(waypoint);
      });
      newTrail.title = trailData.title;

      $http.post(`${SERVER}trails`, newTrail).then((resp) => {
        console.log(resp.data)
      }, (reject) => {
        console.log(reject)
      });
  }

  function drawLine() {
    if (vm.trail){
      removeLine()
    }
    console.log(vm.markers)
    var addTrail = new google.maps.Polyline({
        path: vm.markers,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
      });

    addTrail.setMap(vm.map);
    // console.log(vm.map)

    vm.trail = addTrail;

    function removeLine () {
      vm.trail.setMap(null);
    };
  }

}

TrailNewController.$inject = ['$state', 'NgMap', '$http'];
export { TrailNewController }
