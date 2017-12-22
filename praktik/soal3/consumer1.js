// Initialize import
const amqp = require('amqplib/callback_api');
// hubungkan ke RabbitMQ
amqp.connect('amqp://1406543763:961764@152.118.148.103:5672/1406543763', function(err, conn) {
  // Buat channel
  conn.createChannel(function(err, ch) {
    // Pastikan exchange bertipe direct, namanya EX_PESAN
    ch.assertExchange('EX_PESAN', 'fanout', {durable: false});
    // Buat queue
    ch.assertQueue('', {exclusive: true}, function(err, q) {
      console.log(" [*] Waiting for ack in %s. To exit press CTRL+C", q.queue);
      // Bind queue dengan ACK_RELAY
      ch.bindQueue(q.queue, 'EX_PESAN', 'REQUEST');
      // Consume setiap pesan
      ch.consume(q.queue, function(msg) {
        console.log(msg)
        msg = msg.content.toString();
        if (msg.length > 0) {
          // Print dahulu baru kirim balik
          console.log(" [S] < %s", msg);
          setTimeout(function() {
            // Kirimkan publish WRITE_alamat
            ch.publish('EX_PESAN', 'ACK_RELAY', new Buffer(msg));
            console.log(" [S] > %s", msg);
          }, 1000);  
        }
      }, {noAck: true});
    });
  });
});
