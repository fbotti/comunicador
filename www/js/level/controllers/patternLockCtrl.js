communicatorApp.controller('patternLockCtrl', function($scope, $state, $ionicNavBarDelegate, $ionicPopup, tutorialService, receiverDbService, currentReceiverService) {
	var lock = new PatternLock("#lock", { 
		margin: 15,
		onDraw: validatePattern
	});

	function validatePattern (pattern) {
		receiverDbService.selectAll().then(function(receivers) {
			var matchingReceivers = receivers.filter(function(receiver) {
				return receiver.pattern === pattern;
			});

			switch(matchingReceivers.length){
				case 0: {
					lock.error();
					showWrongPassPopup();
					break;
				}
				case 1: {
					selectReceiver(matchingReceivers[0]);
					break;
				}
				default: {
					showConflictPopup(matchingReceivers);
				}
			}			
		});	
	}

	function showWrongPassPopup () {
     	var confirmPopup = $ionicPopup.confirm({
       		title: 'Contraseña incorrecta',
	       	template: '¿Desea intentarlo de nuevo?'
     	});

	    confirmPopup.then(function(response) {
	       	if(response) {
	        	lock.reset();
	       	} else {
				$ionicNavBarDelegate.back();
	       	}
     	});
	}

	function selectReceiver (receiver) {
		currentReceiverService.receiver = receiver;
		$state.go(receiver.advanced == 'true'? 'app.advancedRegistry' : 'app.basicRegistry');
	}

	function showConflictPopup (conflictingReceivers) {
		$scope.conflictingReceivers = conflictingReceivers;
		$scope.radioInputs = {
			selectedReceiver: conflictingReceivers[0]
		};
     	var confirmPopup = $ionicPopup.show({
       		title: 'Multiples receptores encontrados',
	       	templateUrl: 'templates/level/selectReceiverPopup.html',
	       	scope: $scope,
	       	buttons: [
      			{ 
      				text: 'Cancelar',
      				onTap: function() {
     					$ionicNavBarDelegate.back();
      				}
      			},
  				{
        			text: 'Aceptar',
        			type: 'button-positive',
        			onTap: function() {
     					selectReceiver($scope.radioInputs.selectedReceiver);
        			}
  				}
    		]
     	});
	}

    $scope.ask = function() {
        $ionicPopup.alert({
            title: 'Ayuda',
            template: 'Para usar un receptor de la comunicación de prueba se deben unir los puntos 1-2-3. La puntuación del intercambio no quedará registrada.'
        });
    };

    tutorialService.showIfActive();
});