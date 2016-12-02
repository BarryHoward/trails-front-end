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
    // console.log("waypoint", waypoint)
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

      if (vm.insert === "midInsert"){
        var newIndex = midInsert(markers, location, marker)
      } else if (vm.insert === "frontInsert") {
        markers.unshift(marker);
        var newIndex = 0;
      } else if (vm.insert === "backInsert") {
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

          let beforeAngle = Math.asin((markBefore.lng - markMin.lng)/Math.sqrt(Math.pow((markBefore.lng-markMin.lng),2)+Math.pow((markBefore.lat-markMin.lat),2)));
          let afterAngle = Math.asin((markAfter.lng - markMin.lng)/Math.sqrt(Math.pow((markAfter.lng-markMin.lng),2)+Math.pow((markAfter.lat-markMin.lat),2)));
          let newAngle = Math.asin((marker.lng - markMin.lng)/Math.sqrt(Math.pow((marker.lng-markMin.lng),2)+Math.pow((marker.lat-markMin.lat),2)));

          let beforeDif = Math.PI - Math.abs(Math.PI - Math.abs(beforeAngle - newAngle));
          let afterDif = Math.PI - Math.abs(Math.PI - Math.abs(afterAngle - newAngle));

          // console.log(beforeAngle, newAngle, afterAngle)
          // console.log(beforeDif, afterDif)

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
        var path = vm.line.getPath().getArray().slice(index-1, index+1);
        markers[index].totalDistance = markers[index-1].totalDistance + google.maps.geometry.spherical.computeLength(path)
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

      for (var j=0; j<markers.length; j++){
        console.log(j, markers[j].totalDistance)
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
    // console.log("elevation")
     var elevator = new google.maps.ElevationService;
     var elevationsArray = [];
     var elevationsLabels = [];
     var elevationsResolutions = [];
     var chartWaypoints = [];
     var data1 = [];
     var data2 = [];
     vm.pathLength = markers[markers.length-1].totalDistance;
     console.log(markers)
     elevator.getElevationAlongPath({
        'path': markers,
        'samples': 200
      }, elevationData);

      //build position array
      markers.forEach(function (marker) {
        chartWaypoints.push(marker.position)
        // console.log(chartWaypoints)
      })
      //build elevation array from positions
      elevator.getElevationForLocations({
        'locations': chartWaypoints
      }, waypointData)

      window.setTimeout(chartGraph, 1000);


      function waypointData (waypointElevations, status) {
        // console.log(waypointElevations);
        // console.log(status)
        let metersFeetConversion = 3.28084;
        let metersMilesConversion = 0.000621371;
        for (var i=0; i<markers.length; i++){
          data2[i] = {x: markers[i].totalDistance*metersMilesConversion,
                      y: waypointElevations[i].elevation*metersFeetConversion}
        }
        // pathLength = data2[markers.length-1].x;
      }

      function elevationData(elevations, status){
        // console.log(elevations, status)
        // console.log('elevationsArray ', elevationsArray)

        let metersFeetConversion = 3.28084;
        let metersMilesConversion = 0.000621371;
        data1[0]={x: 0, y: elevations[0].elevation*metersFeetConversion};

        // console.log("elevations", elevations);
        // console.log("elevations.length", elevations.length, "pathlength", pathlength)

        var resolution = vm.pathLength/elevations.length* metersMilesConversion;

        for (var i=1; i<elevations.length; i++){
          data1[i] = {x: resolution * i,
                      y: elevations[i].elevation*metersFeetConversion}
        }

        console.log("data1", data1)
      }

        // elevations.forEach(function (datapoint) {
        //   elevationsArray.push(datapoint.elevation*metersFeetConversion);
        //   elevationsResolutions.push(datapoint.resolution*metersMilesConversion);
        // })
        // elevationsResolutions.forEach(function (resolution, index) {
        //     if (index % 4 === 0){
        //       resolution = resolution * elevationsLabels.length
        //       elevationsLabels.push(String(resolution.toFixed(2) + ' mi.'))
        //     } else {
        //       elevationsLabels.push("");
        //     }
        // })

        function chartGraph(){
        var ctx = document.getElementById('myChart');
        // console.log(elevationsArray)

        // console.log("data1", data1, "data2", data2)
        var data = {
            // labels: elevationsLabels,
            datasets: [{
                type: 'line',
                label: 'Elevation',
                data: data1,
                fill: true,

              }, {
                type: 'line',
                label: 'Waypoints',
                data: data2,
                fill: false,
                borderColor: 'rgba(255,255,255,0)',
                pointBorderColor: 'rgba(255, 0, 0, 1)'
              }
            ]
          }
          // var dataset2 = {
          //   // labels: elevationsLabels,
          //   datasets: [{
          //       label: 'Waypoints',
          //       data: data2
          //     }]
          // }
          var options = {
              scales: {
                  xAxes: [{
                      type: 'linear',
                      position: 'bottom'
                  }]
              }
          }


                // {
                //     label: "Elevation",
                //     fillColor: "#71BC2B",
                //     strokeColor: "#71BC2B",
                //     pointColor: "#71BC2B",
                //     pointStrokeColor: "#71BC2B",
                //     pointHighlightFill: "#71BC2B",
                //     pointHighlightStroke: "#F08C00",
                //     data: elevationsArray
                // },
                // {
                //     label: "Waypoints",
                //     fillColor: "#71BC2B",
                //     strokeColor: "#71BC2B",
                //     pointColor: "#71BC2B",
                //     pointStrokeColor: "#71BC2B",
                //     pointHighlightFill: "#71BC2B",
                //     pointHighlightStroke: "#F08C00",
                //     data:elevationsArray
                // }
            // ]

        // console.log(datas.datasets)

        var myLineChart = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: options
        });

        // var myPointChart = new Chart(ctx, {
        //     type: 'line',
        //     data: dataset2,
        //     options: options
        // });


        var data3 = [{
            x: -10,
            y: 0
        }, {
            x: 0,
            y: 10
        }, {
            x: 10,
            y: 5
        }]
        console.log("data1", data1, "data2", data2)


        // var scatterChart = new Chart(ctx, {
        //     type: 'line',
        //     data: {
        //         datasets: [{
        //             label: 'Scatter Dataset',
        //             data: data1
        //         }]
        //     },
        //     options: options
        // });
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
    // console.log(markers[0].position, markers)
  }

};

TrailsService.$inject = ['$http', '$cookies', 'NgMap'];
export { TrailsService };
