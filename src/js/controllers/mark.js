
const mapId = "markMap"

function MarkController (MapsService, $stateParams, $scope) {
  let vm = this;

  //params specific to page
  MapsService.trail_id = $stateParams.id;
  MapsService.delete = false;
  // MapsService.insert = "backInsert";
  MapsService.newMarkerAllow = true;
  MapsService.snap = true;
  MapsService.markerArray = [];
  MapsService.panel={};

  vm.MapsService = MapsService;
  vm.placeMarker = placeMarker;
  vm.savePoint = savePoint;
  vm.editPoint = editPoint;
  vm.deletePoint = deletePoint;

  const metersFeetConversion = 3.28084;
  const metersMilesConversion = 0.000621371;
  const encoding = google.maps.geometry.encoding;
  const spherical = google.maps.geometry.spherical;

  init();


  function init(){
    console.log($scope)
    //initial variables
    vm.status = "Add Points to a Trail!";

    MapsService.getMap(mapId).then(function (map){
      MapsService.map=map;
      MapsService.getTrail(map).then(function (resp){

        //add trail Markers and add listeners;
        MapsService.getPoints().then(function(resp){
          let points = resp.data;
          points.forEach(function (waypoint) {
            let marker = MapsService.loadPointMarker(waypoint)
            MapsService.dragListener(marker, waypoint, $scope)
            MapsService.clickListener(marker, waypoint, $scope)
          });
        })


        //set trail data
        MapsService.trailPath = encoding.decodePath(resp.data.path);
        MapsService.trailTitle = resp.data.title;
        MapsService.trailDistance = spherical.computeLength(MapsService.trailPath);

        //create line, center map, and initialize search bar
        MapsService.createTrailPoly();
        MapsService.centerMap();
        MapsService.initSearch();

        MapsService.initChart(MapsService.trailPath)
      })
    })
  }


  function placeMarker(event){
    let waypoint = event.latLng;
    let marker = MapsService.placeMarker(waypoint);
    MapsService.dragListener(marker, waypoint, $scope)
    MapsService.clickListener(marker, waypoint, $scope)
  }

  function savePoint(){
    MapsService.newMarkerAllow = true;
    MapsService.panel.trail_id = Number($stateParams.id);
    console.log(MapsService.panel.trail_id);
    MapsService.savePoint(MapsService.panel).then((resp) => {
      console.log(resp)
    })
  }

  function editPoint(){
    MapsService.newMarkerAllow = true;
    MapsService.panel.id = MapsService.currentMarker.id;
    MapsService.editPoint(MapsService.panel).then((resp) => {
      console.log(resp)

    })
  }

  function deletePoint(){
    vm.MapsService.newMarker = true;
    vm.MapsService.currentMarker.setMap(null);
    vm.MapsService.currentMarker = null;
  }
  
}

MarkController.$inject = ['MapsService', '$stateParams', '$scope'];
export {MarkController}
