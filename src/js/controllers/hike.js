
const mapId = "hikeMap"

function HikeController (MapsService, UsersService, $stateParams) {
  let vm = this;

  //params specific to page
  MapsService.trail_id = $stateParams.trailId;
  MapsService.user_id = $stateParams.userId;
  MapsService.draggable = false;
  MapsService.regraphElevation = true;


  MapsService.hikedArray = [];
  MapsService.markerArray = [];
  MapsService.panel={};
  MapsService.trailInfo = {};
  MapsService.currentMarker = {};
  MapsService.currentHike ={};
  MapsService.currentHike.start = 0;
  MapsService.chartOffset = 0;

  vm.loggedIn = UsersService.isLoggedIn();
  vm.status = "Hike a Trail";


  vm.MapsService = MapsService;
  vm.setInterval = setInterval;
  vm.saveHike = saveHike;
  vm.editHike = editHike;
  vm.deleteHike = deleteHike;
  vm.gotoHiked = gotoHiked;
  vm.clearCurrent = clearCurrent;

  const metersFeetConversion = 3.28084;
  const metersMilesConversion = 0.000621371;
  const encoding = google.maps.geometry.encoding;
  const spherical = google.maps.geometry.spherical;

  init();

  function init(){


    MapsService.getMap(mapId).then(function (map){
      MapsService.map=map;
      MapsService.map.setMapTypeId('terrain');
      MapsService.map.setOptions({scrollwheel: false});
      MapsService.getTrail(map).then(function (resp){

        //add trail Markers and add listeners;
        MapsService.getPoints().then(function(pointsResp){
          let points = pointsResp.data;
          points.forEach(function (waypoint) {
            let marker = MapsService.loadPointMarker(waypoint)
            MapsService.dragListener(marker, waypoint)
            MapsService.clickListener(marker, waypoint)
          });
          MapsService.initChart()
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
        MapsService.initSearch().then(MapsService.centerMap())

        MapsService.getHikes().then(function(resp){
          console.log(resp.data)
          let previousHikes = resp.data;
          console.log(resp.data)
          previousHikes.forEach(function(hike){
            hike.path = encoding.decodePath(hike.path);
            MapsService.hikedArray.push(hike);
            hike.poly = MapsService.createHikedPoly(hike.path);
          })
          if (MapsService.hikedArray.length){
            MapsService.showHikedPoly();
          } else {
            MapsService.showTrailPoly();
          }
        })

      })
    })
  }

  function saveHike(){
    vm.status = "Adding Hike...";
    console.log(MapsService.currentHike)
    MapsService.updateHike();

    let newHike = MapsService.currentHike;
    if (!newHike.title){
      newHike.title = "Hike"
    }

    newHike.trail_id = Number($stateParams.id)
    let encodeString = encoding.encodePath(MapsService.currentHike.path);
    newHike.path = encodeString;
    newHike.trail_id = $stateParams.trailId;
    MapsService.saveHike(newHike).then(function (resp) {
      console.log(resp)
        vm.status = "Hike Saved";
        newHike.id = resp.data.id
        newHike.path = encoding.decodePath(MapsService.newHike.path);
        newHike.poly = MapsService.createHikedPoly(newHike.path)
        MapsService.safeApply(MapsService.hikedArray.push(newHike))
      }, (reject) => {
        console.log(reject)
    })
  }

  function editHike(){
    vm.status = "Editing Hike...";
    let newHike = MapsService.panel;
    newHike.start = MapsService.currentHike.start;
    newHike.end = MapsService.currentHike.end;
    newHike.distance = newHike.end-newHike.start;
    newHike.id = MapsService.currentHike.id;
    console.log(MapsService.currentHike)
    let encodeString = encoding.encodePath(MapsService.currentHike.path);
    newHike.path = encodeString;
    MapsService.editHike(newHike.id, newHike).then(function (resp) {
      console.log(resp)
        vm.status = "Hike Edited";
      }, (reject) => {
        console.log(reject)
    })
  }

  function deleteHike(){
    vm.status = "Deleting Hike...";
    let id = MapsService.currentHike.id;
    MapsService.deleteHike(id).then(function (resp) {
        vm.status = "Hike Edited";
        MapsService.currentHike.poly.setMap(null)
        var index = MapsService.hikedArray.indexOf(MapsService.currentHike);
        MapsService.hikedArray.splice(index, 1);
        clearCurrent();
      }, (reject) => {
        console.log(reject)
    })
    
  }

  function gotoHiked(id){
    let hiked = MapsService.hikedArray.find(function(element){
      return element.id === id;
    });
    MapsService.currentHike = hiked;
    MapsService.updateHikedPanel();
    MapsService.centerMap();
    MapsService.showSingleHiked(id);
    MapsService.chartHike(hiked.path)
    console.log(hiked)
  }

  function setInterval(){

      MapsService.filterTrailPath(Number(MapsService.panel.start), Number(MapsService.panel.end));
      MapsService.filterChartPath(Number(MapsService.panel.start), Number(MapsService.panel.end));
    if (MapsService.currentHike.poly){
      MapsService.currentHike.poly.setPath(MapsService.currentHike.path)
    }
  }

  function clearCurrent(){
    MapsService.showHikedPoly();
    MapsService.currentHike.path = MapsService.trailPath;
    MapsService.centerMap();
    MapsService.currentHike = {};
    MapsService.updateHikedPanel();

  }



}

HikeController.$inject = ['MapsService', 'UsersService', '$stateParams'];
export {HikeController}