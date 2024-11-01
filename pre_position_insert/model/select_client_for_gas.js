const squel = require("squel").useFlavour('mysql');
const rds_connect = require('../src/rds_connect.js');

exports.index =  async function(event, rds){
    
    let client_sql = squel.select()
                .from("clients")
                .left_join("cl_industries","","clients.id = cl_industries.client_id")
                .field("id")
                .field("client")
                .field("GROUP_CONCAT(client_sub_industry_id)","client_sub_industry_id")
                .field("tool_id")
                .group("clients.id")
                .order("id")
                .toString();
                
    
    let client_data =  await rds_connect.data_api("select_client_list",client_sql,rds);
    
    let tool_sql = squel.select()
                .from("tools")
                .field("id")
                .field("tool_name")
                .field("url")
                .field("login_id")
                .field("pass")
                .order("id")
                .toString();
                
    
    let tool_data =  await rds_connect.data_api("select_tool_list",tool_sql,rds);
    return [client_data,tool_data];
};
