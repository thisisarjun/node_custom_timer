const aws = require('aws-sdk');

const config = require('../config/config');
const snsConfig = config.snsParams;
const SNS = new aws.SNS(snsConfig);

const q = require('q');

function publishMessage (message, topic, subject) {
  const defer = q.defer();

  if (typeof message !== 'string') {
    message = JSON.stringify(message);
  }
  let params = {
    TargetArn: topic,
    Message: message
  };

  if (subject) {
    params.Subject = subject;
  }

  SNS.publish(params, (err, data) => {
    if (err) {
      return defer.reject(err);
    }
    defer.resolve(`Published with MessageId :  ${data.MessageId}`);
  });

  return defer.promise;
}

module.exports = {
	publishMessage	
};