(function() {
   'use strict';

   /* Services */

   angular.module('myApp.services', [])

      // put your services here!
      // .service('serviceName', ['dependency', function(dependency) {}]);

     .factory('messageList', ['fbutil', function(fbutil) {
       return fbutil.syncArray('messages', {limit: 10, endAt: null});
     }])

     .factory('flowList', ['fbutil', function(fbutil) {
       return fbutil.syncArray('flows', {limit: 10});
     }])

     .factory('flow', ['fbutil', '$routeParams', function(fbutil, $routeParams) {
       var flowList = fbutil.syncArray('flows', {limit: 10})
       console.log($routeParams.flowId);
       console.log(flowList.$getRecord($routeParams.flowId));
       return flowList.$getRecord($routeParams.flowId);
     }])

     .factory('mandrill', function() {
       return {
         initMandrill: function() {
           return new mandrill.Mandrill('MhYflar4NJx7K24Bpri_3A', true);
         }
       };
     });

})();
