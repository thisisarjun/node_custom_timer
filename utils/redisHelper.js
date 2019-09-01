const q = require('q');


function checkIfKeyExists(redisClient, key){

	var defer = q.defer();
	var isExist;
	
	redisClient.exists(key, (err, exists) => {

		if(err){
			return defer.reject(err);
		}else{
			isExist = !!exists;
			return defer.resolve(isExist);
		}
	});

	return defer.promise;
}

function fetchKey(redisClient, key){
	var defer = q.defer();

	redisClient.get(key, (err, data) => {

		if(err){
			return defer.reject(err);
		}else{			
			return defer.resolve(data);
		}
	});

	return defer.promise;
}

function setKey(redisClient, key, value){
	var defer = q.defer();

	redisClient.set(key, value, (err, data) => {

		if(err){
			return defer.reject(err);
		}else{			
			return defer.resolve(data);
		}
	});

	return defer.promise;
}

function addKey(redisClient, args){

	var defer = q.defer();

	redisClient.zadd(args, (err, data) => {

		if(err){
			return defer.reject(err);
		}else{			
			return defer.resolve(data);
		}
	});

	return defer.promise;

}

function removeKey(redisClient, timer_key, key){

	var defer = q.defer();

	redisClient.zrem(timer_key, key, (err, data) => {

		if(err){
			return defer.reject(err);
		}else{			
			return defer.resolve(data);
		}
	});

	return defer.promise;

}

function getKeysInRange(redisClient,timer_key, min, max){	

	var defer = q.defer();

	let args = [timer_key, max, min];
	redisClient.zrangebyscore(args, (err, data) => {

		if(err){
			return defer.reject(err);
		}else{			
			return defer.resolve(data);
		}
	});

	return defer.promise;
}





module.exports = {	
	deleteKey,
	checkIfKeyExists,
	fetchKey,
	setKey,
	addKey,
	getKeysInRange		
};