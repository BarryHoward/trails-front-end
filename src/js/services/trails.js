function TrailsService ($http, $cookies, NgMap) {

  const SERVER = "https://trails-back-end.herokuapp.com/"

  let vm = this;
  vm.drawLine = drawLine;
  vm.getMap = getMap;
  vm.loadMarker = loadMarker;
  vm.placeMarker = placeMarker;
  vm.getTrail = getTrail;
  vm.updateTrail = updateTrail;
  vm.deleteTrail = deleteTrail;
  vm.newTrail = newTrail;
  vm.getElevation = getElevation;
  vm.initMap = initMap;

  function getMap(id){
     return NgMap.getMap(id)
  }

  function getTrail(trail_id){
    return $http.get(`${SERVER}trails/${trail_id}`)
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
        var index = markers.indexOf(marker);
        vm.drawLine(map, markers);
        updateDist(index, markers);
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
          updateDist(index, markers);
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
        var newIndex = midInsert(markers, location, marker)
      } else if (vm.insert === "frontInsert") {
        markers.unshift(marker);
        var newIndex = 0;
      } else {
        markers.push(marker);
        var newIndex = markers.length-1;
      }
      dragListener(marker, markers, map)
      deleteListener(marker, markers, map)
      updateDist(newIndex, markers);
      vm.drawLine(map, markers);
      if(markers.length !== 1) {
        vm.getElevation(markers);
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

  function updateDist (index, markers){
    var prevDistance;
    var prevToNew;
    // add to front
    if (index === 0){
      markers[0].totalDistance = 0;
      prevDistance = 0;
      prevToNew = 0;

      // if only marker, leave function
      if (markers.length === 1){
        return;
      }
    } else if (index === markers.length-1){
      // var path = vm.line.getPath().getArray().slice(index-2);
      var distAdded = markers[index-1].totalDistance + google.maps.geometry.spherical.computeDistanceBetween(markers[index-1].position, markers[index].position)
      markers[index].totalDistance = distAdded;
      return;
    } else {
      // add to mid
      prevDistance = markers[index+1].totalDistance - markers[index-1].totalDistance;
      prevToNew =  google.maps.geometry.spherical.computeDistanceBetween (markers[index-1].position, markers[index].position);
      markers[index].totalDistance = markers[index-1].totalDistance + prevToNew;
    }

    // update other values
    var newToNext =  google.maps.geometry.spherical.computeDistanceBetween (markers[index].position, markers[index+1].position);
    var newDistance = prevToNew + newToNext;
    var distanceChange = newDistance - prevDistance;

    for (var i=index+1; i<markers.length; i++){
        markers[i].totalDistance += distanceChange;
    }

    // for (var i=index; i<markers.length; i++){
    //   console.log(i)
    //   var curMark = markers[i];
    //   var path = vm.line.getPath().getArray().slice(0, i+1);
    //   curMark.totalDistance = google.maps.geometry.spherical.computeLength(path)
    // }
    // console.log(markers)
  }

//  Place Marker -----------------------------------------------------



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

  function getElevation(markers){
    const metersFeetConversion = 3.28084;
    const metersMilesConversion = 0.000621371;
     var elevator = new google.maps.ElevationService;
     var elevationsArray = [];
     var elevationsLabels = [];
     var elevationsResolutions = [];
     var chartWaypoints = [];
     var data1 = [];
     var data2 = [];
     var routeElevations = [];
     var waypointElevations = [];
     vm.pathLength = markers[markers.length-1].totalDistance;

      //build position array
    markers.forEach(function (marker) {
      chartWaypoints.push(marker.position)
    })

    getRouteElevations().then(function (routeElevations) {
      getWaypointElevations().then(function (waypointElevations) {
        createChart(routeElevations, waypointElevations);
      })
    });

    function getRouteElevations(){
      return new Promise(function (resolve, reject) {
        elevator.getElevationAlongPath({
          'path': markers,
          'samples': 200
        }, function (elevations, status){
            var data = [];
            data[0]={x: 0, y: elevations[0].elevation*metersFeetConversion};
            var resolution = vm.pathLength/elevations.length* metersMilesConversion;
            for (var i=1; i<elevations.length; i++){
              data[i] = {x: resolution * i,
                          y: elevations[i].elevation*metersFeetConversion}
            }
          resolve(data);
        });
      })
    }

    function getWaypointElevations(){
      return new Promise(function (resolve, reject) {
        elevator.getElevationForLocations({
        'locations': chartWaypoints,
      }, function (elevations, status){
          var data = [];
          for (var i=0; i<markers.length; i++){
          data[i] = {x: markers[i].totalDistance*metersMilesConversion,
                      y: elevations[i].elevation*metersFeetConversion}
        }
          resolve(data);
      });
     })
    }


      // function waypointData (waypointElevations, status) {
      //   for (var i=0; i<markers.length; i++){
      //     data2[i] = {x: markers[i].totalDistance*metersMilesConversion,
      //                 y: waypointElevations[i].elevation*metersFeetConversion}
      //   }
      // }

      // function elevationData(elevations, status){
      //   data1[0]={x: 0, y: elevations[0].elevation*metersFeetConversion};
      //   var resolution = vm.pathLength/elevations.length* metersMilesConversion;
      //   for (var i=1; i<elevations.length; i++){
      //     data1[i] = {x: resolution * i,
      //                 y: elevations[i].elevation*metersFeetConversion}
      //   }
      // }


      function createChart(routeElevations, waypointElevations){
        var ctx = document.getElementById('myChart');
        var data = {
            datasets: [{
                type: 'line',
                label: 'Elevation',
                data: routeElevations,
                fill: true,
                pointBorderColor: 'rgba(0, 0, 0, 0)',
                pointBackgroundColor: 'rgba(0, 0, 0, 0)'

              }, {
                type: 'line',
                label: 'Waypoints',
                data: waypointElevations,
                fill: false,
                borderColor: 'rgba(255,255,255,0)',
                pointBorderColor: 'rgba(255, 0, 0, 1)',
                pointBackgroundColor: 'rgba(255, 0, 0, 1)'
              }
            ]
          }
          var options = {
              scales: {
                  xAxes: [{
                      type: 'linear',
                      position: 'bottom'
                  }]
              }
          }

        var myLineChart = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: options
        });

      }
  }

  function updateTrail(newTrail, id) {
      return $http.patch(`${SERVER}trails/${id}`, newTrail);
  }
  function deleteTrail(id){
    console.log("delete")
    return $http.delete(`${SERVER}trails/${id}`);
  }

  function newTrail(newTrail){
    console.log(newTrail)
      $http.post(`${SERVER}trails`, newTrail).then((resp) => {
        console.log(resp.data)
      }, (reject) => {
        console.log(reject)
      });
  }

  function initMap(map, markers) {
    var latlngbounds = new google.maps.LatLngBounds();
    markers.forEach(function (marker) {
      latlngbounds.extend(marker.position)
      map.fitBounds(latlngbounds);
    })
  }

};

TrailsService.$inject = ['$http', '$cookies', 'NgMap'];
export { TrailsService };
