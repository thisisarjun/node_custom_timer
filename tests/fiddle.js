let options = {
	redisPort:6379,
	redisHost: 'localhost',
	topic: 'arn:aws:sns:us-east-2:316321551255:dummy_local',
	awsAccessKeyId:'AKIAUTJR32OL4EOPFRNY',
	awsSecretAccessKey: 'NYn9dDPwBon3pRfOMhbuL9FtHyVxN/PNs3CyJ2xz',
	awsRegion: 'us-east-2',

};
// !options.awsAccessKeyId || !options.awsSecretAccessKey || !options.awsRegion
let node_timer = require('../index');
let nodeTimer = new node_timer(options) ;
let moment = require('moment');

// let key = 'Task3';
// let time = new Date();
// time = new Date().getTime();
// console.log("time : ", time);
// nodeTimer.addTimerEvent(key, time).then(() => {
// 	console.log('successy success');	
// }).catch(err => console.error("err ", err));

// nodeTimer.processTimer().then(() => {
// 	console.log('ok');
// }).catch((err) => {
// 	console.error("err ", err);
// });

setInterval(async () => {
	try{
		await nodeTimer.processTimer();
	}catch(err){
		console.error("err ", err);
	}
}, 5000);



