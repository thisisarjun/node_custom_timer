let options = {
	redisPort:6379,
	redisHost: 'localhost'
};
let node_timer = require('../index');
let nodeTimer = new node_timer(options) ;
let moment = require('moment');

let key = 'Task3';
let time = new Date();
time = new Date().getTime();
console.log("time : ", time);
/*nodeTimer.addTimerEvent(key, time).then(() => {
	console.log('successy success');	
}).catch(err => console.error("err ", err));*/

nodeTimer.processTimer().then(() => {
	console.log('ok');
}).catch((err) => {
	console.error("err ", err);
});