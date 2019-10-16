let options = {	
    redisPort:6379,
    redisHost: 'localhost',
    topic: 'arn:aws:sns:us-east-2:316321551255:dummy_local',
    awsAccessKeyId:'AKIAUTJR32OL4EOPFRNY',
    awsSecretAccessKey: 'NYn9dDPwBon3pRfOMhbuL9FtHyVxN/PNs3CyJ2xz',
    awsRegion: 'us-east-2',
    timerKey: 'tester'
};

let node_timer = require('../index');
let nodeTimer = new node_timer(options) ;

let key = 'Task3';
let time = new Date();

nodeTimer.addTimerEvent(key, time).then(() => {
	console.log('successfully added timer');	
}).catch(err => console.error("err ", err));

setInterval(async () => {
	try{
		await nodeTimer.processTimer();
		console.log('successfully bla bla');
	}catch(err){
		console.error("err ", err);
	}
}, 5000);



