const amqp = require('amqplib/callback_api');

amqp.connect('amqp://sisdis:sisdis@172.17.0.3:5672', function(err, conn) {
  conn.createChannel(function(err, ch) {
    var ex = 'EX_GET_SALDO';
    var msg = {
      action: 'get_saldo',
      user_id: '1406543763',
      sender_id: '1406543763',
      type: 'request',
      ts: new Date().toLocaleString('en-US', { hour12: false })
    };

    ch.assertExchange(ex, 'direct');
    ch.publish(ex, `REQ_${msg.user_id}`, new Buffer(JSON.stringify(msg)));

    // ch.assertQueue('', {exclusive: true}, function(err, q) {
    //   console.log(" [*] Waiting for getsaldo in %s. To exit press CTRL+C", q.queue);
    //   ch.bindQueue(q.queue, ex, 'REQ_1406543763');

    //   ch.consume(q.queue, function(msg) {
    //     console.log(" [S] %s", msg.content.toString());
    //     getSaldo(JSON.parse(msg.content))
    //       .then(result => {
    //         ch.publish(ex, result.dest, result.msg);
    //       })
    //   }, {noAck: true});
    // });
  });
});