# Angular Trello API Client

An angular Trello client bypassing the Trello client.js (based on jQuery).
This client uses [Satellizer](https://github.com/sahat/satellizer) for authentication.
Meant to be used with [webpack](https://webpack.github.io/).

## Usage

```javascript
angular.module('myAwesomeApp', [
  require('satellizer'),
  require('trello-api-client')
])

.config(function(TrelloClientProvider){
  TrelloClientProvider.init({
    key: 'Trello app key',
    appName: 'Your app name displayed in authentication popup',
    tokenExpiration: 'never',
    scope: ['read', 'write', 'account'],
  });
})

.controller('demoCtrl', function($scope, TrelloClient){
  $scope.authenticate = TrelloClient.authenticate;

  $scope.getMyBoards = function(){
    TrelloClient.get('/members/me/boards').then(function(response){
      console.log(response);
    });
  };
});
```

[Trello API Doc](https://developers.trello.com/advanced-reference)
