// 必要なモジュールを読み込み
const AWS = require('aws-sdk');
const rds = new AWS.RDSDataService();
const squel = require('squel');
const formatter = require("./src/formatter_response.js");
const rds_connect = require("./src/rds_connect.js");


// 処理
exports.handler = async (event, context, callback) => {
    
    try{
        
        console.log(event);
        
        const resource = event.resource;
        let res;
    
        if(resource == "/users/create"){
            res = await require("./functions/insert.js").index(event, rds, squel, rds_connect, formatter);
        }else if(resource == "/items/search"){
            res = await require("./functions/select.js").index(event, rds, squel, rds_connect, formatter);
        }else{
            return formatter.formatJSONResponseBadRequest({res: "invalid request"});
        }
        
        return res;
        
    }catch(err){
        
        console.log(err);
        return formatter.formatJSONResponseServerError("error");
        
    }
};