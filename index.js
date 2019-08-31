const redis = require('redis');
const aws = require('aws-sdk');

class nodeTimer {

	constructor(options){
		this.redis = {
			port: options.redisPort,
			host: options.redisHost
		};
		this.redisClient = redis.createClient(this.redis.port, this.redis.host);
	}
}