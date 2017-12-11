var amqp = require('amqplib/callback_api');
var store = require('../model/quorum');

amqp.connect('amqp://sisdis:sisdis@172.17.0.3:5672', function(err, conn) {
  conn.createChannel(function(err, ch) {
    var ex = 'EX_REGISTER';

    ch.assertExchange(ex, 'direct');

    ch.assertQueue('', {exclusive: true}, function(err, q) {
      console.log(" [*] Waiting for getsaldo in %s. To exit press CTRL+C", q.queue);
      ch.bindQueue(q.queue, ex, 'RESP_1406543763');

      ch.consume(q.queue, function(msg) {
        console.log(" [S] %s", msg.content.toString());
        // store.save(JSON.parse(msg.content));
      }, {noAck: true});
    });
  });
});