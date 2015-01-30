var autobahn = require('autobahn')

var connection = new autobahn.Connection({
    url: 'ws://192.168.1.11:8080/ws',
    realm: 'beta'
});

connection.onclose = function(reason, detail) {
  console.log(reason)
};

connection.onopen = function(session) {
  console.log('heck yeah');
  session.publish('com.pubsub.ticker.create', [{body:'taptaptap', type:'hellooo'}])
};

connection.open();