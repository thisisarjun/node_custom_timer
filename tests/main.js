const assert = require('assert');
const rewire = require('rewire');
const path = require('path');
const sinon = require('sinon');
const q = require('q');

let timer;
let redisHelper;
let snsHelper;


describe("Process Timer", () => {
		
	let nodeTimer, redisMock, awsMock, publishMessageMock, getKeysInRangeMock, removeKeyMock ;

	before(() => {
		timer = rewire(path.join(__dirname,'../index'));
		redisHelper = rewire(path.join(__dirname, '../utils/redisHelper'))		
		snsHelper = rewire(path.join(__dirname, '../utils/snsHelper'));
	});

	beforeEach(() => {

		redisMock = {
			createClient: function(port, host){
				return true;
			}
		};
		redisHelper.__set__("createClient", redisMock);

		awsMock = {
			SNS: function(){
				return {};
			}
		};
		snsHelper.__set__("createSNSObject", awsMock);
		

		getKeysInRangeMock = function(client, timer, min, max){

			let defer = q.defer();
			defer.resolve(['T1', 'T2', 'T3']);
			return defer.promise;			
		};
		timer.__set__('getKeysInRange', getKeysInRangeMock);
		

		publishMessageMock = function(key){

			let defer = q.defer();
			defer.resolve(key);
			return defer.promise;
		};
		timer.__set__('publishMessage', publishMessageMock);

		removeKeyMock = function(keys){
			let defer = q.defer();
			defer.resolve('success');
			return defer.promise;
		};	
		timer.__set__('removeKey', removeKeyMock);

		nodeTimer = new timer({
			redisPort: 6379,
			redisHost: 'localhost',
			awsAccessKeyId: 'bka',
			awsSecretAccessKey: 'asdasd',
			awsRegion: 'bla'
		});
	});

	afterEach(() => {

	});
	

	it("it should be successfull if everything is successfull", async () => {
		
		try{
			await nodeTimer.processTimer();			
		}catch(err){
			throw err;
		}
	});

	it("it should throw an error if getKeysInRange throws an error", async () => {
		
		let errorString = 'Critical error in redis';
		try{
			let stub = sinon.stub();			
			stub.rejects(new Error(errorString));
			timer.__set__('getKeysInRange', stub);			

			await nodeTimer.processTimer();
		}catch(err){
			assert.equal( errorString, err.message);
		}
	});

	it("it wont call publishMessage if non deleted keys", async () => {
				
		try{
			let publishStub = sinon.stub();
			publishStub.resolves('ok');
			timer.__set__('publishMessage', publishStub);			

			let getKeysStub = sinon.stub();
			getKeysStub.resolves(['1', '2', '3']);
			timer.__set__('getKeysInRange', getKeysStub);

			nodeTimer.non_deleted_keys = ['1', '2', '3'];
			await nodeTimer.processTimer();
			assert.equal(publishStub.called, false);			

		}catch(err){
			throw err;
		}
	});

	it("If publishMessage throw errors are there, it should throw an error", async () => {
				
		try{
			let publishStub = sinon.stub();	
			publishStub.rejects('Errored');
			timer.__set__('publishMessage', publishStub);			

			let getKeysStub = sinon.stub();
			getKeysStub.resolves(['1', '2', '3']);
			timer.__set__('getKeysInRange', getKeysStub);			
			await nodeTimer.processTimer();			

		}catch(err){			
			assert.equal(err.message, 'Failed to Publish Event for following keys 1,2,3');						
		}
	});


	it("If removing from redis throws an error, non_deleted_keys should be populated with the keys", async () => {

		console.log("---");
		console.log("---");
		console.log("---");
		try{					

			let getKeysStub = sinon.stub();
			getKeysStub.resolves(['1', '2', '3']);
			timer.__set__('getKeysInRange', getKeysStub);

			let removeKeyStub = sinon.stub();
			removeKeyStub.rejects('erroreeeed');
			timer.__set__('removeKey', removeKeyStub);
			
			await nodeTimer.processTimer();			
			
			assert.deepEqual(nodeTimer.non_deleted_keys, ['1', '2', '3']);

		}catch(err){			
			throw err;
		}
	});

	it("for consecutive runs, no duplicate keys for non_deleted_keys", async () => {
		try{					

			let getKeysStub = sinon.stub();
			getKeysStub.resolves(['1', '2', '3']);
			timer.__set__('getKeysInRange', getKeysStub);

			let removeKeyStub = sinon.stub();
			removeKeyStub.rejects('erroreeeed');
			timer.__set__('removeKey', removeKeyStub);
			
			await nodeTimer.processTimer();
			await nodeTimer.processTimer();			
			
			assert.deepEqual(nodeTimer.non_deleted_keys, ['1', '2', '3']);

		}catch(err){			
			throw err;
		}
	});

});


describe("Add Timer", () => {
		
	let nodeTimer, redisMock, awsMock, checkIfKeyExistsMock, addKeyMock;

	before(() => {
		timer = rewire(path.join(__dirname,'../index'));				

	});

	beforeEach(() => {

		redisMock = {
			createClient: function(port, host){
				return true;
			}
		};
		timer.__set__("redis", redisMock);

		awsMock = {
			SNS: function(){
				return {};
			}
		};
		timer.__set__("aws", awsMock);
		

		checkIfKeyExistsMock = function(){
			let defer = q.defer();
			defer.resolve(true);
			return defer.promise;
		};
		timer.__set__("checkIfKeyExists", checkIfKeyExistsMock);

		addKeyMock = function(){
			let defer = q.defer();
			defer.resolve(true);
			return defer.promise;
		};
		timer.__set__("addKey", addKeyMock);


		nodeTimer = new timer({
			redisPort: 6379,
			redisHost: 'localhost',
			awsAccessKeyId: 'bka',
			awsSecretAccessKey: 'asdasd',
			awsRegion: 'bla'
		});
	});

	afterEach(() => {

	});
	

	it("it should throw an error if key is duplicate", async () => {
		
		try{
			let checkIfKeyExistsStub = sinon.stub();			 
			checkIfKeyExistsStub.resolves(true);
			timer.__set__("checkIfKeyExists", checkIfKeyExistsStub);
			let key = 'T1';
			let time = new Date().getTime();
			await nodeTimer.addTimerEvent(key, time);						
		}catch(err){
			assert.equal(err.message, 'Duplicate Key');			
		}
	});

	it("it should throw an error if key or time is not present", async () => {
		
		try{			
			await nodeTimer.addTimerEvent();						
		}catch(err){
			assert.equal(err.message, 'Needs a key and time');			
		}
	});

	it("it should be success if everything is alright", async () => {
		
		try{	
			let checkIfKeyExistsStub = sinon.stub();			 
			checkIfKeyExistsStub.resolves(false);
			timer.__set__("checkIfKeyExists", checkIfKeyExistsStub);
			let key = 'T1';
			let time = new Date().getTime();
			await nodeTimer.addTimerEvent(key, time);						
			
		}catch(err){
			throw err;
		}
	});


});