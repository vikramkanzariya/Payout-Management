const mongoose = require('mongoose');
const uri = "mongodb://vikramdalvadi_db_user:6cgSVuBLSIi1Npgr@ac-mmsadwd-shard-00-00.dyc1qhd.mongodb.net:27017,ac-mmsadwd-shard-00-01.dyc1qhd.mongodb.net:27017,ac-mmsadwd-shard-00-02.dyc1qhd.mongodb.net:27017/payout_db?ssl=true&replicaSet=atlas-3gjnv0-shard-0&authSource=admin&retryWrites=true&w=majority";
mongoose.connect(uri)
  .then(() => console.log("Connected successfully!"))
  .catch(err => console.error(err.message));
