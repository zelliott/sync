'use strict';

/* Controllers */

angular.module('myApp.controllers', ['firebase.utils', 'simpleLogin'])
  .controller('HomeCtrl', ['$scope', 'fbutil', 'user', 'FBURL', function($scope, fbutil, user, FBURL) {
    $scope.syncedValue = fbutil.syncObject('syncedValue');
    $scope.user = user;
    $scope.FBURL = FBURL;
  }])

  .controller('MenuCtrl', ['$scope', '$location', function($scope, $location) {

    $scope.setActive = function(path) {
      if ($location.path().substr(0, path.length) === path) {
        return "active"
      } else {
        return ""
      }
    }
  }])

  .controller('FlowsCtrl', ['$scope', 'flowList', 'user', function($scope, flowList, user) {

    // Store scopes
    $scope.newFlow = {
      total_sent: 0,
      status: 1,
      last_sent: ''
    };
    $scope.user = user;
    $scope.flows = flowList;

    // Days of the week info
    $scope.daysOfWeek = [
      { code: 0, name: 'Sunday' },
      { code: 1, name: 'Monday' },
      { code: 2, name: 'Tuesday' },
      { code: 3, name: 'Wednesday' },
      { code: 4, name: 'Thursday' },
      { code: 5, name: 'Friday' },
      { code: 6, name: 'Saturday' },
    ];

    $scope.calcLastSent = function (flow) {
      if(flow.last_sent === '') {
        return 'N/A';
      } else {
        return moment(flow.last_sent).format('M/D');
      }
    };

    $scope.calcDaysToNext = function (flow) {
      if(flow.requestDay === undefined) {
        return 'N/A';
      } else {
        var val;
        if (flow.requestDay <= moment().day()) {
          val = 7 + flow.requestDay - moment().day();
          return val + ' days (' + moment().add(val, 'days').format('M/D') + ')';
        } else {
          val = flow.requestDay - moment().day();
          return val + ' days (' + moment().add(val, 'days').format('M/D') + ')';
        }
      }
    };

    // Track multiple inputs
    $scope.inputs = [{ email: '' }];

    $scope.addInput = function() {
      $scope.inputs.push({ email: '' });
    };

    $scope.removeInput = function(input) {
      $scope.inputs.splice($scope.inputs.indexOf(input), 1);
    }

    // Add a flow
    $scope.addFlow = function() {
      $scope.newFlow.author = $scope.user.uid;
      $scope.newFlow.input = $scope.inputs;

      if($scope.newFlow.name) {
        $scope.flows.$add($scope.newFlow);

        // Reset objects
        $scope.newFlow = {
          total_sent: 0,
          status: 1,
          last_sent: ''
        };
        $scope.inputs = [{ name:'', email: '' }];
      }
      $scope.showForm = false;
    };

    // Edit a flow
    $scope.showEditForm = {};

    $scope.editFlow = function(flow, $index) {
      if($scope.showEditForm[$index] === true) {
        $scope.showEditForm[$index] = false;
      } else {
        $scope.showEditForm[$index] = true;
      }
    };

    // Save a flow
    $scope.saveFlow = function(flow, $index) {
      if(flow.name) {
        $scope.flows.$save(flow);
      }
      $scope.showEditForm[$index] = false;
    };

    // Toggle a flow status
    $scope.toggleStatus = function(flow) {
      if(flow.status === 1) {
        flow.status = 0;
      } else {
        flow.status = 1;
      }
      $scope.flows.$save(flow);
    }

    // Remove a flow
    $scope.removeFlow = function(flow) {
      var result = window.confirm("Are you sure you want to remove this flow?  It cannot be recovered.");
      if(result === true) {
        $scope.flows.$remove(flow);
      }
    };

    // Show add flow form
    $scope.showForm = false;
    $scope.showAddFlow = function() {
      $scope.showForm = !$scope.showForm;
    };
  }])

  .controller('FlowCtrl', ['$scope', '$routeParams', 'flow', 'user', '$location', function($scope, $routeParams, flow, user, $location) {

    $scope.flow = flow;

    $scope.numToDay = function(num) {
      return moment().day(num).format('ddd');
    };

    $scope.calcLastSent = function (flow) {
      if(flow.last_sent === '') {
        return 'N/A';
      } else {
        return moment(flow.last_sent).format('M/D');
      }
    };

    $scope.calcDaysToNext = function (flow) {
      if(flow.requestDay === undefined) {
        return 'N/A';
      } else {
        var val;
        if (flow.requestDay <= moment().day()) {
          val = 7 + flow.requestDay - moment().day();
          return val + ' days (' + moment().add(val, 'days').format('M/D') + ')';
        } else {
          val = flow.requestDay - moment().day();
          return val + ' days (' + moment().add(val, 'days').format('M/D') + ')';
        }
      }
    };

    $scope.tabs = [
      {
        label: 'Summary',
        icon: 'bar-chart',
        url: 'summary'
      },
      {
        label: 'Emails',
        icon: 'inbox',
        url: 'emails'
      }
    ];

    $scope.checkHash = function(url) {
      return url === $location.hash();
    };

    $scope.tabUrl = function(url) {
      return '#' + $location.$$path + '#' + url;
    };

    $scope.formatEmailTimestamp = function(timestamp) {
      if (timestamp === undefined) {
        return 'N/A';
      } else {
        return moment(timestamp).format('M/D');
      }
    };

  }])

  .controller('LoginCtrl', ['$scope', 'simpleLogin', '$location', function($scope, simpleLogin, $location) {
    $scope.email = null;
    $scope.pass = null;
    $scope.confirm = null;
    $scope.createMode = false;

    $scope.login = function(email, pass) {
      $scope.err = null;
      simpleLogin.login(email, pass)
        .then(function(/* user */) {
          $location.path('/account');
        }, function(err) {
          $scope.err = errMessage(err);
        });
    };

    $scope.createAccount = function() {
      $scope.err = null;
      if( assertValidAccountProps() ) {
        simpleLogin.createAccount($scope.email, $scope.pass)
          .then(function(/* user */) {
            $location.path('/account');
          }, function(err) {
            $scope.err = errMessage(err);
          });
      }
    };

    function assertValidAccountProps() {
      if( !$scope.email ) {
        $scope.err = 'Please enter an email address';
      }
      else if( !$scope.pass || !$scope.confirm ) {
        $scope.err = 'Please enter a password';
      }
      else if( $scope.createMode && $scope.pass !== $scope.confirm ) {
        $scope.err = 'Passwords do not match';
      }
      return !$scope.err;
    }

    function errMessage(err) {
      return angular.isObject(err) && err.code? err.code : err + '';
    }
  }])

  .controller('AccountCtrl', ['$scope', 'simpleLogin', 'fbutil', 'user', '$location',
    function($scope, simpleLogin, fbutil, user, $location) {
      // create a 3-way binding with the user profile object in Firebase
      var profile = fbutil.syncObject(['users', user.uid]);
      profile.$bindTo($scope, 'profile');

      // expose logout function to scope
      $scope.logout = function() {
        profile.$destroy();
        simpleLogin.logout();
        $location.path('/login');
      };

      $scope.changePassword = function(pass, confirm, newPass) {
        resetMessages();
        if( !pass || !confirm || !newPass ) {
          $scope.err = 'Please fill in all password fields';
        }
        else if( newPass !== confirm ) {
          $scope.err = 'New pass and confirm do not match';
        }
        else {
          simpleLogin.changePassword(profile.email, pass, newPass)
            .then(function() {
              $scope.msg = 'Password changed';
            }, function(err) {
              $scope.err = err;
            })
        }
      };

      $scope.clear = resetMessages;

      $scope.changeEmail = function(pass, newEmail) {
        resetMessages();
        var oldEmail = profile.email;
        profile.$destroy();
        simpleLogin.changeEmail(pass, oldEmail, newEmail)
          .then(function(user) {
            profile = fbutil.syncObject(['users', user.uid]);
            profile.$bindTo($scope, 'profile');
            $scope.emailmsg = 'Email changed';
          }, function(err) {
            $scope.emailerr = err;
          });
      };

      function resetMessages() {
        $scope.err = null;
        $scope.msg = null;
        $scope.emailerr = null;
        $scope.emailmsg = null;
      }
    }
  ]);
