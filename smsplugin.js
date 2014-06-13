var SmsPlugin = function () {};

SmsPlugin.prototype.send = function (phone, message, method, successCallback, failureCallback) {
    return cordova.exec(successCallback, failureCallback, 'SmsPlugin', "SendSMS", [phone, message, method]);
};

cordova.addConstructor(function() {
    cordova.addPlugin("sms", new SmsPlugin());
});