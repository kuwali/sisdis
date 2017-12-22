// Initialize import
const amqp = require('amqplib/callback_api');
// hubungkan ke RabbitMQ
amqp.connect('amqp://1406543763:961764@152.118.148.103:5672/1406543763', function(err, conn) {
  // Buat channel
  conn.createChannel(function(err, ch) {
    // Template pesan yang akan dikirimkan
    var msg = {
      action: 'write',
      number: ''
    };
    var num = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    // Pastikan exchange bertipe direct, namanya EX_PESAN
    ch.assertExchange('EX_PESAN', 'fanout', {durable: false});
    // Buat queue
    ch.assertQueue('', {exclusive: true}, function(err, q) {
      console.log(" [*] Waiting for ack in %s. To exit press CTRL+C", q.queue);
      // Bind queue dengan ACK_RELAY
      ch.bindQueue(q.queue, 'EX_PESAN', 'ACK_RELAY');
      // Consume setiap pesan
      ch.consume(q.queue, function(msg) {
        if (msg) {
          msg = msg.content.toString();
          console.log(" [S] < %s", msg);
        }
      }, {noAck: true});
    });

    // Publish perintah untuk menulis dengan REQUEST_alamat
    num.forEach(element => {
      // Delay 1-5 detik
      setTimeout(function() {
         // Kirimkan publish WRITE_alamat
         msg.number = element;
         ch.publish('EX_PESAN', 'REQUEST', new Buffer(JSON.stringify(msg)));
         console.log(" [S] > %s", JSON.stringify(msg));
       }, (Math.floor(Math.random() * 5) + 1) * 1000);
    });
  });
});
