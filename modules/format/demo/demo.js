function FormatCtrl($scope) {
	$scope.sentence = 'Hello :name, how is the :subject? Are you on the $0, $1 or $2?';
	$scope.mode = 'string';
	$scope.tokens = {
		'string': 'Single',
		'array': ['first', 'second', 'third'],
		'object': {
			'name': 'Bob',
			'subject': 'wife'
		}
	};
}