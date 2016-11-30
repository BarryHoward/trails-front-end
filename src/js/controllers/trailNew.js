const mapId = "trailNewMap"

function TrailNewController (TrailsService) {

  let vm = this;

  vm.placeMarker = placeMarker;
  vm.addNewTrail = addNewTrail;
  vm.TrailsService = TrailsService;


  function init () {
    vm.markers = [];

    TrailsService.getMap(mapId).then(function (map) {
      vm.map = map;
    })
  }

  init();

  function placeMarker(event){
    TrailsService.placeMarker(vm.markers, vm.map, event);
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
    newTrail.title = vm.trailTitle;

    TrailsService.newTrail(newTrail);
  }

}

TrailNewController.$inject = ['TrailsService'];
export { TrailNewController }
