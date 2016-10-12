var mongo = require('mongodb').MongoClient

exports.pool = function(cb) {
	
	mongo.connect('mongodb://localhost:27017/sample',function(err,db) {
		if(err) {
			return cb(err)
		}
		else {		
			exports.client = db			
			return cb(null)
		}
	})
}  