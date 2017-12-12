const amqp = require('amqplib/callback_api');

(function loop() {
  setTimeout(function() {
    amqp.connect('amqp://sisdis:sisdis@172.17.0.3:5672', function(err, conn) {
      conn.createChannel(function(err, ch) {
        var ex = 'EX_PING';
        var msg = {
          action: 'ping',
          npm: '1406543763',
          ts: new Date().toLocaleString('en-US', { hour12: false })
        };
  
        ch.assertExchange(ex, 'fanout', {durable: false});
        ch.publish(ex, '', new Buffer(JSON.stringify(msg)));
        console.log(" [P] > %s", JSON.stringify(msg));
      });
  
      setTimeout(function() { conn.close() }, 500);
    });
    loop();
  }, 5000);
})();