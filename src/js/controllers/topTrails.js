function TopTrailsController (MapsService, UsersService) {

	let vm = this;
	vm.MapsService = MapsService;

	vm.img_default = "http://previews.123rf.com/images/alex_star/alex_star0812/alex_star081200333/4005652-Compass-on-old-map-Stock-Photo.jpg";

	function init(){
		MapsService.getTrailList().then((resp)=>{
			vm.trailList = resp.data;
			vm.trailList.forEach(function(element){
				if (element.img_url === null){
					console.log("nada")
					element.img_url = vm.img_default;
					console.log(element.img_url)
				}
			})
			console.log(vm.trailList)
		});
	};

	vm.user_id = UsersService.currentUserId();
	if (!vm.user_id){
		vm.user_id = 0;
	}
	console.log(vm.user_id);

	init();

}

TopTrailsController.$inject = ['MapsService', 'UsersService'];
export {TopTrailsController}
