var mongoose = require('mongoose');
mongoose.connect('mongodb://heroku_7fkg54g6:14pe8ufq8qncppqghsfjsd6qu7@ds237815.mlab.com:37815/heroku_7fkg54g6', { useMongoClient: true });
mongoose.Promise = global.Promise;

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('db connected');
});

var Schema = mongoose.Schema;

// See http://mongoosejs.com/docs/schematypes.html

var nasabahSchema = new Schema({
	user_id: String,
  nama: String,
  nilai_saldo: Number
})

// export 'Nasabah' model so we can interact with it in other files
module.exports = mongoose.model('Nasabah', nasabahSchema);