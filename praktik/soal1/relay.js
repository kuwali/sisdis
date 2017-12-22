// Initialize import
const amqp = require('amqplib/callback_api');
const destination = process.argv[2];
const payload = process.argv[3];

// Asumsi node hanya 3
const nodes = [1, 2, 3];

// Pastikan argv sudah di load
while(!destination && !payload) {}

// Apabila payload selain READ maka tulis
if (payload !== 'READ') {
  // hubungkan ke RabbitMQ
  amqp.connect('amqp://1406543763:961764@152.118.148.103:5672/1406543763', function(err, conn) {
    // Buat channel
    conn.createChannel(function(err, ch) {
      // Template pesan yang akan dikirimkan
      var msg = {
        action: 'write',
        payload: payload,
        type: 'request'
      };
      // Pastikan exchange bertipe direct, namanya EX_WRITE
      ch.assertExchange('EX_WRITE', 'direct');
      // Buat queue
      ch.assertQueue('', {exclusive: true}, function(err, q) {
        console.log(" [*] Waiting for ack in %s. To exit press CTRL+C", q.queue);
        // Bind queue dengan ACK_RELAY
        ch.bindQueue(q.queue, 'EX_WRITE', 'ACK_RELAY');
        // Consume setiap pesan
        ch.consume(q.queue, function(msg) {
          msg = msg.content.toString();
          console.log(" [S] < %s", msg);
          // Untuk node selain yang mengirimkan, perintahkan hanya menulis
          nodes.forEach(element => {
            if (element !== destination) {
              // Berikan delay 1-5 detik
              setTimeout(function() { 
                // Kirimkan publish WRITE_alamat
                ch.publish('EX_WRITE', `WRITE_${element}`, new Buffer(msg));
                console.log(" [S] > %s", msg);
              }, (Math.floor(Math.random() * 5) + 1) * 1000);
            }
          });
          setTimeout(function() { conn.close() }, 10000);
        }, {noAck: true});
      });
      // Publish perintah untuk menulis dengan REQUEST_alamat
      ch.publish('EX_WRITE', `REQUEST_${destination}`, new Buffer(JSON.stringify(msg)));
      console.log(" [S] > %s %s", `REQUEST_${destination}`, JSON.stringify(msg));
    });
  });
} else {
  // Hubungkan ke RabbitMQ
  amqp.connect('amqp://1406543763:961764@152.118.148.103:5672/1406543763', function(err, conn) {
    // Buat channel
    conn.createChannel(function(err, ch) {
      // Template pesan
      var msg = {
        action: 'read',
        type: 'request'
      };
      // Pastikan exchange bertipe fanout bernama EX_READ
      ch.assertExchange('EX_READ', 'fanout', {durable: false});
      // Publish pesan untuk membaca db
      ch.publish('EX_READ', 'ACK_READ', new Buffer(JSON.stringify(msg)));
      console.log(" [S] > %s %s", `REQUEST_${destination}`, JSON.stringify(msg));
      // Buat queue untuk menerima kembalian pesan
      ch.assertQueue('', {exclusive: true}, function(err, q) {
        console.log(" [*] Waiting for ack in %s. To exit press CTRL+C", q.queue);
        // bind dengan ACK_RELAY
        ch.bindQueue(q.queue, 'EX_READ', 'ACK_RELAY');
        // Consume setiap pesan yang diterima
        ch.consume(q.queue, function(msg) {
          msg = msg.content.toString();
          // Cetak pesan
          console.log(" [S] < %s", msg);
          setTimeout(function() { conn.close() }, 5000);
        }, {noAck: true});
      });
    });
  });
}