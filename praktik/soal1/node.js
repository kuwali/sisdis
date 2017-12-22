// Initialize import
const amqp = require('amqplib/callback_api');
const fs = require('fs');
const path = require('path');
const address = process.argv[2];

// Asumsikan hanya ada 3 node
const nodes = [1, 2, 3];

// Pastikan argv sudah di load
while (!address) {}

// Lakukan koneksi ke RabbitMQ
amqp.connect('amqp://1406543763:961764@152.118.148.103:5672/1406543763', function(err, conn) {
  // Buat sebuah channel
  conn.createChannel(function(err, ch) {
    // Pastikan channel bertipe direct
    ch.assertExchange('EX_WRITE', 'direct');
    // Membuat queue untuk REQUEST pertama
    ch.assertQueue('', {exclusive: true}, function(err, q) {
      console.log(" [*] Waiting for req in %s. To exit press CTRL+C", q.queue);
      // Pastikan queue bind ke REQ_alamat
      ch.bindQueue(q.queue, 'EX_WRITE', `REQUEST_${address}`);
      // Consume setiap ada pesan
      ch.consume(q.queue, function(msg) {
        msg = msg.content.toString();
        console.log(` [${address}] < %s`, msg);
        // Berikan delay untuk mengirim ke RELAY kembali pesan menulis ke Node lain
        setTimeout(function() {
          // Publish ke RELAY
          ch.publish('EX_WRITE', 'ACK_RELAY', new Buffer(msg));
          console.log(` [${address}] > %s`, msg);
        }, 1000);
        // Tulis pesan yang dikirim oleh RELAY
        fs.writeFileSync(path.join(__dirname, `./db${address}`), JSON.parse(msg).payload);
      }, {noAck: true});
    });
    
    // Membuat queue untuk kasus hanya menulis
    ch.assertQueue('', {exclusive: true}, function(err, q) {
      console.log(" [*] Waiting for write in %s. To exit press CTRL+C", q.queue);
      // Pastikan bind ke WRITE_alamat
      ch.bindQueue(q.queue, 'EX_WRITE', `WRITE_${address}`);
      // consume setiap pesan
      ch.consume(q.queue, function(msg) {
        msg = msg.content.toString();
        console.log(` [${address}] > %s`, msg);
        // Tuliskan ke dalam file pesan
        fs.writeFileSync(path.join(__dirname, `./db${address}`), JSON.parse(msg).payload);
      }, {noAck: true});
    });
  });

  // Buat koneksi baru untuk READ
  conn.createChannel(function(err, ch) {
    // Pastikan exchange READ bertipe fanout
    ch.assertExchange('EX_READ', 'fanout', {durable: false});
    // Buat sebuah queue
    ch.assertQueue('', {exclusive: true}, function(err, q) {
      console.log(" [*] Waiting for read in %s. To exit press CTRL+C", q.queue);
      // Bind queue ke ACK_READ
      ch.bindQueue(q.queue, 'EX_READ', 'ACK_READ');
      // Consume pesan yang diterima
      ch.consume(q.queue, function(msg) {
        msg = msg.content.toString();
        console.log(` [${address}] < %s`, msg);
        // Baca database
        fs.readFile(path.join(__dirname, `./db${address}`), (err, data) => {  
          setTimeout(function() {
            // Cetak ke console
            console.log(data.toString());
            // Kembalikan data ke RELAY
            ch.publish('EX_READ', 'ACK_RELAY', new Buffer(data));
            console.log(` [${address}] > %s`, msg);
          }, 1000);
          setTimeout(function() { conn.close() }, 1500);
        });
      }, {noAck: true});
    });
  });
});