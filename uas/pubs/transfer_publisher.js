const amqp = require('amqplib/callback_api');
const ex = 'EX_TRANSFER';

module.exports = (user_id_dest, user_id, nilai) => amqp.connect('amqp://sisdis:sisdis@172.17.0.3:5672', function(err, conn) {
  conn.createChannel(function(err, ch) {
    var msg = {
      action: 'transfer',
      user_id: user_id,
      sender_id: '1406543763',
      nilai: nilai,
      type: 'request',
      ts: new Date().toLocaleString('en-US', { hour12: false })
    };

    ch.assertExchange(ex, 'direct');
    ch.publish(ex, `REQ_${user_id_dest}`, new Buffer(JSON.stringify(msg)));
    console.log(" [T] > %s", JSON.stringify(msg));
    setTimeout(function() { conn.close() }, 1000);
  });
});