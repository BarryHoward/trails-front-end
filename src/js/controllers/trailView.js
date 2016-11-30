const mapId = 'trailViewMap';

function TrailViewController (TrailsService, $stateParams) {
  let vm= this;
  vm.TrailsService = TrailsService;
  vm.getTrail = getTrail;
  vm.loadMarker = loadMarker;
  vm.drawLine = drawLine;
  vm.placeMarker = placeMarker;

  function init () {
    let trail_id = $stateParams.id;
    vm.markers = [];

    TrailsService.getMap(mapId, trail_id).then(function (map) {
      vm.map = map;

      vm.getTrail(trail_id);
      
    });


    var elevator = new google.maps.ElevationService;

  }

  init();

  function getTrail(id){
    TrailsService.getTrail(id).then(
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
    TrailsService.loadMarker(vm.map, vm.markers, waypoint)
  }

  function drawLine(){
    TrailsService.drawLine(vm.map, vm.markers)
  }

  function placeMarker(event){
    TrailsService.placeMarker(vm.markers, vm.map, event);
  }


}

TrailViewController.$inject = ['TrailsService', '$stateParams'];
export {TrailViewController}
