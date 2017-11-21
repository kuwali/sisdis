var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// See http://mongoosejs.com/docs/schematypes.html

var nasabahSchema = new Schema({
	user_id: String,
  nama: String,
  nilai_saldo: Number
})

// export 'Nasabah' model so we can interact with it in other files
module.exports = mongoose.model('Nasabah', nasabahSchema);