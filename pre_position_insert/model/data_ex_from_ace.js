const squel = require("squel").useFlavour('mysql');
const rds_connect = require('../src/rds_connect.js');

exports.index =  async function(event, rds){
    
    if(!event.sql.indexOf("SELECT")){
        
        const data_ex_sql = event.sql;
        return await rds_connect.data_api("select_client_list",data_ex_sql,rds);
        
    }else if(event.flag == "assign1227"){
        
        const data_ex_sql = event.sql;
        return await rds_connect.data_api("u",data_ex_sql,rds);
        
    }else{
        
        return "NG";
        
    }
    
    
    
};
