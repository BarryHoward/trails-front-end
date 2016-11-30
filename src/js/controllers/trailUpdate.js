
const mapId = "trailUpdateMap"

function TrailUpdateController ($stateParams, TrailsService) {
  let vm = this;

  vm.placeMarker = placeMarker;
  vm.updateTrail = updateTrail;
  vm.TrailsService = TrailsService;

  vm.markers = [];
  vm.currentTrail = {};

  function init () {
    let trail_id = $stateParams.id
    TrailsService.getMap(mapId, trail_id);
  }

  init();

  function placeMarker(event){
    TrailsService.placeMarker(event);
  }

  function updateTrail(event){
    TrailsService.updateTrail(event, $stateParams.id)
  }





}

TrailUpdateController.$inject = ['$stateParams', 'TrailsService'];
export {TrailUpdateController}
