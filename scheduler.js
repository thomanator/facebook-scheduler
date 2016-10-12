var config = require('./config.js')
var cron = require('cron').CronJob
var async = require('async')
var mongo = require('mongodb').MongoClient
var request = require('request')
var fs = require('fs')
var zone = 'Asia/Kolkata'
var postModel = require(config.dir+'/models/post.js')
var moment = require('moment')
var userModel = require(config.dir+'/models/user.js')


new cron('00 */5 * * * *',function() {
	console.log('Coming to the scheduler')
	var startTime = moment().startOf('minute').toDate().getTime()

	mongo.connect('mongodb://localhost:27017/sample',function(err,db) {
		if(err) {
			console.log(err)
		}
		else {					
			db.collection('posts').find({scheduledTime:{$eq:startTime}},{},{}).toArray(function(err,posts) {
				if(err) {
					console.log(err)
				}
				else {
					if(posts.length>0) {		

						posts.map(function(post) {
							db.collection('users').findOne({username:post.username},{},{},function(err,user) {
								if(err) {
									console.log(err)
								}
								else {
									var path = config.dir+'/public/upload-files/'+post.path
									console.log('post path',path)
									console.log(fs.createReadStream(path))				
									//var photoUrl = 'https://graph.facebook.com/'+user.facebook.id+'/photos?access_token='+user.facebook.token														
									var serverRequest = request.post('https://graph.facebook.com/me/photos?access_token='+user.facebook.token, function(err, res, body) {						    												
									    if(err) {
									            console.log(err)
									    }
									    else {
									    	console.log('Successfully posted the image')
									    }
									});
									var form = serverRequest.form()
									form.append('message',post.message);
									form.append('source', fs.createReadStream(path));
								}
							})							
						})												
					}
					else {
						console.log('No posts ')
					}
				}				
			})			
		}	
	})	
		
},null,true,zone)