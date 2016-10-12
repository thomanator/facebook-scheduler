function post() {
	var config = require('../config.js')
	var db = require('../dbPool.js')
	var Q = require('q')

	this.insert = function(insertObj,option1,option2) {
		var q = Q.defer()
		
		console.log('Coming to post insert',insertObj,option1,option2)		
		db.client.collection('posts').insert(insertObj,function(err) {
			if(err) {
				console.log('Coming to error')
				q.reject(err)
			}
			else {
				console.log('coming to success of post entry')
				q.resolve()
			}						
		})
		return q.promise
	}

	this.find = function(selectCriteria,option1,option2) {
		var q = Q.defer()

		db.client.collection('posts').find(selectCriteria,option1,option2,function(err,posts) {
			if(err) {
				q.reject(err)
			}
			q.resolve(posts)
		})
		return q.promise
	}
}

module.exports = new post() 