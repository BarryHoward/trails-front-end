function ModalController (MapsService, $state) {
	let vm = this;
	vm.marker = MapsService.currentMarker;
	vm.parent = parent;
	vm.round = round;

	console.log(vm.marker)

	function parent(){
		$state.go('^');
	}

	function round(input, places){
		return Number(input.toFixed(places));
	}

}

ModalController.$inject = ['MapsService', '$state'];
export {ModalController}
