const AWS = require("aws-sdk");

exports.index =  async function(event){

    let data = event.file_data.replace('data:application/pdf;base64,', "")
    const base64Data = Buffer.from(data,"base64");
    
    // S3にfileを格納する処理
    const bucketParams = {
      Bucket: 'asnkpi-for-ace',
      Key: 'file_for_pdf/' + event.key,
      Body: base64Data,
      ContentType: 'application/pdf'
    };
    
    let result = '';
    
    const s3 = new AWS.S3();
    try {
        await s3.putObject(bucketParams).promise();
        result = 'complete';
        
    } catch (err) {
        result = err;
    };
      
    return result;
}