const AWS = require('aws-sdk');
const rds = new AWS.RDSDataService();

exports.handler =  async (event, context, callback) => {

    const path = event.route;
    let req;
    if(path == "click-event"){
        req = require('./model/first-meeting-reminder-click.js');
    }
    else if(path == "error") {
        req = require('./model/err.js');
    }
    else {
        const err_res = {
            statusCode: 400,
            body: JSON.stringify({
                res: "No such route exists"
            }),
            headers: {
                'Content-Type': 'application/json',
            }
        };
        callback(JSON.stringify(err_res));
    }
    
    const res = await req.index(event, rds);
    if(res.statusCode === 200){
        callback(null, res);
    }else{
        callback(JSON.stringify(res));
    }
    

};
