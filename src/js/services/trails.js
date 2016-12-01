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
        lng: myLatlng.lng()
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
          lng: location.latLng.lng()
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
      vm.drawLine(map, markers);
      updateDist(newIndex, markers);
      vm.getElevation(markers);
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

      // add to front
      if (index === 0){
        markers[0].totalDistance = 0;
        if (markers.length === 1){
          return;
        }
      }

      // add to back
      if (index === markers.length-1){
        var path = vm.line.getPath().getArray().slice(index-1, index+1);
        markers[index].totalDistance = markers[index-1].totalDistance + google.maps.geometry.spherical.computeLength(path)
        return;
      }

      // add to mid/update others
      var prevDistance = markers[index+1].totalDistance - markers[index-1].totalDistance;
      var d01 =  google.maps.geometry.spherical.computeDistanceBetween (markers[index-1].position, markers[index].position);
      var d12 =  google.maps.geometry.spherical.computeDistanceBetween (markers[index].position, markers[index+1].position);
      var newDistance = d01 + d12;

      var distanceChange = newDistance - prevDistance;
      console.log(distanceChange)
      markers[index].totalDistance = markers[index-1].totalDistance + d01;
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
     var elevator = new google.maps.ElevationService;
     var elevationsArray = [];
     var elevationsLabels = [];
     elevator.getElevationAlongPath({
        'path': markers,
        'samples': 256
      }, plotElevation);

      function plotElevation(elevations, status){
        // console.log(elevations, status)
        elevations.forEach(function (datapoint) {
          elevationsArray.push(datapoint.elevation);
          elevationsLabels.push(String(datapoint.elevation))
        })
        // console.log(elevationsArray)
        // console.log(elevationsLabels)
        var ctx = document.getElementById('myChart');
        var data = {
            labels: elevationsLabels,
            datasets: [
                {
                    label: "Elevation",
                    fillColor: "#F0BC74",
                    strokeColor: "#F08C00",
                    pointColor: "#F08C00",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "#F08C00",
                    data: elevationsArray
                }
            ]
        };
        var options = {
            scaleShowVerticalLines: false
        };
        var myLineChart = new Chart(ctx, {
            type: 'line',
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
      $http.post(`${SERVER}trails`, newTrail).then((resp) => {
        console.log(resp.data)
      }, (reject) => {
        console.log(reject)
      });
  }

};

TrailsService.$inject = ['$http', '$cookies', 'NgMap'];
export { TrailsService };
