// Requires
var mandrill = require('mandrill-api/mandrill'),
    moment = require('moment'),
    later = require('later'),
    Firebase = require('firebase');

// Firebase
var ref = new Firebase('https://intense-heat-8637.firebaseio.com/flows');

// Mandril
var mandrill_client = new mandrill.Mandrill('MhYflar4NJx7K24Bpri_3A');

// Every day build the daily queue of emails to send
var sched = later.parse.text('every 5 seconds');
var execute = later.setInterval(executeFlows, sched);

function executeFlows() {
  var email_count = 0;

  ref.on('value', function(snapshot) {
    snapshot.forEach(function(data) {

      // Grab flow data
      var d = data.val();

      // Set info
      var info = {
        raw_message: 'Subject: Look.' + d.name + '\n\n' + 'Post day: ' + d.postDay + '\nRequest day: ' + d.requestDay,
        from_email: d.output,
        from_name: 'Zack',
        to: [
        'zelliottm@gmail.com'
        ],
        async: false,
        ip_pool: 'Main Pool',
        return_path_domain: null
      };

      sendMessage(info);

      // Count emails sent
      email_count++;
    });
  }, function (errorObject) {
    console.log('The read failed: ' + errorObject.code);
  });
};

var sendMessage = function (info) {
  mandrill_client.messages.sendRaw({
    'raw_message': info.raw_message,
    'from_email': info.from_email,
    'from_name': info.from_name,
    'to': info.to,
    'async': info.async,
    'ip_pool': info.ip_pool,
    'return_path_domain': info.return_path_domain
  }, function(result) {
      console.log(result);
    }, function(e) {
      console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
  });
};
