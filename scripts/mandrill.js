// Requires
var mandrill = require('mandrill-api/mandrill'),
    moment = require('moment'),
    later = require('later'),
    Firebase = require('firebase');

// Firebase
var ref = new Firebase('https://intense-heat-8637.firebaseio.com/flows');

// Mandril
var mandrill_client = new mandrill.Mandrill('MhYflar4NJx7K24Bpri_3A');
var message = {
  // 'html': '<p>Example HTML content</p>',
  'text': 'Example text content',
  'subject': 'example subject',
  'from_email': 'message.from_email@example.com',
  'from_name': 'Example Name',
  'to': [{
    'email': 'recipient.email@example.com',
    'name': 'Recipient Name',
    'type': 'to'
  }],
  'headers': {
    'Reply-To': 'message.reply@example.com'
  }

  // },
  // 'important': false,
  // 'track_opens': null,
  // 'track_clicks': null,
  // 'auto_text': null,
  // 'auto_html': null,
  // 'inline_css': null,
  // 'url_strip_qs': null,
  // 'preserve_recipients': null,
  // 'view_content_link': null,
  // 'bcc_address': 'message.bcc_address@example.com',
  // 'tracking_domain': null,
  // 'signing_domain': null,
  // 'return_path_domain': null,
  // 'merge': true,
  // 'merge_language': 'mailchimp',
  // 'global_merge_vars': [{
  //   'name': 'merge1',
  //   'content': 'merge1 content'
  // }],
  // 'merge_vars': [{
  //   'rcpt': 'recipient.email@example.com',
  //   'vars': [{
  //     'name': 'merge2',
  //     'content': 'merge2 content'
  //   }]
  // }],
  // 'tags': [
  // 'password-resets'
  // ],
  // 'subaccount': 'customer-123',
  // 'google_analytics_domains': [
  // 'example.com'
  // ],
  // 'google_analytics_campaign': 'message.from_email@example.com',
  // 'metadata': {
  //   'website': 'www.example.com'
  // },
  // 'recipient_metadata': [{
  //   'rcpt': 'recipient.email@example.com',
  //   'values': {
  //     'user_id': 123456
  //   }
  // }],
  // 'attachments': [{
  //   'type': 'text/plain',
  //   'name': 'myfile.txt',
  //   'content': 'ZXhhbXBsZSBmaWxl'
  // }],
  // 'images': [{
  //   'type': 'image/png',
  //   'name': 'IMAGECID',
  //   'content': 'ZXhhbXBsZSBmaWxl'
  // }]
};

// Every day build the daily queue of emails to send
var sched = later.parse.text('every 1 day');
var execute = later.setInterval(executeFlows, sched);

function executeFlows() {

  ref.once('value', function(snapshot) {
    snapshot.forEach(function(data) {

      // Grab flow data
      var d = data.val();

      // If the status of this flow is on
      if(d.status === 1 && d.requestDay === moment().day()) {

        // Modify input array
        for(var input in d.input) {
          input.to = 'to'
        }

        // Set message data
        message.subject = d.name;
        message.text = d.body;
        message.from_email = d.output;
        message.from_name = d.output;
        message.to = d.input;

        // Send message
        sendMessage(data);
        console.log(data.key());
      }
    });
  }, function (errorObject) {
    console.log('The read failed: ' + errorObject.code);
  });
};

var sendMessage = function (data) {
  mandrill_client.messages.send({'message': message, 'async': false, 'ip_pool': 'Main Pool'}, function(result) {

    // On success
    ref.child(data.key() + '/last_sent').set(moment().format());
    ref.child(data.key() + '/total_sent').set(data.val().total_sent + 1);

  }, function(e) {
    console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
  });
};
