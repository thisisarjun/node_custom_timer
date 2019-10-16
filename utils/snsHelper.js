const aws = require('aws-sdk');

function createSNSObject(snsOption){
  
  let sns = new aws.SNS(snsOption);
  return sns;

}

  
function publishMessage (SNS, message, topic, subject) {

  return new Promise((resolve, reject) => {
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
        return reject(err);
      }
      resolve(data);
    });
  });

}

module.exports = {
  createSNSObject,
	publishMessage	
};