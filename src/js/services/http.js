function HttpService ($http, $cookies) {

	const SERVER = "https://trails-back-end.herokuapp.com/"
	let vm = this;
	vm.getTrail = getTrail;
	vm.deleteTrail = deleteTrail;
	vm.newTrail = newTrail;
	vm.updateTrail = updateTrail;

	function getTrail(trail_id){
		return $http.get(`${SERVER}trails/${trail_id}`)
	}

	function deleteTrail(id){
		return $http.delete(`${SERVER}trails/${id}`);
	}

	function newTrail(newTrail){
		return $http.post(`${SERVER}trails`, newTrail)
	}

	function updateTrail(newTrail, id) {
		return $http.patch(`${SERVER}trails/${id}`, newTrail);
	}

}
HttpService.$inject = ['$http', '$cookies'];
export { HttpService };