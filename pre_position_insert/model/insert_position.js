const squel = require("squel").useFlavour('mysql');
const rds_connect = require('../src/rds_connect.js');

exports.index =  async function(event, rds){
    
    let sql = "INSERT INTO positions(client_id,pick_id,full_position,position,open,job_detail,requirement,offer,address,other,url,offer_upper_limit,offer_lower_limit) VALUES" + event.records + ";";
    
    return sql;
    
    // return await rds_connect.data_api("insert",sql,rds);
    
};


