const SERVER = "https://trails-back-end.herokuapp.com/"

function HomeController ($state, NgMap, $http) {
  let vm = this;
  vm.placeMarker = placeMarker;

  // console.log('vm.map is: ', vm.map)
  function init(){
      getMap('homeMap');
      vm.markers= [];


      let testData = {title: "Test Trail 4", waypoints: [{lat: 5.2, lng: -100.5}, {lat: -25.363, lng: 131.044}, {lat: -50.3432, lng: 23.1231}]}
      $http.post(`${SERVER}trails`, testData).then((resp) => {
        console.log(resp.data)
      }, (reject) => {
        console.log(reject)
      })

      $http.get(`${SERVER}trails/1`).then((resp) => {
        console.log(resp.data)
      }, (reject) => {
        console.log(reject)
      })
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

HomeController.$inject = ['$state', 'NgMap', '$http'];
export {HomeController};
