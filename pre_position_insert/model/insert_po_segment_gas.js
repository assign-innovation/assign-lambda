const squel = require("squel").useFlavour('mysql');
const rds_connect = require('../src/rds_connect.js');

exports.index =  async function(event, rds){
    
    let sql = squel.insert()
                .into("po_segments")
                .setFieldsRows(event.records)
                .onDupUpdate("updated_at", '2022-07-20 00:00:00')
                .toString();
    
    return await rds_connect.data_api("insert",sql,rds);
    
};
