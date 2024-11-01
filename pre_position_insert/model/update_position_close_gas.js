const squel = require("squel").useFlavour('mysql');
const rds_connect = require('../src/rds_connect.js');

exports.index =  async function(event, rds){
    
    let sql = squel.update()
                    .table("positions")
                    .set("open = false")
                    .where("open = true")
                    .where("client_id IN (SELECT id FROM clients WHERE tool_id NOT IN (125,126,140))")
                    .where("updated_at < DATE_SUB(CURRENT_DATE, INTERVAL 2 DAY)")
                    .toString();
    
    return await rds_connect.data_api("select",sql,rds);
    
};
