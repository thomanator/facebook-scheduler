var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var config = require('./config.js')
var dbPool = require('./dbPool.js')

app.use(bodyParser.json())

require('./routes.js')(app)
dbPool.pool(function(err) {
	if(err) {
		console.log('Db pool error')
	}
	else {
		console.log('Succesfully pooled')
		app.listen(config.port,function() {
			console.log('The app is listening on',config.port)
		})		
	}
})


