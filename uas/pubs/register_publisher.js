const amqp = require('amqplib/callback_api');
const ex = 'EX_REGISTER';

module.exports = (user_id_dest, user_id, nama) => amqp.connect('amqp://sisdis:sisdis@172.17.0.3:5672', function(err, conn) {
  conn.createChannel(function(err, ch) {
    var msg = {
      action: 'register',
      user_id: user_id,
      nama: nama,
      sender_id: '1406543763',
      type: 'request',
      ts: new Date().toLocaleString('en-US', { hour12: false })
    };

    ch.assertExchange(ex, 'direct');
    ch.publish(ex, `REQ_${user_id_dest}`, new Buffer(JSON.stringify(msg)));
    console.log(" [R] > %s", JSON.stringify(msg));
    setTimeout(function() { conn.close() }, 1000);
  });
});