var myModule = angular.module('landingPage', []);

myModule.controller('MainCtrl', function($scope) {
	$scope.username = "sampleNickname";
	$scope.postUsername = function() {
		$http.post('login', $scope.username);
		alert("Surprise!!");
	} 
});