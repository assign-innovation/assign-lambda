const squel = require("squel").useFlavour('mysql');
const rds_connect = require('../src/rds_connect.js');

exports.index =  async function(event, rds){
    
    let sql = squel.insert()
                .into("picks")
                .setFieldsRows(event.records)
                .onDupUpdate("upper_age = VALUES(upper_age)")
                .onDupUpdate("lower_age = VALUES(lower_age)")
                .onDupUpdate("special_note = VALUES(special_note)")
                .onDupUpdate("apply_point = VALUES(apply_point)")
                .onDupUpdate("naitei_image = VALUES(naitei_image)")
                .onDupUpdate("appeal = VALUES(appeal)")
                .onDupUpdate("restriction = VALUES(restriction)")
                .onDupUpdate("income = VALUES(income)")
                .onDupUpdate("sellection_flow = VALUES(sellection_flow)")
                .onDupUpdate("sellection = VALUES(sellection)")
                .onDupUpdate("other = VALUES(other)")
                .onDupUpdate("rank = VALUES(rank)")
                .onDupUpdate("job_detail = VALUES(job_detail)")
                .onDupUpdate("last_company_period_intension_flag = VALUES(last_company_period_intension_flag)")
                .onDupUpdate("gender_intension = VALUES(gender_intension)")
                .onDupUpdate("1_change_age_limit = VALUES(1_change_age_limit)")
                .onDupUpdate("2_change_age_limit = VALUES(2_change_age_limit)")
                .onDupUpdate("school_level_limit_id = VALUES(school_level_limit_id)")
                .onDupUpdate("school_level_upper_limit_id = VALUES(school_level_upper_limit_id)")
                .toString();
    
    return await rds_connect.data_api("insert",sql,rds);
    
};
