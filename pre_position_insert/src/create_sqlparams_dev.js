exports.create_sqlparams = function(sql){
    let sqlParams = {
        secretArn: process.env.secretArnDev,
        resourceArn: process.env.resourceArnDev,
        sql: sql,
        database: 'asnkpi',
        includeResultMetadata: true
    };
    return sqlParams;
};

exports.create_beginparams = function(){
    let sqlParams = {
        secretArn: process.env.secretArnDev,
        resourceArn: process.env.resourceArnDev,
        database: 'asnkpi'
    };
    return sqlParams;
};

exports.create_transactionparams = function(transaction_id){
    let sqlParams = {
        secretArn: process.env.secretArnDev,
        resourceArn: process.env.resourceArnDev,
        transactionId: transaction_id
    };
    return sqlParams;
};
