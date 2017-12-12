const amqp = require('amqplib/callback_api');
const store = require('../model/quorum');
const Nasabah = require('../model/nasabah');

amqp.connect('amqp://sisdis:sisdis@172.17.0.3:5672', function(err, conn) {
  conn.createChannel(function(err, ch) {
    var ex = 'EX_GET_SALDO';

    ch.assertExchange(ex, 'direct');

    ch.assertQueue('', {exclusive: true}, function(err, q) {
      console.log(" [*] Waiting for getsaldo in %s. To exit press CTRL+C", q.queue);
      ch.bindQueue(q.queue, ex, 'REQ_1406543763');

      ch.consume(q.queue, function(msg) {
        console.log(" [S] %s", msg.content.toString());
        getSaldo(JSON.parse(msg.content))
          .then(result => {
            ch.publish(ex, result.dest, new Buffer(JSON.stringify(result.msg)));
          })
      }, {noAck: true});
    });
  });
});

function getSaldo(content) {
  return store.count()
    .then(counter => {
      if (counter.length > 5) {
        return Nasabah
          .findOne({ 'user_id': content.user_id }, (err, nasabah) => {
            if (err) {
              console.log(`Error: -4, counter: ${counter}${err}`);
              return {
                dest: `RESP_${content.sender_id}`, 
                msg: {
                  action: 'get_saldo',
                  type: 'response',
                  nilai_saldo: -4,
                  ts: new Date().toLocaleString('en-US', { hour12: false })
                }
              };
            }

            if (!nasabah) {
              console.log(`Error: -1, counter: ${counter}`);
              return {
                dest: content.sender_id, 
                msg: {
                  action: 'get_saldo',
                  type: 'response',
                  nilai_saldo: -1,
                  ts: new Date().toLocaleString('en-US', { hour12: false })
                }
              };
            }

            console.log(`Success: {nilai_saldo: ${nasabah.nilai_saldo}}, counter: ${counter}`);
            return {
              dest: content.sender_id, 
              msg: {
                action: 'get_saldo',
                type: 'response',
                nilai_saldo: nasabah.nilai_saldo,
                ts: new Date().toLocaleString('en-US', { hour12: false })
              }
            };
          });
      } else {
        console.log(`Error: -2, counter: ${counter}`);
        return {
          dest: content.sender_id, 
          msg: {
            action: 'get_saldo',
            type: 'response',
            nilai_saldo: -2,
            ts: new Date().toLocaleString('en-US', { hour12: false })
          }
        };
      }
    })
    .catch(err => {
      console.log(`Error: ${err}`);
      return {
        dest: content.sender_id, 
        msg: {
          action: 'get_saldo',
          type: 'response',
          nilai_saldo: -99,
          ts: new Date().toLocaleString('en-US', { hour12: false })
        }
      };
    });
}