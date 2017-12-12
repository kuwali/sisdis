const amqp = require('amqplib/callback_api');
const store = require('../model/quorum');
const Nasabah = require('../model/nasabah');
const ex = 'EX_REGISTER';

amqp.connect('amqp://sisdis:sisdis@172.17.0.3:5672', function (err, conn) {
  conn.createChannel(function (err, ch) {

    ch.assertExchange(ex, 'direct');

    ch.assertQueue('', { exclusive: true }, function (err, q) {
      console.log(" [*] Waiting for register in %s. To exit press CTRL+C", q.queue);
      ch.bindQueue(q.queue, ex, 'REQ_1406543763');

      ch.consume(q.queue, function (msg) {
        console.log(" [R] < %s", msg.content.toString());
        register(JSON.parse(msg.content), ch);
      }, { noAck: true });
    });

    ch.assertQueue('', { exclusive: true }, function (err, q) {
      console.log(" [*] Waiting for register in %s. To exit press CTRL+C", q.queue);
      ch.bindQueue(q.queue, ex, 'RESP_1406543763');

      ch.consume(q.queue, function (msg) {
        console.log(" [R] < %s", msg.content.toString());
      }, { noAck: true });
    });
  });
});

function register(content, ch) {
  return store.count()
    .then(counter => {
      if (counter.length > 5) {
        // console.log(`Counter: ${counter} | Quorum Length: ${quorum.length()} | Quorum: ${counter > (quorum.length() / 2)}`);
        var nasabah = Nasabah({
          user_id: content.user_id,
          nama: content.nama,
          nilai_saldo: 0
        });

        return nasabah.save((err, data) => {
          if (err) {
            // console.log(`Error: ${err}, counter: ${counter}`);
            var result = {
              dest: `RESP_${content.sender_id}`,
              msg: {
                action: 'register',
                type: 'response',
                nilai_saldo: { status_register: -4 },
                ts: new Date().toLocaleString('en-US', { hour12: false })
              }
            };
            console.log(" [R] > %s", JSON.stringify(result));
            return ch.publish(ex, result.dest, new Buffer(JSON.stringify(result.msg)));
          }

          // console.log(`Success: {status_register: 1}, counter: ${counter}`);
          var result = {
            dest: `RESP_${content.sender_id}`,
            msg: {
              action: 'register',
              type: 'response',
              nilai_saldo: { status_register: 1 },
              ts: new Date().toLocaleString('en-US', { hour12: false })
            }
          };
          console.log(" [R] > %s", JSON.stringify(result));
          return ch.publish(ex, result.dest, new Buffer(JSON.stringify(result.msg)));
        });
      } else {
        // console.log(`Error: -2, counter: ${counter}`);
        var result = {
          dest: `RESP_${content.sender_id}`,
          msg: {
            action: 'register',
            type: 'response',
            nilai_saldo: { status_register: -2 },
            ts: new Date().toLocaleString('en-US', { hour12: false })
          }
        };
        console.log(" [R] > %s", JSON.stringify(result));
        return ch.publish(ex, result.dest, new Buffer(JSON.stringify(result.msg)));
      }
    })
    .catch(err => {
      // console.log(`Error: ${err}`);
      var result = {
        dest: `RESP_${content.sender_id}`,
        msg: {
          action: 'register',
          type: 'response',
          nilai_saldo: { status_register: -99 },
          ts: new Date().toLocaleString('en-US', { hour12: false })
        }
      };
      console.log(" [R] > %s", JSON.stringify(result));
      return ch.publish(ex, result.dest, new Buffer(JSON.stringify(result.msg)));
    });
}