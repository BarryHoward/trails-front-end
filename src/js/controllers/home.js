function HomeController ($state, NgMap) {
  let vm = this;
  vm.placeMarker = placeMarker;

  // console.log('vm.map is: ', vm.map)
  function init(){
      getMap('homeMap');
      vm.markers= [];
  }

  init();


  function placeMarker(location) {
    // console.log(vm.map.getTotalMarkers());
      var latLong = {lat: -25.363, lng: 131.044};
      var marker = new google.maps.Marker({
          position: location.latLng,
          map: vm.map
      });
      console.log(location.latLng);
      vm.markers.push(marker);
      console.log(vm.markers);
  }

  function getMap(id){
    NgMap.getMap(id).then(function(map) {
      vm.map = map;
    });
  }


};

HomeController.$inject = ['$state', 'NgMap'];
export {HomeController};
