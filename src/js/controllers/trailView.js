const mapId = 'trailViewMap';

function TrailViewController (TrailsService, $stateParams) {
  let vm= this;
  vm.TrailsService = TrailsService;

  function init () {
    let trail_id = $stateParams.id
    TrailsService.getMap(mapId, trail_id);
    var elevator = new google.maps.ElevationService;
    console.log(TrailsService.getMap(mapId, trail_id));
  }

  init();




}

TrailViewController.$inject = ['TrailsService', '$stateParams'];
export {TrailViewController}
