function TopTrailsController (MapsService) {

	let vm = this;

	function init(){
		MapsService.getTrailList().then((resp)=>{
			vm.trailList = resp.data;
			console.log(vm.trailList)
		});
	};

	init();

}

TopTrailsController.$inject = ['MapsService'];
export {TopTrailsController}
