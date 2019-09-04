let options = {
	redisPort:6379,
	redisHost: 'localhost',
	topic: 'topic_arn',
	awsAccessKeyId:'accesskey',
	awsSecretAccessKey: 'secret',
	awsRegion: 'region',
	timerKey: 'tester'

};

let node_timer = require('../index');
let nodeTimer = new node_timer(options) ;
let moment = require('moment');

let key = 'Task3';
let time = new Date();

nodeTimer.addTimerEvent(key, time).then(() => {
	console.log('successfully added timer');	
}).catch(err => console.error("err ", err));

setInterval(async () => {
	try{
		await nodeTimer.processTimer();
	}catch(err){
		console.error("err ", err);
	}
}, 5000);



