const redis = require('redis');
const aws = require('aws-sdk');
const {
	publishMessage
} = require('./utils/snsHelper');
const {
	checkIfKeyExists,
	addKey,
	getKeysInRange
} = require('./utils/redisHelper');
const TIMER_KEY = 'node_timer_key';


class nodeTimer {

	constructor(options){

		this.redis = {
			port: options.redisPort,
			host: options.redisHost
		};
		this.redisClient = redis.createClient(this.redis.port, this.redis.host);
				
		this.aws.accessKeyId = options.awsAccessKeyId;
		this.aws.secretAccessKey = options.awsAccessKeyId;
		this.aws.region = options.awsRegion;
		this.SNS = new aws.SNS(this.aws);

		this.timerKey = this.timerKey || TIMER_KEY;
	}

	async addTimerEvent(key, time){		
		try{
			if(!key || !time){
				throw new Error('Needs a key and time');
			}
			let isKeyExists = await checkIfKeyExists(key);
			if(isKeyExists){
				throw new Error('Duplicate Key');
			}
			if(typeof time == 'object'){
				time = new Date(time).getTime();
			}
			let args = [this.timerKey, key, time];
			await addKey(this.redisClient, args);
		}catch(err){
			throw err;
		}	
	}

	async processTimer(){

		try{
			let currentTime = new Date().getTime();
			let min = 0;
			let max = currentTime;
			let keys = await getKeysInRange(this.timerKey, min, max);
			let promises = [];
			keys.forEach(keys, (key) => {
				promises.push(publishMessage(key));
			});

			let results = await Promise.allSettled(promises);
			/*
				TODO : insert into error lrange
				a retry mechanism to publish on errored ones.
			 */
		}catch(err){
			throw err;
		}


	}


}

module.exports = {
	nodeTimer	
};