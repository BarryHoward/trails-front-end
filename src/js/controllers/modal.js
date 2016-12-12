function ModalController (MapsService, $state) {
	let vm = this;
	vm.marker = MapsService.currentMarker;	
	vm.parent = parent;

	console.log(vm.marker)

	function parent(){
		$state.go('^');
	}

}

ModalController.$inject = ['MapsService', '$state'];
export {ModalController}
