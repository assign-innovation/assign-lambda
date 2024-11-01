const squel = require("squel").useFlavour('mysql');
const rds_connect = require('../src/rds_connect.js');

exports.index =  async function(event, rds){
    
    const sql = squel.insert()
                    .into("positions")
                    .setFieldsRows(event.req)
                    .onDupUpdate("passive_smoking_prevention_policy = VALUES(passive_smoking_prevention_policy)")
                    .onDupUpdate("employment_status = VALUES(employment_status)")
                    .onDupUpdate("probation_flag = VALUES(probation_flag)")
                    .onDupUpdate("probation_period = VALUES(probation_period)")
                    .onDupUpdate("working_hours = VALUES(working_hours)")
                    .onDupUpdate("break_time = VALUES(break_time)")
                    .onDupUpdate("overtime_work_flag = VALUES(overtime_work_flag)")
                    .onDupUpdate("holidays = VALUES(holidays)")
                    .onDupUpdate("insurance_enrollment_flag = VALUES(insurance_enrollment_flag)")
                    .onDupUpdate("job_info_complete = VALUES(job_info_complete)")
                    .toString();
    
    return await rds_connect.data_api("insert",sql,rds);
    
};
