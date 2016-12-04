function RootController (UsersService, $rootScope) {
	let vm = this;

	vm.loggedIn = UsersService.isLoggedIn();
	vm.username = UsersService.currentUser();
	vm.logout = logout;

	$rootScope.$on('loginChange', (event, data) => {
		vm.loggedIn = UsersService.isLoggedIn();
		vm.username = UsersService.currentUser();
		console.log(vm.loggedIn)
	});

	function logout(){
	  	UsersService.logout()
	    $rootScope.$broadcast('loginChange', {});
  	}
}

 RootController.$inject = ['UsersService', '$rootScope'];
 export {RootController};