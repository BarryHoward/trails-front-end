function TopTrailsController (MapsService) {

	let vm = this;

	function init(){
		MapsService.getTrailList().then((resp)=>{
			console.log(resp.data[0].img_url)
			vm.trailList = resp.data;
			console.log(vm.trailList)
		});
	};

	init();

}

TopTrailsController.$inject = ['MapsService'];
export {TopTrailsController}
