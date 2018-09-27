var app = angular.module('StopWatchApp', ['ngStorage']);
app.controller('MainController', function ($scope, $rootScope, $localStorage, $interval) {

    $scope.$storage = $localStorage;

    $scope.$storage.sharedTime = new Date();
    $scope.$storage.lat = 0;
    $scope.$storage.lon = 0;

    var currentElapsedTime = 0;
    $scope.$storage.play = false;
    $scope.$storage.startTime = null;
    $scope.$storage.totalElapsedTime = 0;
    $scope.$storage.displayStart = null;
    $scope.$storage.displayStop = "None";
    $scope.$storage.stopLat = 0;
    $scope.$storage.stopLon = 0;
    $scope.time = {
        number: 0,
        h: 00,
        m: 0,
        s: 0,
        lat: 0,
        lon: 0,
        curr: 0
    };
    $scope.$storage.times = [];

    $scope.reset = function () {
        currentElapsedTime = 0;
        $scope.$storage.play = false;
        $scope.$storage.startTime = null;
        $scope.$storage.totalElapsedTime = 0;
        $scope.$storage.displayStart = null;
        $scope.$storage.displayStop = "None";
        $scope.$storage.stopLat = 0;
        $scope.$storage.stopLon = 0;
        $scope.time = {
            number: 0,
            h: 00,
            m: 00,
            s: 00,
            lat: 0,
            lon: 0,
            curr: 0
        };
        $scope.$storage.times = [];
    };

    $scope.start = function () {
        updateLocation();
        if (!$scope.$storage.play) {
            playWatch();
            $scope.$storage.play = true;
            if (!$scope.$storage.displayStart)
                $scope.$storage.displayStart = new Date();
        }
    };

    $scope.stop = function () {
        if ($scope.$storage.play) {
            pauseWatch();
            $scope.$storage.stopLat = angular.copy($scope.$storage.lat);
            $scope.$storage.stopLon = angular.copy($scope.$storage.lon);
            $scope.$storage.play = false;
            $scope.$storage.displayStop = new Date();
        }

    };

    $scope.record = function () {
        if ($scope.$storage.displayStart) {
            $scope.time.curr = $scope.$storage.sharedTime
            $scope.time.lat = $scope.$storage.lat;
            $scope.time.lon = $scope.$storage.lon;
            $scope.$storage.times.unshift(angular.copy($scope.time));
        }
    };

    $interval(function () {
        $scope.$storage.sharedTime = new Date();
        $scope.time = {};
        updateTimer();
    }, 500);

    function playWatch() {
        if (!$scope.$storage.startTime) {
            $scope.$storage.startTime = new Date();
        }
    }

    function pauseWatch() {
        $scope.$storage.startTime = null;
        $scope.$storage.totalElapsedTime += currentElapsedTime;
        currentElapsedTime = 0;
    }

    function getCurrentElapsedTime() {
        var now = new Date();
        var start = new Date($scope.$storage.startTime);
        return (now.getTime() - start.getTime()) / 10;
    }

    function updateTimer() {
        if ($scope.$storage.play) {
            currentElapsedTime = getCurrentElapsedTime();
            $scope.time.number = $scope.$storage.totalElapsedTime + currentElapsedTime;
            calculateTime();
        } else {
            $scope.time.number = $scope.$storage.totalElapsedTime;
            calculateTime();
        }
    }

    function calculateTime() {
        var minuteReminder;
        minuteReminder = $scope.time.number % 6000;
        $scope.time.h = Math.floor($scope.time.number / 360000);
        $scope.time.m = Math.floor($scope.time.number / 6000);
        $scope.time.s = Math.floor(minuteReminder / 100);
    }


    function updateLocation() {
        function success(position) {
            var crd = position.coords;
            $scope.$storage.lat = crd.latitude;
            $scope.$storage.lon = crd.longitude;
        }
        function error() {}

        options = {
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: 5000,
        };

        id = navigator.geolocation.watchPosition(success, error, options);
    }
});