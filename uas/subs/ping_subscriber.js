var amqp = require('amqplib/callback_api');
var store = require('../model/quorum');

amqp.connect('amqp://sisdis:sisdis@172.17.0.3:5672', function(err, conn) {
  conn.createChannel(function(err, ch) {
    var ex = 'EX_PING';

    ch.assertExchange(ex, 'fanout', {durable: false});

    ch.assertQueue('', {exclusive: true}, function(err, q) {
      console.log(" [*] Waiting for ping in %s. To exit press CTRL+C", q.queue);
      ch.bindQueue(q.queue, ex, '');

      ch.consume(q.queue, function(msg) {
        console.log(" [P] %s", msg.content.toString());
        store.save(JSON.parse(msg.content));
        var content = JSON.parse(msg.content);
        if (content.npm === '1406543763') {
          console.log(store.count());
        }
      }, {noAck: true});
    });
  });
});