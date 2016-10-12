function user() {
	var config = require('../config.js')
	var bcrypt = require('bcrypt-nodejs')
	var userModel = require(config.dir+'/models/user.js')

	// registering users into the application 

	this.register = function(req,res) {
		var obj = req.body
		var resJson = {
			status: 'failure',
			message: '',
			data: null
		}
		console.log('obj.........................................................',obj)
		console.log('User model',userModel)
		userModel.find({username:obj['username']},{},{}).then(function(users) {
			if(users.length>0) {
				resJson['status'] = 'success'
				resJson['message'] = 'Username exists!'
				return res.json(resJson)
			}
			else {
				obj['password'] = bcrypt.hashSync(obj['password'])
				obj['registeredDate'] = new Date()				
				obj['accessToken'] = new Date().getTime()+obj['username']

				console.log('Insert object..................................................',obj)
				userModel.insert(obj).then(function() {
					resJson['status'] = 'success'
					resJson['data'] = {						
						firstName : obj['firstName'],
						lastName : obj['lastName'],
						accessToken: obj['accessToken']
					}
					return res.json(resJson)
				},function(err) {
					resJson['message'] = err
					return res.json(resJson)
				})										
			}
		},function(err) {
			resJson['message'] = err
			return res.json(resJson)
		})		
	}

	this.login = function(req,res) {
		var obj = req.body
		var resJson = {
			status: 'failure',
			message: '',
			data: null
		}

		userModel.findOne({username:obj.username},{},{}).then(function(user) {
			if(!user) {
				resJson['status'] = 'success'
				resJson['message'] = 'User does not exist'
				return res.json(resJson)							
			}
			else {
				console.log('coming here')
				var result = bcrypt.compareSync(obj.password,user.password)
				if(result==false) {
					resJson['status'] = 'success'
					resJson['message'] = 'Username and password do not match'
					return res.json(resJson)		
				}
				else {
					console.log('the user is',user)
					var accessToken = new Date().getTime()+user.username
					console.log('accessToken........................................',accessToken)
					userModel.update({username:user.username},{$set:{accessToken:accessToken}},{}).then(function() {
						resJson['status'] = 'success'
						resJson['data'] = {
							firstName: user.firstName,
							lastName: user.lastName,
							accessToken: accessToken
						}
						return res.json(resJson)
					},function(err) {
						resJson['message'] = err
						return res.json(resJson)	
					})
				}
			}
		},function(err) {
			resJson['message'] = err
			return res.json(resJson)
		})
	}

	this.logout = function(req,res) {
		var resJson = {
			status: 'failure',
			message: '',
			data: null
		}
		var obj = req.body

		userModel.update({accessToken:obj.accessToken},{$set:{accessToken:''}},{}).then(function() {
			resJson['status'] = 'success'
			return res.json(resJson)
		},function(err) {
			resJson['message'] = err
			return res.json(resJson)
		})
	}
}

module.exports = new user()