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
  vm.filterPath = filterPath;
  vm.distToWaypoint = distToWaypoint;

  const metersFeetConversion = 3.28084;
  const metersMilesConversion = 0.000621371;
  const encoding = google.maps.geometry.encoding;
  const spherical = google.maps.geometry.spherical;




// -----------------------------------------------------------------------

  // Get map

  function getMap(id){

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



  function centerMap() {
    var latlngbounds = new google.maps.LatLngBounds();
    vm.currentPath.forEach(function (waypoint) {
      latlngbounds.extend(waypoint)
    })
    vm.map.fitBounds(latlngbounds);
  }

  function initSearch () {
    var input = document.getElementById('pac-input')
    var searchBox = new google.maps.places.SearchBox(input);
    vm.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    google.maps.event.trigger(vm.map, "resize");
    //Listener for selecting an autocomplete option from the dropdown
    vm.map.addListener('bounds_changed', function() {
      google.maps.event.trigger(vm.map, "resize");
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
    return marker;
  }

// ----------------------------------------------------------------------

  // Listeners

  function dragListener (marker, waypoint){
      google.maps.event.addListener(marker, 'dragend', function (event){
        if (!vm.snap){
          var index = vm.trailPath.indexOf(waypoint);
          waypoint = marker.getPosition();
          vm.trailPath[index] = waypoint;
          vm.trailPoly.setPath(vm.trailPath);
          updatePanel();
        } else {
          waypoint = marker.getPosition();
          let insert = closestPath(waypoint);
          waypoint = spherical.interpolate(vm.trailPath[insert[0]-1], vm.trailPath[insert[0]], insert[1])
          marker.setPosition(waypoint);
          marker.setIcon(icons.pointUnsaved);
          marker.distance = round(insert[2], 2);
          vm.currentMarker = marker;
          updatePanel();
        }
        if(vm.trailPath.length > 1) {
          chartMark();
        }
    })
  }

  function clickListener (marker, waypoint){
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
          if (vm.trailPath.length > 1) {
            chartMark();
          }
          vm.currentMarker = null;
          updatePanel()
        } else {
          vm.currentMarker = marker;
          updatePanel()
        }
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
    let A = Math.acos(Math.min((Math.pow(b,2)+Math.pow(c,2)-Math.pow(a,2))/(2*b*c), 1));
    let B = Math.acos(Math.min((Math.pow(c,2)+Math.pow(a,2)-Math.pow(b,2))/(2*a*c), 1));
    let C = Math.PI-B-A;

    if (A > (Math.PI/2)){
      pathDistances[i] = b;
      percentage[i]=0;
    } else if (B > (Math.PI/2)){
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
    console.log(waypoint.lat(), waypoint.lng())
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
          vm.currentPath = vm.trailPath;
          vm.trailPoly.setPath(vm.trailPath);
        }

      } else if (vm.insert === "frontInsert") {
        vm.trailPath.unshift(waypoint);
        vm.currentPath = vm.trailPath;
        vm.trailPoly.setPath(vm.trailPath);
        markerDistance = 0;
      } else {
        vm.trailPath.push(waypoint);
        vm.currentPath = vm.trailPath;
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
      //set to unsaved icon if snap
      if (vm.snap){
        marker.setIcon(icons.pointUnsaved);
      }
      //re-chart
      if(vm.trailPath.length > 1) {
        chartMark();
      }
      marker.distance = round(markerDistance, 2);
      vm.markerArray.push(marker)
      vm.currentMarker = marker;
      updatePanel();
      return marker;
    }

  }

  // ----------------------------------------------------------------------------------

    // update Panel/Marker

  function updatePanel(){
    safeApply(function(){
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
    })
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
    ChartsService.chart(vm.currentPath, vm.markerArray, true);
  }

  function chartMark(overide){
    ChartsService.chart(vm.currentPath, vm.markerArray, (vm.regraphElevation|| overide)).then(function(){
      safeApply(function(){
        vm.trailInfo.min_elevation = ChartsService.min_elevation;
        vm.trailInfo.max_elevation = ChartsService.max_elevation;
      })
    })
    vm.trailInfo.distance = round(spherical.computeLength(vm.trailPath)*metersMilesConversion, 2);
    updateMarker();
  }

  function round(input, places){
    return Number(input.toFixed(places));
  }

  function safeApply(fn) {
    var phase = $rootScope.$$phase;
    if(phase == '$apply' || phase == '$digest') {
      if(fn && (typeof(fn) === 'function')) {
        fn();
      }
    } else {
      $rootScope.$apply(fn);
    }
  };

  // ----------------- Filtering -------------------------------------------------

  function filterPath(start, end){
    if (start<=0 && end>=spherical.computeLength(vm.trailPath)*metersMilesConversion){
      vm.currentPath = vm.trailPath;
      vm.panel.startInt = 0;
      vm.panel.endInt = round(spherical.computeLength(vm.trailPath)*metersMilesConversion,2);
      showTrailPoly();
      centerMap();
      chartMark();
    } else {
      let filteredPath = vm.trailPath.filter(function(element, index){
        let waypointDistance = spherical.computeLength(vm.trailPath.slice(0, index+1))*metersMilesConversion;
        return (start<waypointDistance && waypointDistance <end)
      })
      filteredPath.unshift(distToWaypoint(start));
      filteredPath.push(distToWaypoint(end));
      vm.currentPath = filteredPath;
      createCurrentPoly(filteredPath);
      showCurrentPoly();
      centerMap();
      chartMark();
    }
  }

  function distToWaypoint(distance){
    let trail = vm.trailPath;
    let trailLength = spherical.computeLength(trail)*metersMilesConversion;
    if (distance<=0){
      vm.panel.startInt = 0;
      return trail[0];
    } else if (distance >= trailLength){
      vm.panel.endInt = trailLength;
      return trail[trail.length-1];
    } else{
      for (var i=0; i<trail.length; i++){
          let trailDist = spherical.computeLength(trail.slice(0, i+1))*metersMilesConversion;
          if (trailDist>=distance){
            let dist1 = spherical.computeLength(trail.slice(0, i))*metersMilesConversion;
            let dist2 = distance;
            let dist3 = trailDist;
            let percentage = (dist2 - dist1)/(dist3-dist1);
            return spherical.interpolate(trail[i-1], trail[i], percentage);
          }
      }
    }
  }

  //  Show Poly ----------------------------------


  function showTrailPoly(){
    vm.hikedTrailPoly.forEach(function(poly){
      poly.setOptions({strokeOpacity: 0})
    })
    vm.currentPoly.setOptions({strokeOpacity: 0});
    vm.trailPoly.setOptions({strokeColor: '#FF0000', strokeOpacity: 1.0, strokeWeight: 3})

  }

  function showHikedTrails(){
    vm.hikedTrailPoly.forEach(function (poly){
      poly.setOptions({strokeOpacity: 1})
    })
    vm.currentPoly.setOptions({strokeOpacity: 0});
    vm.trailPoly.setOptions({strokeColor: '#000000', strokeOpacity: 0.4, strokeWeight: 3});
  }

  function showCurrentPoly(){
    vm.hikedTrailPoly.forEach(function(poly){
      poly.setOptions({strokeOpacity: 0})
    })
    vm.currentPoly.setOptions({strokecolor: "#FF00FF", strokeOpacity: 1.0, strokeWeight: 4});
    vm.trailPoly.setOptions({strokeColor: '#000000', strokeOpacity: 0.4, strokeWeight: 3});
  }

  // Create Poly -----------------------------

  function createTrailPoly() {
    if (vm.trailPoly){
      vm.trailPoly.setMap(null);
    }
    var trailPoly = new google.maps.Polyline({
        path: vm.trailPath,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 3
      });
    trailPoly.setMap(vm.map);
    vm.trailPoly = trailPoly;
  }

  function createCurrentPoly(path){
    if (path[0] && path[1]){
        var hikePoly = new google.maps.Polyline({
          path: vm.currentPath,
          geodesic: true,
          strokeColor: "#FF00FF",
          strokeOpacity: 1.0,
          strokeWeight: 4
        });
        hikePoly.setMap(vm.map);
        if (vm.currentPoly) {
          vm.currentPoly.setMap(null);
        }
        vm.currentPoly = hikePoly;
    }
  }

  function createHikedTrailPoly(path){
    let index = hikedTrailPoly.length;
    index = index % hikedTrailColor.length;
    let color  = hikedTrailColor[index]
    if (path[0] && path[1]){
        var hikePoly = new google.maps.Polyline({
          path: vm.currentPath,
          geodesic: true,
          strokeColor: color,
          strokeOpacity: 1.0,
          strokeWeight: 4
        });
        hikePoly.setMap(vm.map);
        vm.hikedTrailPoly.push(hikePoly);
    }

  }




};




MapsService.$inject = ['$http', 'ChartsService', 'UsersService', 'NgMap', 'icons', '$rootScope'];
export { MapsService };
