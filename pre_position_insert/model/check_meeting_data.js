const squel = require("squel").useFlavour('mysql');
const rds_connect = require('../src/rds_connect.js');

exports.index =  async function(event, rds){
    
    let customers_sql = squel.select()
                .from("customers")
                .join("c_supports","","customers.id = c_supports.customer_id")
                .field("COUNT(*)", "existed")
                .where(`customers.email = '${event.records.email}'`)
                .where(`c_supports.entry_date = '${event.records.entry_date}'`)
                .toString();
                
    
    let customer_data =  await rds_connect.data_api("check_meeting_data",customers_sql,rds);
    
    return [customer_data];
};