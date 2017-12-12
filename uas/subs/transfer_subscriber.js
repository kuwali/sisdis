const amqp = require('amqplib/callback_api');
const store = require('../model/quorum');
const Nasabah = require('../model/nasabah');
const ex = 'EX_TRANSFER';

amqp.connect('amqp://sisdis:sisdis@172.17.0.3:5672', function (err, conn) {
  conn.createChannel(function (err, ch) {

    ch.assertExchange(ex, 'direct');

    ch.assertQueue('', { exclusive: true }, function (err, q) {
      console.log(" [*] Waiting for transfer in %s. To exit press CTRL+C", q.queue);
      ch.bindQueue(q.queue, ex, 'REQ_1406543763');

      ch.consume(q.queue, function (msg) {
        console.log(" [T] < %s", msg.content.toString());
        transfer(JSON.parse(msg.content), ch);
      }, { noAck: true });
    });

    ch.assertQueue('', { exclusive: true }, function (err, q) {
      console.log(" [*] Waiting for transfer in %s. To exit press CTRL+C", q.queue);
      ch.bindQueue(q.queue, ex, 'RESP_1406543763');

      ch.consume(q.queue, function (msg) {
        console.log(" [T] < %s", msg.content.toString());
      }, { noAck: true });
    });
  });
});

function transfer(content, ch) {
  return store.count()
    .then(counter => {
      if (counter.length > 5) {
        if (Number(req.body.nilai) < 0 || Number(req.body.nilai) > 1000000) {
          console.log(`Error: -5`);
          return res
            .send({status_transfer: -5});
        } else {
          return Nasabah
          .findOne({ user_id: content.user_id })
          .then(nasabah => {
            if (!nasabah) {
              // console.log(`Error: -1, counter: ${counter}`);
              var result = {
                dest: `RESP_${content.sender_id}`,
                msg: {
                  action: 'transfer',
                  type: 'response',
                  status_transfer: -1,
                  ts: new Date().toLocaleString('en-US', { hour12: false })
                }
              };
              console.log(" [T] > %s", JSON.stringify(result));
              return ch.publish(ex, result.dest, new Buffer(JSON.stringify(result.msg)));
            }

            return Nasabah
              .findOneAndUpdate({ user_id: content.user_id },
              { nilai_saldo: nasabah.nilai_saldo + Number(content.nilai) },
              (err, data) => {
                if (err) {
                  // console.log(`Error: -4, counter: ${counter}${err}`);
                  var result = {
                    dest: `RESP_${content.sender_id}`,
                    msg: {
                      action: 'transfer',
                      type: 'response',
                      status_transfer: -4,
                      ts: new Date().toLocaleString('en-US', { hour12: false })
                    }
                  };
                  console.log(" [T] > %s", JSON.stringify(result));
                  return ch.publish(ex, result.dest, new Buffer(JSON.stringify(result.msg)));
                }

                // console.log(`Success: {transfer: 1}, counter: ${counter}`);
                var result = {
                  dest: `RESP_${content.sender_id}`,
                  msg: {
                    action: 'transfer',
                    type: 'response',
                    status_transfer: 1,
                    ts: new Date().toLocaleString('en-US', { hour12: false })
                  }
                };
                console.log(" [T] > %s", JSON.stringify(result));
                return ch.publish(ex, result.dest, new Buffer(JSON.stringify(result.msg)));
              }
              );
          });
        }
      } else {
        // console.log(`Error: -2, counter: ${counter}`);
        var result = {
          dest: `RESP_${content.sender_id}`,
          msg: {
            action: 'transfer',
            type: 'response',
            status_transfer: -2,
            ts: new Date().toLocaleString('en-US', { hour12: false })
          }
        };
        console.log(" [T] > %s", JSON.stringify(result));
        return ch.publish(ex, result.dest, new Buffer(JSON.stringify(result.msg)));
      }
    })
    .catch(err => {
      // console.log(`Error: ${err}`);
      var result = {
        dest: `RESP_${content.sender_id}`,
        msg: {
          action: 'transfer',
          type: 'response',
          status_transfer: -99,
          ts: new Date().toLocaleString('en-US', { hour12: false })
        }
      };
      console.log(" [T] > %s", JSON.stringify(result));
      return ch.publish(ex, result.dest, new Buffer(JSON.stringify(result.msg)));
    });
}