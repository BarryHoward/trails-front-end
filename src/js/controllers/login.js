function LoginController (UsersService) {
  let vm = this;
  vm.login = login;

  function login(username, password) {

  }

}
LoginController.$inject = ['UsersService']
export {LoginController}
