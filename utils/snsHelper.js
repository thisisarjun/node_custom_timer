const q = require('q');

function publishMessage (SNS, message, topic, subject) {
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