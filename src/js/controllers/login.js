function LoginController (UsersService, $state, $rootScope) {
  let vm = this;
  vm.login = login;

  function login(userInfo) {
    UsersService.login(userInfo).then((resp) => {
      UsersService.setUser(resp.data)
      $rootScope.$broadcast('loginChange', {});
      $state.go('root.home')
      console.log(resp)
    },(errors) => {
      console.log(errors)
    });
  };

};
LoginController.$inject = ['UsersService', '$state', '$rootScope']
export {LoginController}
