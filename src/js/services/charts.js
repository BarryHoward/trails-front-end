function ChartsService ($http, $cookies) {

	let vm = this;
	vm.chart = chart;
	vm.getRouteElevations = getRouteElevations;
	vm.getWaypointElevations = getWaypointElevations;
	vm.drawChart = drawChart;
	const metersFeetConversion = 3.28084;
	const metersMilesConversion = 0.000621371;


	function chart(markers){

	    var elevator = new google.maps.ElevationService;

	    var routeElevations = [];
	    var waypointElevations = [];
	  	vm.chartWaypoints = [];
	    markers.forEach(function (marker) {
	      vm.chartWaypoints.push(marker.position)
	    })


	    vm.getRouteElevations(elevator, markers).then(function (routeElevations) {
	      vm.getWaypointElevations(elevator, markers).then(function (waypointElevations) {
	        vm.drawChart(routeElevations, waypointElevations);
	      })
	    });
	}

	function getRouteElevations(elevator, markers){
	  return new Promise(function (resolve, reject) {
	    elevator.getElevationAlongPath({
	      'path': markers,
	      'samples': 200
	    }, function (elevations, status){
	    	vm.pathLength = google.maps.geometry.spherical.computeLength(vm.chartWaypoints)
	        var data = [];
	        data[0]={x: 0, y: elevations[0].elevation*metersFeetConversion};
	        var resolution = vm.pathLength/(elevations.length-1)* metersMilesConversion;
	        for (var i=1; i<elevations.length; i++){
	          data[i] = {x: resolution * i,
	                      y: elevations[i].elevation*metersFeetConversion}
	        }
	      resolve(data);
	    });
	  })
	}

	function getWaypointElevations(elevator, markers){
	  return new Promise(function (resolve, reject) {
	    elevator.getElevationForLocations({
	    'locations': vm.chartWaypoints,
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


	function drawChart(routeElevations, waypointElevations){
		var ctx = document.getElementById('myChart');

		if(vm.myLineChart){
	        vm.myLineChart.destroy();
	    }
	    ctx.height = 125;
		var data = {
		    datasets: [{
		        type: 'line',
		        label: 'Elevation',
		        data: routeElevations,
		        fill: true,
		        pointBorderColor: 'rgba(0, 0, 0, 0)',
		        pointBackgroundColor: 'rgba(0, 0, 0, 0)',
		        backgroundColor : 'rgba(155,122,61, .8)'

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
		              position: 'bottom',
		              ticks: {
		                min: 0,
		                max: 20,
		                beginAtZero: true
		              }
		          }],
		          yAxes: [{
		              ticks: {
		                min: 0,
		                max: 6600,
		                beginAtZero: true
		              }
		          }],
		      },
					hover: {
						intersect: false
					}
		  }

		vm.myLineChart = new Chart(ctx, {
		    type: 'bar',
		    data: data,
		    options: options
		});

	}



}

ChartsService.$inject = ['$http', '$cookies'];
export { ChartsService };
