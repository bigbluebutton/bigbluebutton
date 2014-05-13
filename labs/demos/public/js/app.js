var myModule = angular.module('landingPage', []);



myModule.controller('MainCtrl', function($scope, $http) {
	$scope.blah = {
		name: 'zZzZ',
		password: 'oOoOoO'
	};
	$scope.postUsername = function(username) {
		console.log("the passed uname=" + this.username);
		/*jQuery.getJSON("config.json", function (json) {
			$http.post(json.settings.IP + ':' + json.settings.PORT + '/login?username=' +
			 $scope.username).success(function(res){
				console.log("SUCCESS," + JSON.stringify(res));
			});
			
		}); */
		$http.post('loginnn', $scope.blah).success(function(res){
			console.log("SUCCESS," + JSON.stringify(res));
			var newWindow = window.open("", "newWindow", "resizable=yes");
			newWindow.document.write('JSON.stringify(res)');
		});
	}
});