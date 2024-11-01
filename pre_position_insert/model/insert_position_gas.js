const squel = require("squel").useFlavour('mysql');
const rds_connect = require('../src/rds_connect.js');

exports.index =  async function(event, rds){
    
    let sql = squel.insert()
                .into("positions")
                .setFieldsRows(event.records)
                .onDupUpdate("open", 1)
                .onDupUpdate("url = VALUES(url)")
                .onDupUpdate("tool_data = VALUES(tool_data)")
                .toString();
    
    return await rds_connect.data_api("insert",sql,rds);
    
};
