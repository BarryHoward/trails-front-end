import angular from "angular";
import {routerConfig} from "./routes";
import 'angular-ui-router';
import 'angular-cookies';
import 'ngMap';
import 'chart.js';
import 'angular-chart.js';

import {RootController} from "./controllers/root";
import {HomeController} from "./controllers/home";
import {TopTrailsController} from "./controllers/topTrails";
import {LoginController} from './controllers/login';
import {RegisterController} from './controllers/register';

import {TrailController} from "./controllers/trail";
import {TrailNewController} from "./controllers/trailNew";
import {TrailUpdateController} from "./controllers/trailUpdate";
import {TrailViewController} from "./controllers/trailView";

import {UsersService} from "./services/users";
import {MapsService} from "./services/maps";
import {ChartsService} from "./services/charts";       


angular.module('app', ['ngMap', 'ui.router', 'ngCookies', 'chart.js'])
	.config(routerConfig)
	.controller('RootController', RootController)
	.controller('HomeController', HomeController)
	.controller('TrailController', TrailController)
	.controller('TrailNewController', TrailNewController)
	.controller('TrailUpdateController', TrailUpdateController)
	.controller('TrailViewController', TrailViewController)
	.controller('TopTrailsController', TopTrailsController)
	.controller('LoginController', LoginController)
	.controller('RegisterController', RegisterController)

	.service('UsersService', UsersService)
	.service('MapsService', MapsService)
	.service('ChartsService', ChartsService)
