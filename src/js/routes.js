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

// trails states ------------------------------
    .state('root.trails', {
      url: '/trails',
      abstract: true,
      templateUrl: 'templates/trails.tpl.html',
      // controller: 'TrailController as trail'
    })
    .state('root.trails.new', {
      url: '/new',
      templateUrl: 'templates/trails.trailNew.tpl.html',
      controller: 'TrailNewController as trailNew'
    })
    .state('root.trails.update', {
      url: '/:id/update',
      templateUrl: 'templates/trails.trailUpdate.tpl.html',
      controller: 'TrailUpdateController as trailUpdate'
    })
     .state('root.trails.view', {
       url: '/:id/view',
       templateUrl: 'templates/trails.trailView.tpl.html',
       controller: 'TrailViewController as trailView'
     })


  // users states --------------------------------

     $urlRouterProvider.otherwise('/home');
};

routerConfig.$inject = ['$stateProvider', '$urlRouterProvider'];
export { routerConfig };
