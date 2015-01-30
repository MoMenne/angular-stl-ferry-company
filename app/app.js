'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute'
]).
controller('MessageController', function($scope, socket, $rootScope) {

    $scope.messages = [];
    $rootScope.$on('newList', function(event, data) {
      console.log('hell yeah new list');
      $scope.$apply(function () {
        $scope.messages = data;
      });
    })

    $scope.send_message = function () {
      $scope.messages.unshift({body: $scope.new_message, type: 'none'})
      socket.publish('com.pubsub.ticker.create', [{body:$scope.new_message, type:'none'}]);
      $scope.new_message = '';
    }

}).
factory('socket', function($q, $rootScope) {
  var connection = new autobahn.Connection({
    url: 'ws://192.168.1.11:8080/ws',
    realm: 'beta'
  });
  var resolved = false;
  var session;
  connection.onopen = function(openSession) {
    console.log('heck yeah.  were connected');
    session = openSession;
    resolved = true;
    session.call('com.rpc.ticker.list', []).then(function(res) {
      $rootScope.$emit('newList', res);
    });
  };
  connection.onclose = function(reason, detail) {
    console.log(reason + ' because ' + detail)
  }
  connection.open();

  return {
    on : function(eventName, callback) {
      if (resolved) {
        session.subscribe(eventName, function() {
          var args = arguments;
          $rootScope.$apply(function() {
            callback.apply(connection, args);
          });
        });
      }
    },
    publish : function(eventName, data) {
      if(resolved) {
        session.publish(eventName, data);
      }
    },
//    register: function(eventName, callback) {
//      session.register(eventName, function() {
//        var args = arguments;
//        $rootScope.$apply(function() {
//          callback.apply(connection, args);
//        });
//      });
//    },
    call: function(eventName, data, callback) {
      if (resolved) {
        session.call(eventName, data).then( function() {
          console.log('all done');
        });
      } else {
        console.log('did not publish... connection not yet established');
      }
    }
  }

});
