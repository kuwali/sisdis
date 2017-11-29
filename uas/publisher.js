const amqp = require('amqplib/callback_api');

while (true) {
  setTimeout(function() {
    amqp.connect('amqp://sisdis:sisdis@172.17.0.3:5672', function(err, conn) {
      conn.createChannel(function(err, ch) {
        var ex = 'EX_PING';
        var msg = {
          action: 'ping',
          npm: '1406543763',
          ts: new Date()
        };
  
        ch.assertExchange(ex, 'fanout', {durable: false});
        ch.publish(ex, '', new Buffer(JSON.stringify(msg)));
        console.log(" [x] Sent %s", JSON.stringify(msg));
      });
  
      setTimeout(function() { conn.close(); process.exit(0) }, 500);
    });
  }, 5000);
}