function user() {
	var config = require('../config.js')
	var db = require('../dbPool.js')
	var Q = require('q')

	this.find = function(selectCriteria,options1,options2) {		
		var q = Q.defer()

		db.client.collection('users').find(selectCriteria,options1,options2).toArray(function(err,users) {
			if(err) {
				q.reject(err)
			}			
			q.resolve(users)
		})	
		return q.promise
	}

	this.insert = function(insertObject) {
		var q  = Q.defer()

		db.client.collection('users').insert(insertObject,function(err) {
			if (err) {
				q.reject(err)
			}
			q.resolve()
		})
		return q.promise
	}

	this.findOne = function(selectCriteria,options1,options2) {
		var q = Q.defer()
		console.log('Coming to the find one function')
		db.client.collection('users').findOne(selectCriteria,options1,options2,function(err,user) {
			if(err) {
				q.reject(err)
			}			
			console.log('the user is',user)
			q.resolve(user)
		})	
		return q.promise
	}

	this.update = function(selectCriteria,options1,options2) {
		var q = Q.defer()

		db.client.collection('users').update(selectCriteria,options1,options2,function(err,user) {
			if(err) {
				q.reject(err)
			}			
			console.log('Successfully updated')
			q.resolve(user)
		})	
		return q.promise
	}
}

module.exports = new user()
