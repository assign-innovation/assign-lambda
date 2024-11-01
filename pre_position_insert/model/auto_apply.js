const squel = require("squel").useFlavour('mysql');
const rds_connect = require('../src/rds_connect.js');

exports.index =  async function(event, rds){
    
    // 応募情報を取得
    let apply_data_select = squel.select()
                                .from("cs_auto_applies")
                                .join("positions","","cs_auto_applies.position_id = positions.id")
                                .join("clients","","positions.client_id = clients.id")
                                .join("tools","","clients.tool_id = tools.id")
                                .left_join("client_pic","","clients.id = client_pic.client_id")
                                .field("client_short","client")
                                .field("positions.full_position","position")
                                .field("positions.url","position_url")
                                .field("tool_name","tool")
                                .field("tools.url","general_url")
                                .field("login_id","login_id")
                                .field("pass","pass")
                                .field("c_support_id","c_support_id")
                                .field("GROUP_CONCAT(client_pic.email)","email")
                                .where("cs_auto_applies.reserve_id IN(?)",event.records)
                                .group("positions.id")
                                .toString();
                                
    const apply_data = await rds_connect.data_api("applies",apply_data_select,rds);
    let c_support_id = apply_data.applies[0].c_support_id;
                                
    // エージェント情報を取得
    let agent_data_select = squel.select()
                                .from("agents")
                                .field("email")
                                .field("phone")
                                .field("last_name")
                                .field("first_name")
                                .field("signature")
                                .where("agents.id IN(?)",event.records)
                                .toString();
    
    // 転職者情報を取得
    let customer_data_select = squel.select()
                                .from("c_supports")
                                .join("customers","","c_supports.customer_id = customers.id")
                                .join("c_schools","","c_schools.customer_id = customers.id")
                                .join("schools","","c_schools.school_id = schools.id")
                                .join("c_companies","","customers.id = c_companies.customer_id")
                                .join("companies","","c_companies.company_id = companies.id")
                                .join("genders","","customers.gender_id = genders.id")
                                .left_join(
                                    squel.select()
                                    .from("c_supports")
                                    .join("c_schools","","c_supports.customer_id = c_schools.customer_id")
                                    .field("MAX(c_schools.leave_date)","leave_date_alias")
                                    .where("c_supports.id IN(?)",c_support_id)
                                    .group("c_supports.id")
                                ,"c_schools_alias","c_schools.leave_date = c_schools_alias.leave_date_alias")
                                .left_join(
                                    squel.select()
                                    .from("c_supports")
                                    .join("c_companies","","c_supports.customer_id = c_companies.customer_id")
                                    .field("MAX(c_companies.join_date)","join_date_alias")
                                    .where("c_supports.id IN(?)",c_support_id)
                                    .group("c_supports.id")
                                ,"c_companies_alias","c_companies.join_date = c_companies_alias.join_date_alias")
                                .field("customers.last_name","last_name")
                                .field("customers.first_name","first_name")
                                .field("customers.last_kana","last_kana")
                                .field("customers.first_kana","first_kana")
                                .field("customers.birthday","birthday")
                                .field("genders.gender","gender")
                                .field("customers.phone","phone")
                                .field("customers.email","email")
                                .field("schools.school","school")
                                .field("c_schools.undergraduate","undergraduate")
                                .field("c_schools.join_date","school_join_date")
                                .field("c_schools.leave_date","school_leave_date")
                                .field("companies.company","company")
                                .field("c_companies.join_date","company_join_date")
                                .field("c_companies.leave_date","company_leave_date")
                                .field("customers.income","income")
                                .field("c_supports.id","c_support_id")
                                .field("c_supports.customer_id","customer_id")
                                .where("c_supports.id IN(?)",c_support_id)
                                .group("c_supports.id")
                                .toString();
                                
    // EYとリクルートのツール情報を取得
    let tools = squel.select()
                    .from("tools")
                    .field("tool_name","tool")
                    .field("url")
                    .field("login_id")
                    .field("pass")
                    .where("id IN (8,130,132,133,134,135,136)")
                    .order("id")
                    .toString();
                                
    
    const apply_data_2 = rds_connect.data_api("applies",apply_data_select,rds);
    const customer_data = rds_connect.data_api("customer",customer_data_select,rds);
    const agent_data = rds_connect.data_api("agent",agent_data_select,rds);
    const tools_data = rds_connect.data_api("tools",tools,rds);
    
    const res = Promise.all([agent_data,customer_data,apply_data_2,tools_data]).then();
    return res;
    
};
