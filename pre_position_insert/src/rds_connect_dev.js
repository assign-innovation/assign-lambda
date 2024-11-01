const params = require('./create_sqlparams_dev.js');

exports.data_api = async function(key,sql,rds){
    
    let sql_data = await rds.executeStatement(params.create_sqlparams(sql)).promise();
    if(sql_data.records){
        let res = {[key]:key_insert(sql_data)};
        return res;
    }else{
        return sql_data;
    }
    
    function key_insert(sql_data){
        const array = [];
        for(let i=0;i < sql_data.records.length; i++){
            var obj = {};
            for(var j=0;j < sql_data.columnMetadata.length; j++){
                var resKey = sql_data.columnMetadata[j].label;
                var resValue = Object.values(sql_data.records[i][j])[0];
                obj[resKey] =  resValue;
            }
            array.push(obj);
        }
        return array;
    }
};

exports.begin = async function(rds){
    let transaction_id = await rds.beginTransaction(params.create_beginparams()).promise();
    return transaction_id.transactionId;
};

exports.commit = async function(transaction_id,rds){
    let status = await rds.commitTransaction(params.create_transactionparams(transaction_id)).promise();
    return status.transactionStatus;
};

exports.rollback = async function(transaction_id,rds){
    let status = await rds.rollbackTransaction(params.create_transactionparams(transaction_id)).promise();
    return status.transactionStatus;
};
