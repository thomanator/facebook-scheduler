var app = angular.module('myApp',[])

app.controller('mainController',function($scope,$rootScope,$http,$location) {		
	$scope.username = ''
	$scope.password = ''
	$scope.firstname = ''
	$scope.lastname = ''
	$scope.errorMessage = ''

	$scope.register = function() {		
		if($scope.username.length == '') {
			$scope.errorMessage = 'Please enter a username'
		}
		else if($scope.password.length == '') {			
			$scope.errorMessage = 'Please enter a password'
		}
		else if($scope.firstname.length == '') {
			$scope.errorMessage = 'Please enter a first name'
		}
		else if($scope.lastname.length == '') {
			$scope.errorMessage = 'Please enter a last name'
		}
		else {
			$http({
				method:'post',
				headers:{
					'content-type':'application/json'					
				},
				url:'http://localhost:3000/register',
				json: {
					username:$scope.username,
					password:$scope.password,
					firstName: $scope.firstname,
					lastname: $scope.lastname					
				}
			}).then(function(data) {
				console.log(data)
			},function(err) {
				console.log(err)
			})
		}	
	}
})

app.controller('sample',function($scope) {
	$scope.error = $scope.sample
})
