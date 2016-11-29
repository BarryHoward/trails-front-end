const SERVER = "https://trails-back-end.herokuapp.com/"

function TrailUpdateController ($http, $stateParams, NgMap) {
  let vm = this;
  vm.placeMarker = placeMarker;
  vm.loadMarker = loadMarker;
  vm.drawLine = drawLine;
  vm.markers = [];
  vm.currentTrail = {};

  function init () {
    // getMap('trailUpdateMap');
    let mapId = $stateParams.id

    NgMap.getMap('trailUpdateMap').then(function (map) {
      vm.map = map;

      $http.get(`${SERVER}trails/${mapId}`).then((resp) => {
        resp.data.waypoints.forEach(function (element) {
          vm.loadMarker(element);
        });
        vm.drawLine();

        vm.currentTrail.title = resp.data.trailInfo.title;
      }, (reject) => {
        console.log(reject)
      });

    })
  }

  init();

  // function getMap(id){
  //   NgMap.getMap(id).then(function(map) {
  //     vm.map = map;
  //   });
  // }

  function loadMarker(waypoint){

    var myLatlng = new google.maps.LatLng(waypoint.lat, waypoint.lng)
    var marker = new google.maps.Marker({
        map: vm.map,
        draggable: true,
        position: myLatlng,
        lat: myLatlng.lat(),
        lng: myLatlng.lng()
    });
    vm.markers.push(marker);
    google.maps.event.addListener(marker, 'dragend', function (event){
      marker.lat = marker.getPosition().lat();
      marker.lng = marker.getPosition().lng();
      vm.drawLine();
    })


  }

  function placeMarker(location) {
    // console.log(location)
      // var latLong = {lat: -25.363, lng: 131.044};
      var marker = new google.maps.Marker({
          position: location.latLng,
          map: vm.map,
          draggable: true,
          lat: location.latLng.lat(),
          lng: location.latLng.lng()
      });
      // console.log(location.latLng.lat())
      vm.markers.push(marker);
      vm.drawLine();
      google.maps.event.addListener(marker, 'dragend', function (event){
        marker.lat = marker.getPosition().lat();
        marker.lng = marker.getPosition().lng();
        vm.drawLine();
      })
  }

  function drawLine() {
    console.log("drawline")
    if (vm.trail){
      removeLine()
    }
    // console.log(vm.markers)
    var addTrail = new google.maps.Polyline({
        path: vm.markers,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
      });

    addTrail.setMap(vm.map);
    console.log(addTrail, vm.map)

    vm.trail = addTrail;

    function removeLine () {
      vm.trail.setMap(null);
    };
  }


}

TrailUpdateController.$inject = ['$http', '$stateParams', 'NgMap'];
export {TrailUpdateController}
