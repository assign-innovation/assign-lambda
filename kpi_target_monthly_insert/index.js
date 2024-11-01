const AWS = require('aws-sdk');
const rdsDataService = new AWS.RDSDataService();

const arn = require('./arn.json');
function create_sqlparams(sql){
    let sqlParams = {
        secretArn: arn["secretArn"],
        resourceArn: arn["resourceArn"],
        sql: sql,
        database: 'asnkpi',
        includeResultMetadata: true
    };
    return sqlParams;
}

function formatDate(dt) {
  var y = dt.getFullYear();
  var m = ('00' + (dt.getMonth()+1)).slice(-2);
  var d = ('00' + dt.getDate()).slice(-2);
  return (y + '-' + m + '-' + d);
}

exports.handler = async (event, context, callback) => {
    
    let select_tag_ids = `SELECT id FROM tags`;
    
    let now = new Date();
    let nextMonth = formatDate(new Date(now.getFullYear(), now.getMonth() + 1, 1));
    
    const tags_id_list = await rdsDataService.executeStatement(create_sqlparams(select_tag_ids)).promise();
    
    let tag_insert_list = []
    
    for(let tag_index = 0; tag_index < tags_id_list.records.length; tag_index++){
        
        let upsert_kpi_targets_sql = `INSERT INTO\
                                        target_kpi(tag_id,month)\
                                        VALUES (${tags_id_list.records[tag_index][0].longValue}, "${nextMonth}")\
                                        ;`;
        try{
            await rdsDataService.executeStatement(create_sqlparams(upsert_kpi_targets_sql)).promise();
        }
        catch{}
        tag_insert_list[tag_index] = tags_id_list.records[tag_index][0].longValue
    }
    
    callback(null,tag_insert_list)
};
