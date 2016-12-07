
const mapId = "markMap"

function MarkController (MapsService, UsersService, $stateParams, $scope) {
  let vm = this;

  //params specific to page
  MapsService.trail_id = $stateParams.id;
  MapsService.delete = false;
  // MapsService.insert = "backInsert";
  MapsService.newMarkerAllow = true;
  MapsService.snap = true;
  MapsService.markerArray = [];
  MapsService.panel={};
  MapsService.regraphElevation = false;

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
    vm.loggedIn = UsersService.isLoggedIn();
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
          console.log(MapsService.markerArray)
          MapsService.initChart(MapsService.trailPath, MapsService.markerArray, true)
        })


        //set trail data
        MapsService.trailPath = encoding.decodePath(resp.data.path);
        MapsService.trailInfo.title = resp.data.title;
        MapsService.trailInfo.distance = spherical.computeLength(MapsService.trailPath);
        MapsService.trailInfo.img_url = resp.data.img_url;
        MapsService.trailInfo.description = resp.data.description;
        MapsService.trailInfo.maxElevation = resp.data.max_elevation;
        MapsService.trailInfo.minElevation = resp.data.min_elevation;
        MapsService.trailInfo.owner = resp.data.username;

        //create line, center map, and initialize search bar
        MapsService.createTrailPoly();
        MapsService.centerMap();
        MapsService.initSearch();
        console.log(MapsService)


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
    MapsService.savePoint(MapsService.panel).then((resp) => {
      // console.log(resp)
      vm.MapsService.currentMarker.id = resp.data.id;
    })
  }

  function editPoint(){
    MapsService.newMarkerAllow = true;
    MapsService.panel.id = MapsService.currentMarker.id;
    MapsService.editPoint(MapsService.panel).then((resp) => {
      // console.log(resp)

    })
  }

  function deletePoint(){
    MapsService.deletePoint().then((resp) => {
      vm.MapsService.newMarker = true;
      vm.MapsService.currentMarker.setMap(null);
      vm.MapsService.currentMarker = null;
      vm.MapsService.updatePanel();
    })
  }

}

MarkController.$inject = ['MapsService', 'UsersService', '$stateParams', '$scope'];
export {MarkController}
