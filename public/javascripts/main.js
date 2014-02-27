	var poke = angular.module('poke', ['ui.router']);
	
	poke.config(function($stateProvider, $urlRouterProvider){
		$urlRouterProvider.otherwise('/');
		$stateProvider
		.state('home', {
			url: '/',
			templateUrl: '/templates/home.html',
			controller: 'HomeCtrl'
		})
		.state('dex', {
			url: '/pokedex',
			templateUrl: '/templates/pokedex.html',
			controller: 'DexCtrl'
		});
	});

	poke.controller('HomeCtrl', function($scope, $http, GeoLocation){
		console.log("Using HomeCtrl");
		var secureMapEndpoint = 'https://maps.googleapis.com/maps/api/geocode/json?';
		
		GeoLocation.getCurrentLocation().then(
			function(loc){
				$scope.loc = loc.data;
				GeoLocation.getVenuesNearby(loc.coords).then(
					function(venueResponse){ //This is the response from Foursquare
						$scope.nearbyVenues = venueResponse.response.venues;
					},
					function(errorResponse){
						console.log("Got an error instead of venues.");
					}
				);
			},
			function(reason){
				$scope.geoError = reason;
				console.log("FAILED: " + reason);
			}
		);
	});
	//31 across
	poke.controller('DexCtrl', function($scope, $http, Pokemon){
		console.log("Using DexCtrl");
		$scope.initialX = -6;
		$scope.initialY = -15;
		var gridSize = 47.5;
		$scope.GetSpritePositionByIndex = function(ind){
			var i = parseInt(ind)-1;
			var x = $scope.initialX - (i * gridSize);
			//var y = $scope.initialY + (ind % 31) * gridSize;
			//var offX = $scope.initialX + (ind * gridSize);
			//var offY = $scope.initialY + (ind * gridSize);
			console.log("ID: " + i + ", pos: " + x);
			return{
				'background-position': x + "px 0px"
			};
		}

		Pokemon.GetAllPokemon().then(
			function(response){
				//Successfully got all pokemon
				console.log("Got it!");
				//console.debug(response);
				$scope.pokemon = response;
			},
			function(){
				//Didn't get all pokemon.
				console.log("Didn't get it!");
				console.debug(response);
			}
		);
	});

	poke.factory('Pokemon', function($q, $http, $filter){
		var GetPokemonByNumber = function(n){
			console.log("Getting Pokemon #" + n);
			var index = n-1;
			var deferred = $q.defer();
			$http({
				url:'/data/pokemon_151.json',
				method:'GET'
			})
			.success(function(response){
				console.debug(response);
				deferred.resolve(response);
			})
			.error(function(response){
				console.log("FAILURE");
				console.debug(response);
				deferred.reject("Could not find an acceptable list of Pokemon.");
			});
			return deferred.promise;
		}

		var GetAllPokemon = function(){
			var deferred = $q.defer();
			$http({
				url:'/data/pokemon_151.json',
				method:'GET'
			})
			.success(function(response){
				console.debug(response);
				deferred.resolve(response);
			})
			.error(function(response){
				console.log("FAILURE");
				console.debug(response);
				deferred.reject("Could not find an acceptable list of Pokemon.");
			});
			return deferred.promise;
		}

		var GetPokemonByName = function(n){
			var deferred = $q.defer();

			return deferred.promise;
		}
		return {
			GetPokemonByNumber: GetPokemonByNumber,
			GetPokemonByName: GetPokemonByName,
			GetAllPokemon: GetAllPokemon
		}
	}
	);

	//GeoLocation this is kinda sweet
	poke.factory('GeoLocation', function($q, $http, $filter){
		var getCurrentLocation = function () {
			var deferred = $q.defer();
			if(navigator.geolocation){
				navigator.geolocation.getCurrentPosition(
					function(pos){
						//Setup Google Geocoder
						var geocoder = new google.maps.Geocoder();
						var latlng = new google.maps.LatLng(
							pos.coords.latitude, 
							pos.coords.longitude
						);

						geocoder.geocode(
							{'latLng':latlng},
							function(results, status){
								//Handle Geocode Response
								if(status == google.maps.GeocoderStatus.OK){
									var loc = results;
									deferred.resolve(
										{
											status: "success",
											message:"Deferred resolved, I have no idea what I'm doing!",
											data: loc,
											coords: pos.coords
										}
									);
								}else{
									deferred.reject('There was an error getting your location, try again later.');
								}	
							}
						);
					},
					function(error){
						if(error.code == 1){
							deferred.reject("You need to enable GeoLocation to use this application.");
						}else if(error.code == 2){
							deferred.reject("Your location is currently unavailable, please connect to a network or try again later.");
						}else if(error.code == 3){
							deferred.reject("The location request timed out. Please try again.");
						}
					}
				);
			}else{
				deferred.reject('You need to upgrade your browser to use this application.');
			}
			return deferred.promise;
		};

		var getVenuesNearby = function(coords){
			console.log("Foursquare is looking for venues near: " + coords.latitude + ", " + coords.longitude);
			console.debug(coords);
			var deferred = $q.defer();
		    var angdate = $filter('date')(Date.now(), "yyyyMMdd");
			$http({
				method: 'GET',
				url: 'https://api.foursquare.com/v2/venues/search',
				params: {
					ll: coords.latitude + "," + coords.longitude,
					client_id: 'PRPLLWWLXSHR0NAY0SUIJ1WLI13AEJSIE03RBVJ0QNGWY4EJ',
					client_secret: '1JWJ1SMZJULDLG1TKHNPBT5FMHOG1F2QT4EAS02SB0QODVTZ',
					v: angdate
				}
			})
			.success(function(response){
				deferred.resolve(response);
			})
			.error(function(response){
				deferred.reject(reponse);
			});
			return deferred.promise;
		};

		return {
			getCurrentLocation: getCurrentLocation,
			getVenuesNearby: getVenuesNearby
		};
	});