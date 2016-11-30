import angular from "angular";
import {routerConfig} from "./routes";
import 'angular-ui-router';
import 'angular-cookies';
import 'ngMap';

import {RootController} from "./controllers/root";
import {HomeController} from "./controllers/home";
import {TopTrailsController} from "./controllers/topTrails"

import {TrailController} from "./controllers/trail";
import {TrailNewController} from "./controllers/trailNew";
import {TrailUpdateController} from "./controllers/trailUpdate";

import {UsersService} from "./services/users";
import {TrailsService} from "./services/trails";



angular.module('app', ['ngMap', 'ui.router', 'ngCookies'])
	.config(routerConfig)
	.controller('RootController', RootController)
	.controller('HomeController', HomeController)
	.controller('TrailController', TrailController)
	.controller('TrailNewController', TrailNewController)
	.controller('TrailUpdateController', TrailUpdateController)
	.controller('TopTrailsController', TopTrailsController)

	.service('UsersService', UsersService)
	.service('TrailsService', TrailsService)
