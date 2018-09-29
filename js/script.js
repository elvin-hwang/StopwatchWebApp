// Script in AngularJS for StopWatch
var app = angular.module('StopWatchApp', ['ngStorage']);
app.controller('MainController', function ($scope, $rootScope, $localStorage, $interval) {

    $scope.$storage = $localStorage;

    // initialize global variables
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

    // reset function sets required global variables to initial values.
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

    // Start the stopwatch, which starts the timer and location updates
    $scope.start = function () {
        if (!$scope.$storage.play) {
            updateLocation();
            playWatch();
            $scope.$storage.play = true;
            if (!$scope.$storage.displayStart)
                $scope.$storage.displayStart = new Date();
        }
    };

    // Stops the stopwatch and displays the stopped time
    $scope.stop = function () {
        if ($scope.$storage.play) {
            pauseWatch();
            $scope.$storage.stopLat = angular.copy($scope.$storage.lat);
            $scope.$storage.stopLon = angular.copy($scope.$storage.lon);
            $scope.$storage.play = false;
            $scope.$storage.displayStop = new Date();
        }

    };

    // Adds an item to the array of times, which are added to the top of scroll view
    $scope.record = function () {
        if ($scope.$storage.displayStart) {
            $scope.time.curr = $scope.$storage.sharedTime
            $scope.time.lat = $scope.$storage.lat;
            $scope.time.lon = $scope.$storage.lon;
            $scope.$storage.times.unshift(angular.copy($scope.time));
        }
    };

    // Updates the timer and current date every 500ms
    $interval(function () {
        $scope.$storage.sharedTime = new Date();
        $scope.time = {};
        updateTimer();
    }, 500);

    // Helper for start() which saves the started time in order to calculate elapsed time
    function playWatch() {
        if (!$scope.$storage.startTime) {
            $scope.$storage.startTime = new Date();
        }
    }

    // Helper for stop() which sets startTime back to null and stores the time elapsed so far
    function pauseWatch() {
        $scope.$storage.startTime = null;
        $scope.$storage.totalElapsedTime += currentElapsedTime;
        currentElapsedTime = 0;
    }

    // Keeps updating the $scope.time.number variable to keep track with current elapsed time
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

    // Calculates the elapsed time by the difference between start and now
    function getCurrentElapsedTime() {
        var now = new Date();
        var start = new Date($scope.$storage.startTime);
        return (now.getTime() - start.getTime()) / 10;
    }

    // Converts the millisecond time into 3 seperate variables and stores it
    function calculateTime() {
        var minuteReminder;
        minuteReminder = $scope.time.number % 6000;
        $scope.time.h = Math.floor($scope.time.number / 360000);
        $scope.time.m = Math.floor($scope.time.number / 6000);
        $scope.time.s = Math.floor(minuteReminder / 100);
    }

    // Watches the position and updates variables once there is a change in location
    function updateLocation() {
        function success(position) {
            var crd = position.coords;
            $scope.$storage.lat = crd.latitude;
            $scope.$storage.lon = crd.longitude;
        }
        function error() { }

        options = {
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: 5000,
        };

        id = navigator.geolocation.watchPosition(success, error, options);
    }
});

// Script in jQuery for the Zeppelins animations around globe
$(function () {

    // initialize global variables
    var started = false;
    var stopped = false;
    var start = 180;            // Starts at top
    var end = -180;             // Loops at top
    var dir = -1;               // Counter-Clockwise Direction
    var raceTime1 = 90000;     // Speed of My Zeppelin
    var raceTime2 = 110000;     // Speed of Enemy Zeppelin

    var zepWidth = $('.zep').width() - 11;
    var zepHeight = $('.zep').height();
    var globeRadius = $('#globe1').width() / 2;

    // Once start is clicked, let the animations start if they havent already been started
    // Or restart the position of your zeppelin if it has already started
    $('#start').click(function () {

        if (!started) {
            started = true;

            endless('#zep1');
            endless('#zep2');

        }
        if (stopped) {
            stopped = false;
            endless('#zep1');
        }

        // Helper to continue the animation after the ending point
        function endless(elem) {
            $(elem).animate({
                path: new $.path.arc({
                    center: [globeRadius - zepWidth + zepHeight, globeRadius],
                    radius: globeRadius,
                    start: start,
                    end: end,
                    dir: dir
                }),
            }, getRaceTime(elem), function () {
                $(elem).css('top', 0);
                endless(elem);
            });
        }

        // Helper to get the speed of Zeppellin depending on id
        function getRaceTime(elem) {
            if (elem == '#zep1')
                return raceTime1;
            else return raceTime2;
        }

    });

    // Stop the animation and keep your zeppelin in place
    $('#stop').click(function () {
        stopped = true;
        $('#zep1').stop();
        start = Math.abs(getRotationDegrees($('#zep1')) - 180 + 9) % 360;
    });

    // Stops both animations and resets both to original position
    $('#reset').click(function () {
        $('#zep1').stop();
        $('#zep2').stop();
        started = false;
        stopped = false;
        $('.zep').css('top', '0');
        $('.zep').css('left', '35%');
        $('.zep').css('transform', 'rotate(-9deg)');
    });

    function getRotationDegrees(obj) {
        var matrix = obj.css("-webkit-transform") ||
            obj.css("-moz-transform") ||
            obj.css("-ms-transform") ||
            obj.css("-o-transform") ||
            obj.css("transform");
        if (matrix !== 'none') {
            var values = matrix.split('(')[1].split(')')[0].split(',');
            var a = values[0];
            var b = values[1];
            var angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
        } else { var angle = 0; }
        return (angle < 0) ? angle + 360 : angle;
    }
});