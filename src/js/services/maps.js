function MapsService ($http, ChartsService, UsersService, NgMap, icons, $rootScope) {

  const SERVER = "https://trails-back-end.herokuapp.com/";

  let vm = this;

  vm.getMap = getMap;
  vm.getTrail = getTrail;
  vm.getPoints = getPoints;
  vm.createTrailPoly = createTrailPoly;
  vm.centerMap = centerMap;
  vm.initSearch = initSearch;
  vm.loadTrailMarker = loadTrailMarker;
  vm.loadPointMarker = loadPointMarker;
  vm.dragListener = dragListener;
  vm.clickListener = clickListener;
  vm.closestPath = closestPath;
  vm.placeMarker = placeMarker;

  vm.editTrail = editTrail;
  vm.deleteTrail = deleteTrail;
  vm.newTrail = newTrail;
  vm.getTrailList = getTrailList;
  vm.savePoint = savePoint;
  vm.editPoint = editPoint;
  vm.deletePoint = deletePoint;
  vm.initChart = initChart;
  vm.chartMark = chartMark;
  vm.updateMarker = updateMarker;
  vm.updatePanel = updatePanel;


  vm.waypoint = {};
  vm.trailInfo = {};

  const metersFeetConversion = 3.28084;
  const metersMilesConversion = 0.000621371;
  const encoding = google.maps.geometry.encoding;
  const spherical = google.maps.geometry.spherical;




// -----------------------------------------------------------------------

  // Get map

  function getMap(id){
    vm.markerArray.forEach(function (marker){
      marker.setMap(null);
    })
    vm.trailInfo = {};
    return NgMap.getMap(id)
  }

// -----------------------------------------------------------------------

  // Get existing Trail

  function getTrail(){
    return $http.get(`${SERVER}trails/${vm.trail_id}`);
  }

  function getPoints(){
    return $http.get(`${SERVER}trails/${vm.trail_id}/points`);
  }

// -----------------------------------------------------------------------

  //Create line and Center map

  function createTrailPoly() {
    if (vm.trailPoly){
      vm.trailPoly.setMap(null);
    }
    var trailPoly = new google.maps.Polyline({
        path: vm.trailPath,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
      });
    trailPoly.setMap(vm.map);
    vm.trailPoly = trailPoly;
  }

  function centerMap() {
    var latlngbounds = new google.maps.LatLngBounds();
    vm.trailPath.forEach(function (waypoint) {
      latlngbounds.extend(waypoint)
    })
    vm.map.fitBounds(latlngbounds);
  }

  function initSearch () {
    var input = document.getElementById('pac-input')
    var searchBox = new google.maps.places.SearchBox(input);
    vm.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    //Listener for selecting an autocomplete option from the dropdown
    vm.map.addListener('bounds_changed', function() {
      searchBox.setBounds(vm.map.getBounds());
    });
    // get place information when the user makes a selection (may leave this out because it's not displaying anything currently)
    searchBox.addListener('places_changed', function() {
      var places = searchBox.getPlaces();
      if (places.length == 0) {
        return;
      }
      // For each place, get the name and location.
      var bounds = new google.maps.LatLngBounds();
      places.forEach(function(place) {
        if (!place.geometry) {
          console.log("Returned place contains no geometry");
          return;
        }
        if (place.geometry.viewport) {
          // Set the viewport if available. This makes the map display more mobile-friendly. Only for geocodes.
          bounds.union(place.geometry.viewport);
        } else {
          bounds.extend(place.geometry.location);
        }
      });
      vm.map.fitBounds(bounds);
    });
  }

// ------------------------------------------------------------------------

  // Load Markers

  function loadTrailMarker(waypoint){
    var marker = new google.maps.Marker({
        map: vm.map,
        position: waypoint,
        icon: icons.blaze,
        draggable: true
    });
    return marker;
  }

  function loadPointMarker(waypoint){
    let position = new google.maps.LatLng(waypoint.lat, waypoint.lng)
    let insert = closestPath(position)
    var marker = new google.maps.Marker({
        map: vm.map,
        position: position,
        icon: icons.pointSaved,
        draggable: true
    });
    marker.title = waypoint.title;
    marker.description = waypoint.description;
    marker.img_url = waypoint.img_url;
    marker.shelter = waypoint.shelter;
    marker.campsite = waypoint.campsite;
    marker.water = waypoint.water;
    marker.view = waypoint.view;
    marker.road = waypoint.road;
    marker.parking = waypoint.parking;
    marker.resupply = waypoint.resupply;
    marker.distance = insert[2]
    marker.id = waypoint.id;
    vm.markerArray.push(marker)
    console.log(vm.markerArray)
    return marker;
  }

// ----------------------------------------------------------------------

  // Listeners

  function dragListener (marker, waypoint, $scope){
      google.maps.event.addListener(marker, 'dragend', function (event){
        if (!vm.snap){
          var index = vm.trailPath.indexOf(waypoint);
          waypoint = marker.getPosition();
          vm.trailPath[index] = waypoint;
          vm.trailPoly.setPath(vm.trailPath);
          $scope.$apply(function (){
            updatePanel()
          });
        } else {
          waypoint = marker.getPosition();
          let insert = closestPath(waypoint);
          waypoint = spherical.interpolate(vm.trailPath[insert[0]-1], vm.trailPath[insert[0]], insert[1])
          marker.setPosition(waypoint);
          marker.setIcon(icons.pointUnsaved);
          $scope.$apply(function (){
            marker.distance = insert[2];
            vm.currentMarker = marker;
            updatePanel()
          });
        }
        if(vm.trailPath.length > 1) {
          chartMark();
        }


    })
  }

  function clickListener (marker, waypoint, $scope){
      google.maps.event.addListener(marker, 'click', function (event){
        waypoint = marker.getPosition();
        if (vm.delete){
          if (!vm.snap){
            var index = vm.trailPath.indexOf(waypoint);
            vm.trailPath.splice(index, 1);
            vm.trailPoly.setPath(vm.trailPath);
          }
          var markIndex = vm.markerArray.indexOf(marker);
          vm.markerArray.splice(markIndex, 1);
          marker.setMap(null);
          if(vm.trailPath.length > 1) {
            chartMark();
          }
          $scope.$apply(function(){
            vm.currentMarker = null;
            vm.newMarkerAllow = true;
            updatePanel()
          });
        } else {
          $scope.$apply(function(){
            vm.currentMarker = marker;
            updatePanel()
        });

        }
        $scope.$apply(function(){
          updatePanel()
        });
    })
  }

// -----------------------------------------------------------------------

  //Closest Path (snap function)

function closestPath(waypoint){
  var pathDistances = [];
  var percentage = [];
  for (var i=0; i<vm.trailPath.length-1; i++){
    let a = spherical.computeDistanceBetween(waypoint, vm.trailPath[i+1]);
    let b = spherical.computeDistanceBetween(waypoint, vm.trailPath[i]);
    let c = spherical.computeDistanceBetween(vm.trailPath[i], vm.trailPath[i+1]);
    let A = Math.acos((Math.pow(b,2)+Math.pow(c,2)-Math.pow(a,2))/(2*b*c))
    let B = Math.acos((Math.pow(c,2)+Math.pow(a,2)-Math.pow(b,2))/(2*a*c))
    let C = Math.PI-B-A;

    if (A>B && A>C){
      pathDistances[i] = b;
      percentage[i]=0;
    } else if (B>C){
      pathDistances[i] = a;
      percentage[i]=1;
    } else {
      pathDistances[i] = a*Math.sin(B);
      percentage[i]=Math.sqrt(Math.pow(b,2) - Math.pow(pathDistances[i],2))/c;
    }
  }
  let minIndex = pathDistances.reduce((iMin, x, i, arr) => x < arr[iMin] ? i : iMin, 0) + 1;
  let finalPercentage = percentage[minIndex-1];
  let path1 = vm.trailPath.slice(0, [minIndex]);
  let path2 = vm.trailPath.slice(0, [minIndex+1]);
  let distance = (spherical.computeLength(path1)+ (spherical.computeLength(path2) - spherical.computeLength(path1))*finalPercentage)
  * metersMilesConversion;

  return [minIndex, finalPercentage, distance];
}

  // --------------------------------------------------------------

    //Place marker

  function placeMarker(waypoint) {
    if (!vm.delete){
      var markerDistance;
      //change path and change waypoint if snap
      if ((vm.insert === "midInsert" || vm.snap) && vm.trailPath.length>0){
        var insert = closestPath(waypoint)
        markerDistance = insert[2];
        if (vm.snap){
          var snapWaypoint = spherical.interpolate(vm.trailPath[insert[0]-1], vm.trailPath[insert[0]], insert[1])
          waypoint = snapWaypoint;
        } else {
          vm.trailPath.splice(insert[0], 0, waypoint);
          vm.trailPoly.setPath(vm.trailPath);
        }

      } else if (vm.insert === "frontInsert") {
        vm.trailPath.unshift(waypoint);
        vm.trailPoly.setPath(vm.trailPath);
        markerDistance = 0;
      } else {
        vm.trailPath.push(waypoint);
        vm.trailPoly.setPath(vm.trailPath);
        markerDistance = spherical.computeLength(vm.trailPath)*metersMilesConversion;
      }
      //create marker
      var marker = new google.maps.Marker({
          position: waypoint,
          map: vm.map,
          draggable: true,
          icon: icons.blaze
      });
      if (!vm.newMarkerAllow && vm.currentMarker){
        let index = vm.markerArray.indexOf(vm.currentMarker);
        vm.markerArray.splice(index, 1);
        vm.currentMarker.setMap(null);
      }
      //set to unsaved icon if snap
      if (vm.snap){
        console.log(marker)
        marker.setIcon(icons.pointUnsaved);
        vm.newMarkerAllow = false;
      }
      //re-chart
      if(vm.trailPath.length > 1) {
        chartMark();
      }
      marker.distance = Number(markerDistance.toFixed(2));
      console.log(marker.distance)
      vm.markerArray.push(marker)
      vm.currentMarker = marker;
      updatePanel();
      return marker;
    }

  }

  // ----------------------------------------------------------------------------------

    // update Panel

  function updatePanel(){
    if (vm.currentMarker){
      let waypoint = vm.currentMarker.getPosition();
      vm.panel.lat = waypoint.lat();
      vm.panel.lng = waypoint.lng();
      vm.panel.title = vm.currentMarker.title;
      vm.panel.description = vm.currentMarker.description;
      vm.panel.img_url = vm.currentMarker.img_url;
      vm.panel.distance = vm.currentMarker.distance;
      vm.panel.shelter = vm.currentMarker.shelter;
      vm.panel.campsite = vm.currentMarker.campsite;
      vm.panel.water = vm.currentMarker.water;
      vm.panel.view = vm.currentMarker.view;
      vm.panel.road = vm.currentMarker.road;
      vm.panel.parking = vm.currentMarker.parking;
      vm.panel.resupply = vm.currentMarker.resupply;
    } else {
      vm.panel.distance = "";
      vm.panel.lat = "";
      vm.panel.lng = "";
      vm.panel.title = "";
      vm.panel.description = "";
      vm.panel.img_url = "";
      vm.panel.shelter = false;
      vm.panel.campsite = false;
      vm.panel.water = false;
      vm.panel.view = false;
      vm.panel.road = false;
      vm.panel.parking = false;
      vm.panel.resupply = false;
    }
      vm.trailLength = spherical.computeLength(vm.trailPath)*metersMilesConversion;
  }



  function updateMarker(){
      if (vm.currentMarker){
        vm.currentMarker.lat = vm.panel.lat;
        vm.currentMarker.lng = vm.panel.lng;
        vm.currentMarker.title = vm.panel.title;
        vm.currentMarker.description = vm.panel.description;
        vm.currentMarker.img_url = vm.currentMarker.img_url;
        vm.currentMarker.distance = vm.panel.distance;
        vm.currentMarker.shelter = vm.panel.shelter;
        vm.currentMarker.campsite = vm.panel.campsite;
        vm.currentMarker.water = vm.panel.water;
        vm.currentMarker.view = vm.panel.view;
        vm.currentMarker.road = vm.panel.road;
        vm.currentMarker.parking = vm.panel.parking;
        vm.currentMarker.resupply = vm.panel.resupply;
      } else {
        vm.currentMarker = {};
      }
  }

// ---------------------------------------------------------------------

  // --- Button Section -------

  function newTrail (newTrail){
      let req = {
      url: `${SERVER}trails`,
      data: newTrail,
      method: 'POST',
      headers: UsersService.getHeaders()
    };
    return $http(req);
  }

  function editTrail (id, newTrail){
    let req = {
      url: `${SERVER}trails/${id}`,
      data: newTrail,
      method: 'PATCH',
      headers: UsersService.getHeaders()
    };

    return $http(req);
  }

  function deleteTrail(id){
    let req = {
      url: `${SERVER}trails/${id}`,
      method: 'DELETE',
      headers: UsersService.getHeaders()
    };
    return $http(req);
  }

  function deletePoint(){
    MapsService.currentMarker = null; 
    let req = {
      url: `${SERVER}points/${vm.currentMarker.id}`,
      method: 'DELETE',
      headers: UsersService.getHeaders()
    };
    return $http(req);
  }

  function savePoint(waypoint){
    updateMarker();
    chartMark();
    vm.currentMarker.setIcon(icons.pointSaved)
    let req = {
      url: `${SERVER}points`,
      data: waypoint,
      method: 'POST',
      headers: UsersService.getHeaders()
    };
    return $http(req);
  }

  function editPoint(waypoint){
    updateMarker();
    chartMark();
    vm.currentMarker.setIcon(icons.pointSaved)
    let req = {
      url: `${SERVER}points/${vm.currentMarker.id}`,
      data: waypoint,
      method: 'PATCH',
      headers: UsersService.getHeaders()
    };
    return $http(req);
  }

  // ---------------------------------------------------------------------------

    //Trail List

  function getTrailList(){
    return $http.get(`${SERVER}trails`)
  }

  function initChart(){
    console.log(vm.markerArray)
    ChartsService.chart(vm.trailPath, vm.markerArray, true);
  }

  function chartMark(){
    console.log("hi")
    ChartsService.chart(vm.trailPath, vm.markerArray, vm.regraphElevation);
    vm.trailInfo.min_elevation = ChartsService.min_elevation;
    vm.trailInfo.max_elevation = ChartsService.max_elevation;
    vm.trailInfo.distance = Number((spherical.computeLength(vm.trailPath)*metersMilesConversion).toFixed(2));
    updateMarker();
  }
};

MapsService.$inject = ['$http', 'ChartsService', 'UsersService', 'NgMap', 'icons', '$rootScope'];
export { MapsService };
