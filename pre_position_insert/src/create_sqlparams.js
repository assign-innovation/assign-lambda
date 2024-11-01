exports.create_sqlparams = function(sql){
    let sqlParams = {
        secretArn: process.env.secretArn,
        resourceArn: process.env.resourceArn,
        sql: sql,
        database: 'asnkpi',
        includeResultMetadata: true
    };
    return sqlParams;
};

exports.create_beginparams = function(){
    let sqlParams = {
        secretArn: process.env.secretArn,
        resourceArn: process.env.resourceArn,
        database: 'asnkpi'
    };
    return sqlParams;
};

exports.create_transactionparams = function(transaction_id){
    let sqlParams = {
        secretArn: process.env.secretArn,
        resourceArn: process.env.resourceArn,
        transactionId: transaction_id
    };
    return sqlParams;
};
