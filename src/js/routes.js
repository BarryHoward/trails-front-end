function routerConfig ($stateProvider , $urlRouterProvider) {

  $stateProvider

 // root states -------------------------------
    .state('root', {
      abstract: true,
      templateUrl: 'templates/root.tpl.html',
      controller: 'RootController as root'
    })
    .state('root.home', {
      url: '/home',
      templateUrl: 'templates/home.tpl.html',
      controller: 'HomeController as home'
    })
    .state('root.login', {
      url: '/login',
      templateUrl: 'templates/login.tpl.html',
      controller: 'LoginController as login'
    })
    .state('root.topTrails', {
      url: '/topTrails',
      templateUrl: 'templates/topTrails.tpl.html',
      controller: 'TopTrailsController as topTrails'
    })
    .state('root.register', {
      url: '/register',
      templateUrl: 'templates/register.tpl.html',
      controller: 'RegisterController as register'
    })

// trails states ------------------------------
    .state('root.trails', {
      url: '/trails',
      abstract: true,
      templateUrl: 'templates/trails.tpl.html',
      controller: 'TrailController as trail'
    })
    .state('root.trails.blazeNew', {
      url: '/blaze/new',
      templateUrl: 'templates/trails.blazeNew.tpl.html',
      controller: 'BlazeNewController as blazeNew'
    })
    .state('root.trails.blazeEdit', {
      url: '/blaze/:id',
      templateUrl: 'templates/trails.blazeEdit.tpl.html',
      controller: 'BlazeEditController as blazeEdit'
    })
    .state('root.trails.mark', {
      url: '/mark/:id',
      templateUrl: 'templates/trails.mark.tpl.html',
      controller: 'MarkController as mark'
    })
    .state('root.trails.hike', {
      url: '/hike/:trailId/users/:userId',
      templateUrl: 'templates/trails.hike.tpl.html',
      controller: 'HikeController as hike'
    })


  // users states --------------------------------
    .state('root.users', {
      url: '/users',
      abstract: true,
      templateUrl: 'templates/users.tpl.html',
      controller: 'UsersController as users'
    })
     $urlRouterProvider.otherwise('/home');
};

routerConfig.$inject = ['$stateProvider', '$urlRouterProvider'];
export { routerConfig };
