var config = require('./config.js')
var user = require(config.dir+'/controllers/user.js')
var facebook = require(config.dir+'/controllers/facebook.js')

module.exports = function(app) {
	//user related routes 
	app.post('/register',user.register)
	app.post('/login',user.login)
	app.post('/logout',user.logout)
	app.get('/register',function(req,res) {
		res.sendFile(config.dir+'/public/html/register.html')
	})

	app.get('/fbOauth',facebook.oauth)
	app.get('/fbhandle',facebook.handle)
	app.post('/photo',facebook.photoPhost)

	app.get('/form',function(req,res) {		
		console.log('coming here')
		res.sendFile(config.dir+'/public/html/form.html')
	})
	
}