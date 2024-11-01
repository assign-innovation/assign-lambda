const arn = {
    secretArn: process.env.secretArn,
    resourceArn: process.env.resourceArn,
};

exports.create_sqlparams = function(sql, transaction_id){
    let sqlParams = {
        secretArn: arn["secretArn"],
        resourceArn: arn["resourceArn"],
        sql: sql,
        database: 'asnkpi',
        includeResultMetadata: true,
        transactionId: transaction_id
    };
    return sqlParams;
};

exports.create_beginparams = function(){
    let sqlParams = {
        secretArn: arn["secretArn"],
        resourceArn: arn["resourceArn"],
        database: 'asnkpi'
    };
    return sqlParams;
};

exports.create_transactionparams = function(transaction_id){
    let sqlParams = {
        secretArn: arn["secretArn"],
        resourceArn: arn["resourceArn"],
        transactionId: transaction_id
    };
    return sqlParams;
};
