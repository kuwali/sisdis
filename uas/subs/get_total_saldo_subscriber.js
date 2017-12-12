const amqp = require('amqplib/callback_api');
const quorum = require('../model/quorum');
const saldo = require('../model/saldo');
const Nasabah = require('../model/nasabah');
const getSaldo = require('../pubs/get_saldo_publisher');
const getTotalSaldo = require('../pubs/get_total_saldo_publisher');
const ex = 'EX_GET_TOTAL_SALDO';
var error = false;

amqp.connect('amqp://sisdis:sisdis@172.17.0.3:5672', function (err, conn) {
  conn.createChannel(function (err, ch) {

    ch.assertExchange(ex, 'direct');

    ch.assertQueue('', { exclusive: true }, function (err, q) {
      console.log(" [*] Waiting for getTotalsaldo in %s. To exit press CTRL+C", q.queue);
      ch.bindQueue(q.queue, ex, 'REQ_1406543763');

      ch.consume(q.queue, function (msg) {
        console.log(" [A] < %s", msg.content.toString());
        saldo.remove();
        getTotalSaldoRunner(JSON.parse(msg.content), ch);
      }, { noAck: true });
    });

    ch.assertQueue('', { exclusive: true }, function (err, q) {
      console.log(" [*] Waiting for getTotalsaldo in %s. To exit press CTRL+C", q.queue);
      ch.bindQueue(q.queue, ex, 'RESP_1406543763');

      ch.consume(q.queue, function (msg) {
        console.log(" [A] < %s", msg.content.toString());
        if (Number(msg.content.nilai_saldo) > -1) {
          saldo.update(msg.content.nilai_saldo);
        } else {
          error = true;
        }
      }, { noAck: true });
    });
  });
});

function getTotalSaldoRunner(content, ch) {
  return quorum.count()
    .then(counter => {
      if (counter.length > 5) {
        let list = quorum.list();
        if (content.user_id === '1406543763') {
          return Bluebird.each(counter, cabang => {
            getSaldo(cabang);
          })
            .then(() => {
              if (error) {
                // console.log(`Error: -3`);
                var result = {
                  dest: `RESP_${content.sender_id}`,
                  msg: {
                    action: 'get_total_saldo',
                    type: 'response',
                    nilai_saldo: -3,
                    ts: new Date().toLocaleString('en-US', { hour12: false })
                  }
                };
                console.log(" [A] > %s", JSON.stringify(result));
                return ch.publish(ex, result.dest, new Buffer(JSON.stringify(result.msg)));
              }
              
              return saldo.fetch().then(saldoTotal => {
                // console.log(`Success: ${saldoTotal}`);
                var result = {
                  dest: `RESP_${content.sender_id}`,
                  msg: {
                    action: 'get_total_saldo',
                    type: 'response',
                    nilai_saldo: saldoTotal,
                    ts: new Date().toLocaleString('en-US', { hour12: false })
                  }
                };
                console.log(" [A] > %s", JSON.stringify(result));
                return ch.publish(ex, result.dest, new Buffer(JSON.stringify(result.msg)));
              })
            })
            .catch(err => {
              // console.log(`Error: -3, counter: ${counter}${err}`);
              var result = {
                dest: `RESP_${content.sender_id}`,
                msg: {
                  action: 'get_total_saldo',
                  type: 'response',
                  nilai_saldo: -3,
                  ts: new Date().toLocaleString('en-US', { hour12: false })
                }
              };
              console.log(" [A] > %s", JSON.stringify(result));
              return ch.publish(ex, result.dest, new Buffer(JSON.stringify(result.msg)));
            });
        } else {
          return getTotalSaldo(content.user_id);
        }
      } else {
        // console.log(`Error: -2, counter: ${counter}`);
        var result = {
          dest: `RESP_${content.sender_id}`,
          msg: {
            action: 'get_total_saldo',
            type: 'response',
            nilai_saldo: -2,
            ts: new Date().toLocaleString('en-US', { hour12: false })
          }
        };
        console.log(" [A] > %s", JSON.stringify(result));
        return ch.publish(ex, result.dest, new Buffer(JSON.stringify(result.msg)));
      }
    })
    .catch(err => {
      // console.log(`Error: ${err}`);
      var result = {
        dest: `RESP_${content.sender_id}`,
        msg: {
          action: 'get_total_saldo',
          type: 'response',
          nilai_saldo: -99,
          ts: new Date().toLocaleString('en-US', { hour12: false })
        }
      };
      console.log(" [A] > %s", JSON.stringify(result));
      return ch.publish(ex, result.dest, new Buffer(JSON.stringify(result.msg)));
    });
}