var angular = require("angular");

var TrelloClientConfig = {
	key: null,
	appName: null,
	authEndpoint: 'https://trello.com',
	apiEndpoint: 'https://api.trello.com',
	intentEndpoint: 'https://trello.com',
	version: 1,
	tokenExpiration: 'never',
	scope: ['read', 'write', 'account'],
	localStorageTokenName: 'trello_token',
	returnUrl: window.location.origin
};

var TrelloInterceptor = function($q, shared, TrelloClientConfig){
	return {
		request: function(request) {
			var token;
			if (!request.trelloRequest) {
				return request;
			}
			token = localStorage.getItem(TrelloClientConfig.localStorageTokenName);
			if (token != null) {
				if (request.params == null) {
					request.params = {};
				}
				request.params.key = TrelloClientConfig.key;
				request.params.token = token;
			}
			return request;
		},
		responseError: function(response) {
			return $q.reject(response);
		}
	};
};
TrelloInterceptor.$inject = ['$q', 'SatellizerShared', 'TrelloClientConfig'];

var config = function($httpProvider){
	return $httpProvider.interceptors.push('TrelloInterceptor');
};
config.$inject = ['$httpProvider'];

var TrelloClient = function($authProvider, TrelloClientConfig) {
	this.init = function(config) {
		if (config == null) {
			return;
		}
		angular.extend(TrelloClientConfig, config);
		$authProvider.httpInterceptor = function(request) {
			return false;
		};
		return $authProvider.oauth2({
			name: TrelloClientConfig.appName,
			key: TrelloClientConfig.key,
			returnUrl: TrelloClientConfig.returnUrl,
			authorizationEndpoint: TrelloClientConfig.authEndpoint + "/" + TrelloClientConfig.version + "/authorize",
			defaultUrlParams: ['response_type', 'key', 'return_url', 'expiration', 'scope', 'name'],
			requiredUrlParams: null,
		redirectUri: TrelloClientConfig.returnUrl,
			optionalUrlParams: null,
			scope: TrelloClientConfig.scope,
			scopeDelimiter: ',',
			type: 'redirect',
			popupOptions: TrelloClientConfig.popupOptions,
			responseType: 'token',
			expiration: TrelloClientConfig.tokenExpiration
		});
	};
	this.$get = function($location, $http, $window, $auth, $q) {
		var TrelloClient, baseURL, fn, i, len, method, ref;
		baseURL = TrelloClientConfig.apiEndpoint + "/" + TrelloClientConfig.version;
		TrelloClient = {};
		TrelloClient.authenticate = function() {
			return $auth.authenticate(TrelloClientConfig.appName).then(function(response) {
				localStorage.setItem(TrelloClientConfig.localStorageTokenName, response.token);
				return response;
			});
		};
		ref = ['get', 'post', 'put', 'delete'];
		fn = function(method) {
			return TrelloClient[method] = function(endpoint, config) {
				var deferred;
				if (config == null) {
					config = {};
				}
				config.trelloRequest = true;
				deferred = $q.defer();
				if (localStorage.getItem(TrelloClientConfig.localStorageTokenName) == null) {
					deferred.reject('Not authenticated');
				} else {
					$http[method](baseURL + endpoint, config).then(function(response) {
						return deferred.resolve(response);
					})["catch"](deferred.reject);
				}
				return deferred.promise;
			};
		};
		for (i = 0, len = ref.length; i < len; i++) {
			method = ref[i];
			fn(method);
		}
		return TrelloClient;
	};
	this.$get.$inject = ["$location", "$http", "$window", "$auth", "$q"];
};
TrelloClient.$inject = ["$authProvider", "TrelloClientConfig"];

angular.module('trello-api-client', ['satellizer'])
.constant('TrelloClientConfig', TrelloClientConfig)
.config(config)
.factory('TrelloInterceptor', TrelloInterceptor)
.provider('TrelloClient', TrelloClient);

module.exports = 'trello-api-client';