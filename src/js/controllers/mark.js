
const mapId = "markMap"

function MarkController (MapsService, UsersService, $stateParams) {
  let vm = this;

  //params specific to page
  MapsService.trail_id = $stateParams.id;
  MapsService.delete = false;
  MapsService.newMarkerAllow = true;
  MapsService.snap = true;
  MapsService.markerArray = [];
  MapsService.panel={};
  MapsService.regraphElevation = false;
  MapsService.trailInfo = {};
  MapsService.hikePolys = [];

  vm.MapsService = MapsService;
  vm.placeMarker = placeMarker;
  vm.placeLatLngMarker = placeLatLngMarker;
  vm.placeDistanceMarker = placeDistanceMarker;
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
        MapsService.getPoints().then(function(pointsResp){
          let points = pointsResp.data;
          points.forEach(function (waypoint) {
            let marker = MapsService.loadPointMarker(waypoint)
            MapsService.dragListener(marker, waypoint)
            MapsService.clickListener(marker, waypoint)
          });
          MapsService.initChart(MapsService.trailPath, MapsService.markerArray, true)
        })


        //set trail data
        MapsService.trailPath = encoding.decodePath(resp.data.path);
        MapsService.trailInfo = resp.data;
        MapsService.trailInfo.distance = Number(resp.data.distance.toFixed(2));
        MapsService.trailInfo.max_elevation = Number(resp.data.max_elevation.toFixed(2));
        MapsService.trailInfo.min_elevation = Number(resp.data.min_elevation.toFixed(2));

        //create line, center map, and initialize search bar
        MapsService.createTrailPoly();
        MapsService.map.setMapTypeId('terrain');
        MapsService.centerMap();
        MapsService.initSearch();

        let filteredPath = MapsService.filterPath(8, 34);
        MapsService.createHikePoly(filteredPath);
        // console.log(filteredPath)
        // filteredPath.forEach(function(waypoint){
        //   MapsService.placeMarker(waypoint);
        // })
      })
    })
  }


  function placeMarker(event){
    let waypoint = event.latLng;
    let marker = MapsService.placeMarker(waypoint);
    MapsService.dragListener(marker, waypoint)
    MapsService.clickListener(marker, waypoint)
  }

  function placeLatLngMarker(){
    let waypoint = new google.maps.LatLng(MapsService.panel.lat, MapsService.panel.lng)
    let marker = MapsService.placeMarker(waypoint);
    MapsService.dragListener(marker, waypoint)
    MapsService.clickListener(marker, waypoint)
  }

  function placeDistanceMarker(){
    let inputDist = Number(MapsService.panel.distance);
    let waypoint = MapsService.distToWaypoint(inputDist);
    let marker = MapsService.placeMarker(waypoint);
    MapsService.dragListener(marker, waypoint)
    MapsService.clickListener(marker, waypoint)
  }

  function savePoint(){
    MapsService.newMarkerAllow = true;
    MapsService.panel.trail_id = Number($stateParams.id);
    MapsService.savePoint(MapsService.panel).then((resp) => {
      vm.MapsService.currentMarker.id = resp.data.id;
    })
  }

  function editPoint(){
    MapsService.newMarkerAllow = true;
    MapsService.panel.id = MapsService.currentMarker.id;
    MapsService.editPoint(MapsService.panel).then((resp) => {
    })
  }

  function deletePoint(){
    MapsService.deletePoint().then((resp) => {
      MapsService.newMarker = true;
      let markIndex = MapsService.markerArray.indexOf(MapsService.markerArray);
      MapsService.markerArray.splice(markIndex, 1);
      MapsService.currentMarker.setMap(null); 
      MapsService.chartMark();
      MapsService.updatePanel();
    })
  }

}

MarkController.$inject = ['MapsService', 'UsersService', '$stateParams'];
export {MarkController}
