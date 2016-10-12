function facebook() {
	var config = require('../config.js')
	var userModel = require(config.dir+'/models/user.js')
	var postModel = require(config.dir+'/models/post.js')
	var request = require('request')
	var Q = require('q')
	var fs = require('fs')
	var formidable = require('formidable')	
	var moment = require('moment')
	
	
	this.oauth = function(req,res) {
		res.redirect(config.fbOauthUrl+'?client_id='+config.fbId+'&response_type=code&redirect_uri=http://localhost:3000/fbhandle&scope=public_profile,publish_actions,publish_pages,manage_pages')
	}

	this.handle = function(req,res) {				
		var resJson = {
			status:'failure',
			message: '',
			data: null
		}

		request({
			method:'get',
			url: 'https://graph.facebook.com/oauth/access_token?client_id='+config.fbId+'&redirect_uri=http://localhost:3000/fbhandle&client_secret='+config.fbSecret+'&code='+req.query.code
		},function(err,response,body) {			
			var shortToken = body.split('=')[1]
			tokenConverter(shortToken).then(function(longToken) {			
				console.log('Coming after token converter')	
				informationFetcher(longToken).then(function(data) {		
					pagesGetter(data).then(function(dataNew) {					
						userModel.update({username:'vikramthomas93@gmail.com'},{$set:{facebook:dataNew}},{}).then(function() {
							/*
							resJson['status'] = 'success'
							resJson['message'] = 'Successfully authenticated facebook'
							console.log('updated')
							return res.json(resJson)
							*/
							console.log('Successfully processed oauth login')				
						},function(err) {
							console.log('Come to error',err)	
						})
					},function(err) {
						console.log('Come to error',err)
					})				
				},function(err) {
					console.log('Coming to error',err)	
				})	
			},function(err) {
				console.log('Come to error',err)
			})			
		})
	}

	this.photoPhost = function(req,res) {
		var form = new formidable.IncomingForm()
		var photo=true,scheduled=true
		var resJson = {
			status: 'failure',
			message: '', 
			data: null
		}

		userModel.findOne({username:'vikramthomas93@gmail.com'},{},{}).then(function(user) {						
			form.parse(req,function(err,fields,files) {
				if(err) {
					resJson['message'] = err
					return res.json(resJson)
				}						
				//make changes for scheduled posts
				if(photo) {
					if(!scheduled) {					
						photoUploader(files,fields,user).then(function() {
							resJson['status'] = 'success'
						    return res.json(resJson)
						},function(err) {
							resJson['message'] = err
							return res.json(resJson)
						})
					    /*																																		
						var photoUrl = 'https://graph.facebook.com/'+user.facebook.id+'/photos?access_token='+user.facebook.token														
						var serverRequest = request.post('https://graph.facebook.com/me/photos?access_token='+user.facebook.token, function(err, res, body) {						    									
						    if(err) {
						        resJson['message'] = err
								return res.json(resJson)
						    }
						    else {
						    	resJson['status'] = 'success',
						    	return res.json(resJson)						    	
						    }
						});

						var form = serverRequest.form()
						form.append('message',fields.caption);
						form.append('source', fs.createReadStream(files.upload.path));																																			
						*/
					}
					else {
						photoScheduler(files,fields,user).then(function() {
							console.log('Successfully scheduled the post')
							resJson['status'] = 'success'
							return res.json(resJson)
						},function(err) {
							resJson['message'] = err
							return res.json(resJson)
						})			
						/*						
						fs.readFile(files.upload.path,function(err,data) {
							if(err) {
								console.log(err)
							}
							else {								
								var insertPath = user.username+new Date().getTime()+'.png'
								fs.writeFile(config.dir+'/public/upload-files/'+insertPath,data,function(err) {
									if(err) {
										console.log(err)
									}
									else {
										var scheduledTime = moment('2016-10-11T06:15:00').toDate().getTime()
										var postObject = {
											path: insertPath,
											scheduledTime: scheduledTime,
											username: user.username,
											message: fields.caption,
											scheduled: true									
										}

										postModel.insert(postObject,{},{}).then(function() {
											resJson['status'] = 'success'
											return res.json(resJson)
										},function(err) {
											resJson['message'] = err
											return res.json(resJson)
										})
									}
								})
							}									
						})
						*/																																																				
					}					
				}		
				else {

				}			
			})
		},function(err) {
			console.log(err)	
		})
	}

	// A function that converts a short term facebook access token to a long term facebook access token 
	function tokenConverter(shortToken) {
		var q = Q.defer()
		console.log('short token',shortToken)
		request({
			method: 'get',
			url: 'https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id='+config.fbId+'&client_secret='+config.fbSecret+'&fb_exchange_token='+shortToken
		},function(err,response,body) {
			if(err) {
				q.reject(err)
			}			
			console.log('body',body)			
			var longAccessToken = body.split('=')[1]
			console.log('Long access token',longAccessToken)
			q.resolve(longAccessToken)
		})	
		return q.promise
	}

	function informationFetcher(longAccessToken) {
		var q = Q.defer()		
		request({
			method:'get',
			url:'https://graph.facebook.com/me?access_token='+longAccessToken
		},function(err,response,body) {
			if(err) {
				q.reject(err)
			}						
			var data = {
				token: longAccessToken,
			    id: JSON.parse(body).id
			}			
			q.resolve(data)
		})
		return q.promise
	}

	// A function that fetches all the facebook page related information with regard to a user 
	function pagesGetter(data) {
		var q = Q.defer()		
		request({
			method:'get',
			url:'https://graph.facebook.com/me/accounts?access_token='+data['token']
		},function(err,response,body) {
			if(err) {
				q.reject(err)
			}			
			var pages = JSON.parse(body).data
			data['pages'] = pages
			console.log('The data to be updated is',data)
			q.resolve(data)
		})
		return q.promise
	}

	function photoUploader(files,fields,user) {																
		var q = Q.defer()

		var serverRequest = request.post('https://graph.facebook.com/me/photos?access_token='+user.facebook.token, function(err, res, body) {						    									
		    if(err) {
				q.reject(err)        
		    }
		    else {
		    	q.resolve()
		    }
		});

		var form = serverRequest.form()
		form.append('message',fields.caption);
		form.append('source', fs.createReadStream(files.upload.path));
		return q.promise
	}

	function photoScheduler(files,fields,user) {
		var q = Q.defer()
		var postModel = require(config.dir+'/models/post.js')
		fs.readFile(files.upload.path,function(err,data) {
			if(err) {
				q.reject(err)
			}
			else {								
				var insertPath = user.username+new Date().getTime()+'.png'
				fs.writeFile(config.dir+'/public/upload-files/'+insertPath,data,function(err) {
					if(err) {
						q.reject(err)
					}
					else {
						var scheduledTime = moment('2016-10-11T19:55:00').toDate().getTime()
						var postObject = {
							path: insertPath,
							scheduledTime: scheduledTime,
							username: user.username,
							message: fields.caption,
							scheduled: true									
						}
						console.log('post object',postObject)
						console.log('Coming to before user model insert')
						postModel.insert(postObject,{},{}).then(function() {
							console.log('Coming here to success')
							q.resolve()
						},function(err) {
							q.reject(err)
						})
					}
				})
			}									
		})
		return q.promise	
	}


}

module.exports = new facebook()

//https://graph.facebook.com/oauth/access_token?client_id=XXXXXXXX&redirect_uri=&client_secret=XXXXXX&code=2.AQCovUOFCduELbna.3600.1323900000.1-773555243|Y_cW4riF4K7el_9a4oVNjL0qvZc



















