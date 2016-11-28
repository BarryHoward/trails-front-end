function RootController (OwnerService, $rootScope) {
	let vm = this;
	vm.admin = OwnerService.isAdmin();
	vm.loggedIn = OwnerService.isLoggedIn();
	vm.logout = logout;

	$rootScope.$on('loginChange', (event, data) => {
		vm.loggedIn = OwnerService.isLoggedIn();
		vm.admin = OwnerService.isAdmin();
	});

	function logout(){
	  	OwnerService.logout()
	    $rootScope.$broadcast('loginChange', {});
  	}
}

 RootController.$inject = ['OwnerService', '$rootScope'];
 export {RootController};