function UsersService ($http, $cookies) {

  const SERVER = "https://trails-back-end.herokuapp.com/";


  let vm = this;

  vm.login = login;
  vm.isLoggedIn = isLoggedIn;
  vm.setUser = setUser;
  vm.logout = logout;
  vm.getHeaders = getHeaders;
  vm.newUser = newUser;
  vm.currentUser = currentUser;
  vm.currentUserId = currentUserId;
  vm.getCreatedTrails = getCreatedTrails;
  vm.getHikedTrails = getHikedTrails;



  function login (user) {
    return $http.post(`${SERVER}login`, user);
  }

  function isLoggedIn () {
    return $cookies.get('username') ? true : false;
  }

  function getHeaders () {
    let token = $cookies.get('access_token');
    return {
      Authorization: `Bearer ${token}`
    };
  }

  function newUser (info){
    console.log(info)
    return $http.post(`${SERVER}users`, info)
  }
  //
  // function isAdmin () {
  //   return $cookies.get('admin') === 'true';
  // }
  //
  function logout () {
    $cookies.remove('username');
    $cookies.remove('access_token');
    // $cookies.remove('admin');
  }
  //
  function setUser (data) {
    $cookies.put('username', data.username);
    $cookies.put('access_token', data.access_token);
    $cookies.put('user_id', data.id)
    // $cookies.put('admin', data.admin);
  }

  function currentUserId () {
    return $cookies.get('user_id')
  }
  function currentUser (){
    return $cookies.get('username')
  }
  //
  function getUser (id) {
    return $http.get(`${SERVER}/users/${id}`)
  }

  function getAllTrails (){
    return $http.get(`${SERVER}trails`)
  }



  // Backend not setup yet for these two! ----------------
  function getCreatedTrails(id){
    return $http.get(`${SERVER}trails/users/${id}/`)
  }

  function getHikedTrails(id){
    return $http.get(`${SERVER}hikes/users/${id}/trails`)
  }
  // -------------------------------------------------------



};

UsersService.$inject = ['$http', '$cookies'];
export { UsersService };
