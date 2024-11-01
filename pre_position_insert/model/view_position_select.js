const squel = require("squel").useFlavour('mysql');
const rds_connect = require('../src/rds_connect.js');

exports.index =  async function(event, rds){
    
    let sql = squel.update()
                .table("positions")
                .set("open", false)
                .where("client_id IN (SELECT id FROM clients WHERE tool_id != 125 AND tool_id != 126 AND tool_id != 140)")
                .toString();
    
    
    return await rds_connect.data_api("update",sql,rds);
    
};
