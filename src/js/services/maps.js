function MapsService (HttpService, ChartsService, NgMap) {

  let vm = this;
  vm.drawLine = drawLine;
  vm.getMap = getMap;
  vm.loadMarker = loadMarker;
  vm.placeMarker = placeMarker;
  vm.getTrail = getTrail;
  vm.updateTrail = updateTrail;
  vm.deleteTrail = deleteTrail;
  vm.newTrail = newTrail;
  vm.initMap = initMap;


  function getMap(id){
     return NgMap.getMap(id)
  }

  function getTrail(id, map, draggable){
    return new Promise(function (resolve, reject) {
    HttpService.getTrail(id).then(
      (resp) => {
        var markers = [];
        resp.data.waypoints.forEach(function (waypoint) {
          vm.loadMarker(map, markers, waypoint, draggable)
        });
        vm.drawLine(map, markers)
        vm.initMap(map, markers);
        ChartsService.chart(markers);
        var Trail = {markers: markers, title: resp.data.trailInfo.title}
        resolve(Trail);
      }, (reject) => {
          console.log(reject)
      });
    })
  }

  function drawLine(map, markers) {
    if (vm.line){
      vm.line.setMap(null);
    }
    var addLine = new google.maps.Polyline({
        path: markers,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
      });

    addLine.setMap(map);
    vm.line = addLine;
  }

  function loadMarker(map, markers, waypoint, draggable){
    var myLatlng = new google.maps.LatLng(waypoint.lat, waypoint.lng)
    var marker = new google.maps.Marker({
        map: map,
        draggable: draggable,
        animation: google.maps.Animation.DROP,
        position: myLatlng,
        lat: myLatlng.lat(),
        lng: myLatlng.lng(),
        totalDistance: waypoint.totalDistance
    });
    markers.push(marker);
    if (draggable){
      dragListener(marker, markers, map)
      deleteListener(marker, markers, map)
    }
  }

  // Listeners ---------------------------------------------------------

  function dragListener (marker, markers, map){
      google.maps.event.addListener(marker, 'dragend', function (event){
        marker.lat = marker.getPosition().lat();
        marker.lng = marker.getPosition().lng();
        vm.drawLine(map, markers);
        updateDist(markers);
    })
  }

  function deleteListener (marker, markers, map){
      google.maps.event.addListener(marker, 'click', function (event){
        if (vm.delete){
          var index = markers.indexOf(marker);
          if (index > -1) {
            markers.splice(index, 1);
          }
          marker.setMap(null);
          vm.drawLine(map, markers);
          updateDist(markers);
        }
    })
  }

  // --------------------------------------------------------------------


  //  Place Marker -----------------------------------------------------

  function placeMarker(markers, map, location) {

    if (!vm.delete){
      var marker = new google.maps.Marker({
          position: location.latLng,
          map: map,
          draggable: true,
          lat: location.latLng.lat(),
          lng: location.latLng.lng(),
      });

      if (vm.insert === "midInsert" && markers.length>0){
        midInsert(markers, location, marker)
      } else if (vm.insert === "frontInsert") {
        markers.unshift(marker);
      } else {
        markers.push(marker);
      }
      dragListener(marker, markers, map)
      deleteListener(marker, markers, map)
      updateDist(markers);
      vm.drawLine(map, markers);
      if(markers.length !== 1) {
        ChartsService.chart(markers);
      }
    }
  }

  function midInsert(markers, location, marker){
      let dist = [];
      for (var i=0; i<markers.length; i++){
        dist[i] = google.maps.geometry.spherical.computeDistanceBetween(location.latLng, markers[i].position)
      }
      let minIndex = dist.reduce((iMax, x, i, arr) => x < arr[iMax] ? i : iMax, 0);
      var insertIndex;
      if (minIndex === 0){
        markers.splice(1, 0, marker);
        insertIndex = 1;
        return insertIndex;
      } else if (minIndex === markers.length-1){
        insertIndex = markers.length-1;
        markers.splice(markers.length-1, 0, marker)

        return insertIndex;
      } else {
        let markBefore = markers[minIndex-1];
        let markMin = markers[minIndex];
        let markAfter = markers[minIndex +1];

        let beforeV = {y: markBefore.lat - markMin.lat, x: markBefore.lng - markMin.lng}
        let afterV = {y: markAfter.lat - markMin.lat, x: markAfter.lng - markMin.lng}
        let newV = {y: marker.lat - markMin.lat, x: marker.lng - markMin.lng}

        let beforeA = Math.asin(beforeV.y/(Math.sqrt(Math.pow(beforeV.x, 2)+ Math.pow(beforeV.y, 2))));
        let afterA = Math.asin(afterV.y/(Math.sqrt(Math.pow(afterV.x, 2)+ Math.pow(afterV.y, 2))));
        let newA = Math.asin(newV.y/(Math.sqrt(Math.pow(newV.x, 2)+ Math.pow(newV.y, 2))));
        if (beforeV.x<0){
            beforeA = Math.PI - beforeA;
        }
        if (afterV.x<0){
            afterA = Math.PI - afterA;
        }
        if (newV.x<0){
            newA = Math.PI - newA;
        }          

        let beforeDif = Math.min((2 * Math.PI) - Math.abs(beforeA - newA), Math.abs(beforeA - newA))
        let afterDif = Math.min((2 * Math.PI) - Math.abs(afterA - newA), Math.abs(afterA - newA))

        if (beforeDif<afterDif){
          insertIndex = minIndex;
        } else {
          insertIndex = minIndex+1;
        }
         markers.splice(insertIndex, 0, marker);
         return insertIndex;
      }
  }

  function updateDist (markers){

    for (var i=0; i<markers.length; i++){
      if (i===0){
        markers[i].totalDistance =0;
      } else {
        var distAdded = google.maps.geometry.spherical.computeDistanceBetween(markers[i-1].position, markers[i].position)
        markers[i].totalDistance = markers[i-1].totalDistance + distAdded;
      }
    }
  }

//  Place Marker -----------------------------------------------------

  // --- Button Section -------

  function newTrail (markers, trailTitle){
    return new Promise(function (resolve, reject) {
      let newTrail = {};
      newTrail.waypoints = [];
      markers.forEach(function (marker) {
        let waypoint = {};
        waypoint.lat = marker.lat;
        waypoint.lng = marker.lng;
        waypoint.totalDistance = marker.totalDistance;
        newTrail.waypoints.push(waypoint);
      });
      newTrail.title = trailTitle;
      HttpService.newTrail(newTrail).then((resp) => {
          resolve();
        }, (reject) => {
          console.log(reject)
        });
    })
  }

  function updateTrail (markers, trailTitle, id){
    return new Promise(function (resolve, reject) {
      let newTrail = {};
      newTrail.waypoints = [];
      markers.forEach(function (marker) {
        let waypoint = {};
        waypoint.lat = marker.lat;
        waypoint.lng = marker.lng;
        waypoint.totalDistance = marker.totalDistance;
        newTrail.waypoints.push(waypoint);
      });
      newTrail.title = trailTitle;
      HttpService.updateTrail(newTrail, id).then((resp) => {
          resolve();
        }, (reject) => {
          console.log(reject)
        });
    })
  }

  function deleteTrail(id){
    return HttpService.deleteTrail(id);
  }

  // -----------------------

  // -- Jack's section ------

  function initMap(map, markers) {
    var latlngbounds = new google.maps.LatLngBounds();
    markers.forEach(function (marker) {
      latlngbounds.extend(marker.position)
      map.fitBounds(latlngbounds);
    })
  }

  // ---------------------------
};

MapsService.$inject = ['HttpService', 'ChartsService', 'NgMap'];
export { MapsService };
