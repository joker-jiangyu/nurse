'use strict';

/* Filters */

var nurseFilter = angular.module('nurseApp.filters', []);

nurseFilter.filter('interpolate', ['version', function(version) {
	return function(text) {
		return String(text).replace(/\%VERSION\%/mg, version);
	};
}]);

nurseFilter.filter('precise', function() {
	return function(input, showPrecision) {
		var out = '';

		var is = showPrecision;
		var pre = is.substr(is.indexOf("."), is.length - is.indexOf("."));

		return parseFloat(input).toFixed(pre.length - 1);
	};
});