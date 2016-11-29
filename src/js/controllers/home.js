const SERVER = "https://trails-back-end.herokuapp.com/"

function HomeController ($state, NgMap, $http) {
  let vm = this;
  vm.placeMarker = placeMarker;
  vm.addNewTrail = addNewTrail;
  vm.drawLine = drawLine;
  // console.log('vm.map is: ', vm.map)
  function init(){
      getMap('homeMap');
      vm.markers= [];

      //
      // let testData = {title: "Test Trail 4", waypoints: [{lat: 5.2, lng: -100.5}, {lat: -25.363, lng: 131.044}, {lat: -50.3432, lng: 23.1231}]}
      // $http.post(`${SERVER}trails`, testData).then((resp) => {
      //   console.log(resp.data)
      // }, (reject) => {
      //   console.log(reject)
      // })
      //
      // $http.get(`${SERVER}trails/1`).then((resp) => {
      //   console.log(resp.data)
      // }, (reject) => {
      //   console.log(reject)
      // })
  }

  init();


  function placeMarker(location) {
    // console.log(vm.map.getTotalMarkers());
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
      google.maps.event.addListener(marker, 'dragend', function (event){
        marker.lat = marker.getPosition().lat();
        marker.lng = marker.getPosition().lng();
        vm.drawLine();
      })
      // console.log(vm.markers);
      // console.log(vm.markers[0].getPosition())
  }

  function getMap(id){
    NgMap.getMap(id).then(function(map) {
      vm.map = map;
    });
  }

  function addNewTrail(trailData) {
      // console.log(vm.markers)
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


};

HomeController.$inject = ['$state', 'NgMap', '$http'];
export {HomeController};
