// Initialize import
const amqp = require('amqplib/callback_api');
const pesan = process.argv[2];

// Pastikan argv sudah di load
while(!pesan) {}

// hubungkan ke RabbitMQ
amqp.connect('amqp://1406543763:961764@152.118.148.103:5672/1406543763', function(err, conn) {
  // Buat channel
  conn.createChannel(function(err, ch) {
    // Template pesan yang akan dikirimkan
    var msg = {
      action: 'propose',
      payload: pesan
    };
    // Pastikan exchange bertipe direct, namanya EX_PROPOSE
    ch.assertExchange('EX_PROPOSE', 'direct');
    // Buat queue
    ch.assertQueue('', {exclusive: true}, function(err, q) {
      console.log(" [*] Waiting for ack in %s. To exit press CTRL+C", q.queue);
      // Bind queue dengan ACK_RELAY
      ch.bindQueue(q.queue, 'EX_PROPOSE', 'ACK_RELAY');
      // Consume setiap pesan
      ch.consume(q.queue, function(msg) {
        msg = msg.content.toString();
        console.log(" [S] < %s", msg);
        // Untuk node selain yang mengirimkan, perintahkan hanya menulis
        nodes.forEach(element => {
          if (element !== destination) {
            setTimeout(function() { 
              // Kirimkan publish WRITE_alamat
              ch.publish('EX_PROPOSE', `WRITE_${element}`, new Buffer(msg));
              console.log(" [S] > %s", msg);
            }, (Math.floor(Math.random() * 5) + 1) * 1000);
          }
        });
        setTimeout(function() { conn.close() }, 10000);
      }, {noAck: true});
    });
    // Publish perintah untuk menulis dengan REQUEST_alamat
    ch.publish('EX_PROPOSE', `REQUEST_${destination}`, new Buffer(JSON.stringify(msg)));
    console.log(" [S] > %s %s", `REQUEST_${destination}`, JSON.stringify(msg));
  });
});