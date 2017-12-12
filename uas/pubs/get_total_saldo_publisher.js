const amqp = require('amqplib/callback_api');
const ex = 'EX_GET_TOTAL_SALDO';

module.exports = (user_id_dest, user_id) => amqp.connect('amqp://sisdis:sisdis@172.17.0.3:5672', function(err, conn) {
  conn.createChannel(function(err, ch) {
    var msg = {
      action: 'get_total_saldo',
      user_id: user_id,
      sender_id: '1406543763',
      type: 'request',
      ts: new Date().toLocaleString('en-US', { hour12: false })
    };

    ch.assertExchange(ex, 'direct');
    ch.publish(ex, `REQ_${user_id_dest}`, new Buffer(JSON.stringify(msg)));
    console.log(" [A] > %s", JSON.stringify(msg));
    setTimeout(function() { conn.close() }, 1000);
  });
});