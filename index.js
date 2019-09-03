const {
	createSNSObject,
	publishMessage
} = require('./utils/snsHelper');
const {
	createClient,
	checkIfKeyExists,
	addKey,
	getKeysInRange,
	removeKey
} = require('./utils/redisHelper');
const TIMER_KEY = 'node_timer_key';
const q = require('q');


class nodeTimer {

	constructor(options){

		this.redis = {
			port: options.redisPort,
			host: options.redisHost
		};
		this.redisClient = createClient(this.redis.port, this.redis.host);

		this.aws = {};				
		this.aws.accessKeyId = options.awsAccessKeyId;
		this.aws.secretAccessKey = options.awsSecretAccessKey;
		this.aws.region = options.awsRegion;
		this.SNS = createSNSObject(this.aws);

		this.errored_keys = [];
		this.non_deleted_keys = []; //these are 
		this.timerKey = this.timerKey || TIMER_KEY;
	}

	async addTimerEvent(key, time){
		try{
			if(!key || !time){
				throw new Error('Needs a key and time');
			}
			let isKeyExists = await checkIfKeyExists(this.redisClient, this.timerKey, key);
			if(isKeyExists){
				throw new Error('Duplicate Key');
			}
			if(typeof time == 'object'){
				time = new Date(time).getTime();
			}
			let args = [this.timerKey, time, key];
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
			let keys = await getKeysInRange(this.redisClient, this.timerKey, min, max);
			let promises = [];
			
			keys.forEach((key) => {				
				(this.non_deleted_keys.indexOf(key) < 0) && promises.push(publishMessage(key));
			});

			if(promises.length == 0){
				return;
			}

			let results = await q.allSettled(promises);

			// console.log(results);

			let successKeys = [];
			results.forEach((result) => {
				if(result.state == 'fulfilled'){
					successKeys.push(result.value);
				}	
			});			

			let erroredKeys = [];
			keys.forEach((value) => {
				if(successKeys.indexOf(value) < 0){
					erroredKeys.push(value);
				}
			});

			try{
				if(successKeys.length > 0){
					await removeKey(this.redisClient, this.timerKey, this.non_deleted_keys.concat(successKeys));
				}
			}catch(err){
				this.non_deleted_keys = this.non_deleted_keys.concat(successKeys);
				this.non_deleted_keys.filter((value, index, arr) => arr.indexOf(value) == index); //only unique elements
			}			

			if(erroredKeys.length > 0){ // do not delete these, the events should be published in the next tick				
				throw new Error('Failed to Publish Event for following keys ' + erroredKeys.join(','));
			}
						
		}catch(err){
			throw err;
		}


	}


}

module.exports = nodeTimer;