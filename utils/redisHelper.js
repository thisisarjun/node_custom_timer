const redis = require('redis');

function createClient(port, host){
	
	return redis.createClient(port, host);

}

function fetchKey(redisClient, key){	

	return new Promise((resolve, reject) => {
		redisClient.get(key, (err, data) => {

			if(err){
				reject(err);
			}else{			
				resolve(data);
			}
		});
	});	
}

function setKey(redisClient, key, value){

	return new Promise((resolve, reject) => {
		redisClient.set(key, value, (err, data) => {

			if(err){
				reject(err);
			}else{			
				resolve(data);
			}
		});
	});

}


function checkIfKeyExists(redisClient, timer_key, key){
	
	var isExist;
	
	return new Promise((resolve, reject) => {
		redisClient.zscore(timer_key, key, (err, exists) => {
			if(err){
				return reject(err);
			}else{
				isExist = !!exists;
				return resolve(isExist);
			}
		});
	});
	
}

function addKey(redisClient, args){

	return new Promise((resolve, reject) => {
		redisClient.zadd(args, (err, data) => {

			if(err){
				return reject(err);
			}else{			
				return resolve(data);
			}
		});
	});
}

function removeKey(redisClient, timer_key, key){


	return new Promise((resolve, reject) => {
		redisClient.zrem(timer_key, key, (err, data) => {

			if(err){
				return reject(err);
			}else{			
				return resolve(data);
			}
		});
	});

}

function getKeysInRange(redisClient, timer_key, min = '-inf', max = 1){	


	return new Promise((resolve, reject) => {
		let args = [timer_key, min, max];
		redisClient.zrangebyscore(args, (err, data) => {
			if(err){
				return reject(err);
			}else{			
				return resolve(data);
			}
		});
	});	

}





module.exports = {	
	createClient,
	checkIfKeyExists,
	fetchKey,
	setKey,
	addKey,
	getKeysInRange,
	removeKey		
};