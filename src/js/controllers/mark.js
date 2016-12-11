
const mapId = "markMap"

function MarkController (MapsService, UsersService, $stateParams) {
  let vm = this;

  //params specific to page
  MapsService.trail_id = $stateParams.id;
  MapsService.delete = false;
  MapsService.snap = true;
  MapsService.regraphElevation = false;
  MapsService.draggable = true;

  vm.MapsService = MapsService;
  vm.placeMarker = placeMarker;
  vm.placeLatLngMarker = placeLatLngMarker;
  vm.placeDistanceMarker = placeDistanceMarker;
  vm.savePoint = savePoint;
  vm.editPoint = editPoint;
  vm.deletePoint = deletePoint;
  vm.setInterval = setInterval;

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
          MapsService.initChart(MapsService.trailPath, MapsService.markerArray, 0, true)
        })


        //set trail data
        MapsService.trailPath = encoding.decodePath(resp.data.path);
        MapsService.currentHike.path = MapsService.trailPath;
        MapsService.trailInfo = resp.data;
        MapsService.trailInfo.distance = Number(resp.data.distance.toFixed(2));
        MapsService.trailInfo.max_elevation = Number(resp.data.max_elevation.toFixed(2));
        MapsService.trailInfo.min_elevation = Number(resp.data.min_elevation.toFixed(2));

        //create line, center map, and initialize search bar
        MapsService.createTrailPoly();
        MapsService.map.setMapTypeId('terrain');
        MapsService.initSearch().then(MapsService.centerMap())

      })
    })
  }


  function setInterval(){
        let filteredPath = MapsService.filterPath(MapsService.panel.startInt, MapsService.panel.endInt);
        MapsService.createHikePoly(filteredPath);
        MapsService.centerMap();
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
    MapsService.panel.trail_id = Number($stateParams.id);
    MapsService.savePoint(MapsService.panel).then((resp) => {
      vm.MapsService.currentMarker.id = resp.data.id;
    })
  }

  function editPoint(){
    MapsService.panel.id = MapsService.currentMarker.id;
    let newPoint = {

    }
    MapsService.editPoint(MapsService.panel).then((resp) => {
    })
  }

  function deletePoint(){
    if (MapsService.currentMarker.id){
      MapsService.deletePoint().then((resp) => {
        let markIndex = MapsService.markerArray.indexOf(MapsService.markerArray);
        MapsService.markerArray.splice(markIndex, 1);
        MapsService.currentMarker.setMap(null);
        var index = MapsService.markerArray.indexOf(MapsService.currentMarker);
        MapsService.markerArray.splice(index, 1);
        MapsService.currentMarker = undefined;
        MapsService.chartMark();
        MapsService.updatePanel(true);
      });
    } else {
        let markIndex = MapsService.markerArray.indexOf(MapsService.markerArray);
        MapsService.markerArray.splice(markIndex, 1);
        MapsService.currentMarker.setMap(null);
        MapsService.chartMark();
        MapsService.updatePanel(true);
    }
  }

}

MarkController.$inject = ['MapsService', 'UsersService', '$stateParams'];
export {MarkController}
