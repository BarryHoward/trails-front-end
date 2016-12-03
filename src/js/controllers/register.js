function RegisterController (UsersService, $state, $rootScope) {
  let vm = this;

  vm.create = create;

  function create (newUserInfo) {
    console.log("clicked")
      UsersService.newUser(newUserInfo).then((creatResp) => {
        UsersService.login(newUserInfo).then((loginResp) => {
          UsersService.setUser(loginResp.data)
          $rootScope.$broadcast('loginChange', {});
          $state.go('root.home')
        },(loginErrors) => {
          console.log(loginErrors)
        });
      }, (createErrors) => {
        console.log(errors)
      })
  }
}
RegisterController.$inject = ['UsersService', '$state', '$rootScope'];
export {RegisterController}
