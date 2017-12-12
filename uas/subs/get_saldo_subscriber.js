const amqp = require('amqplib/callback_api');
const quorum = require('../model/quorum');
const saldo = require('../model/saldo');
const Nasabah = require('../model/nasabah');
const ex = 'EX_GET_SALDO';

amqp.connect('amqp://sisdis:sisdis@172.17.0.3:5672', function(err, conn) {
  conn.createChannel(function(err, ch) {

    ch.assertExchange(ex, 'direct');

    ch.assertQueue('', {exclusive: true}, function(err, q) {
      console.log(" [*] Waiting for getsaldo in %s. To exit press CTRL+C", q.queue);
      ch.bindQueue(q.queue, ex, 'REQ_1406543763');

      ch.consume(q.queue, function(msg) {
        console.log(" [S] < %s", msg.content.toString());
        getSaldo(JSON.parse(msg.content), ch);
      }, {noAck: true});
    });
    
    ch.assertQueue('', {exclusive: true}, function(err, q) {
      console.log(" [*] Waiting for getsaldo in %s. To exit press CTRL+C", q.queue);
      ch.bindQueue(q.queue, ex, 'RESP_1406543763');

      ch.consume(q.queue, function(msg) {
        console.log(" [S] < %s", msg.content.toString());
        saldo.update(msg.content.nilai_saldo);
      }, {noAck: true});
    });
  });
});

function getSaldo(content, ch) {
  return quorum.count()
    .then(counter => {
      if (counter.length > 5) {
        return Nasabah
          .findOne({ 'user_id': content.user_id }, (err, nasabah) => {
            if (err) {
              // console.log(`Error: -4, counter: ${counter}${err}`);
              var result = {
                dest: `RESP_${content.sender_id}`, 
                msg: {
                  action: 'get_saldo',
                  type: 'response',
                  nilai_saldo: -4,
                  ts: new Date().toLocaleString('en-US', { hour12: false })
                }
              };
              console.log(" [S] > %s", JSON.stringify(result));
              return ch.publish(ex, result.dest, new Buffer(JSON.stringify(result.msg)));
            }

            if (!nasabah) {
              // console.log(`Error: -1, counter: ${counter}`);
              var result = {
                dest: `RESP_${content.sender_id}`, 
                msg: {
                  action: 'get_saldo',
                  type: 'response',
                  nilai_saldo: -1,
                  ts: new Date().toLocaleString('en-US', { hour12: false })
                }
              };
              console.log(" [S] > %s", JSON.stringify(result));
              return ch.publish(ex, result.dest, new Buffer(JSON.stringify(result.msg)));
            }

            // console.log(`Success: {nilai_saldo: ${nasabah.nilai_saldo}}, counter: ${counter}`);
            var result = {
              dest: `RESP_${content.sender_id}`, 
              msg: {
                action: 'get_saldo',
                type: 'response',
                nilai_saldo: nasabah.nilai_saldo,
                ts: new Date().toLocaleString('en-US', { hour12: false })
              }
            };
            console.log(" [S] > %s", JSON.stringify(result));
            return ch.publish(ex, result.dest, new Buffer(JSON.stringify(result.msg)));
          });
      } else {
        // console.log(`Error: -2, counter: ${counter}`);
        var result = {
          dest: `RESP_${content.sender_id}`, 
          msg: {
            action: 'get_saldo',
            type: 'response',
            nilai_saldo: -2,
            ts: new Date().toLocaleString('en-US', { hour12: false })
          }
        };
        console.log(" [S] > %s", JSON.stringify(result));
        return ch.publish(ex, result.dest, new Buffer(JSON.stringify(result.msg)));
      }
    })
    .catch(err => {
      // console.log(`Error: ${err}`);
      var result = {
        dest: `RESP_${content.sender_id}`, 
        msg: {
          action: 'get_saldo',
          type: 'response',
          nilai_saldo: -99,
          ts: new Date().toLocaleString('en-US', { hour12: false })
        }
      };
      console.log(" [S] > %s", JSON.stringify(result));
      return ch.publish(ex, result.dest, new Buffer(JSON.stringify(result.msg)));
    });
}