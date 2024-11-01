const AWS = require('aws-sdk');
const rds = new AWS.RDSDataService();

exports.handler =  async (event, context, callback) => {
    
    const path = event.route;
    console.log("invocated", path);
    const req = require('./model/'+path+'.js');
    const res = await req.index(event, rds);
    callback(null, res);
    
};
