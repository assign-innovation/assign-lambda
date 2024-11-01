const AWS = require('aws-sdk');
const rdsDataService = new AWS.RDSDataService();

const squel = require("squel").useFlavour('mysql');
const arn = require('./arn.json');

let current_month_first_date = new Date();
let current_month_last_date = new Date();
let last_month_last_date = new Date();

current_month_first_date.setDate(1);
current_month_last_date.setMonth(current_month_last_date.getMonth() + 1)
current_month_last_date.setDate(0);
last_month_last_date.setMonth(last_month_last_date.getMonth());
last_month_last_date.setDate(0)

current_month_first_date = "'" + current_month_first_date.toISOString().split("T")[0] + "'"
current_month_last_date = "'" + current_month_last_date.toISOString().split("T")[0] + "'"
last_month_last_date = "'" + last_month_last_date.toISOString().split("T")[0] + "'"

function create_sqlparams(sql){
    let sqlParams = {
        secretArn: arn["secretArn"],
        resourceArn: arn["resourceArn"],
        sql: sql,
        database: 'asnkpi',
        includeResultMetadata: false
    };
    return sqlParams
}

function formatDate(dt) {
  var y = dt.getFullYear();
  var m = ('00' + (dt.getMonth()+1)).slice(-2);
  var d = ('00' + dt.getDate()).slice(-2);
  return (y + '-' + m + '-' + d);
}

exports.handler =  async (event, context, callback) => {
    console.log(event);
    switch (event['route']) {
        case 'crm_output_select':
            
            let support_finished_update = squel.update()
                                            .table("c_supports")
                                            .set("support_finished",1)
                                            .where(`support_status_id >= 7 or release_reason_id >= 2`)
                                            .toString()
                                            
            await rdsDataService.executeStatement(create_sqlparams(support_finished_update)).promise();
                                            
            
            // let crm_output_select_sql = squel.select()
            
            //             .field("MAX(c_supports.release_reason_id)","release_reason_id_flag")
            //             .field("MAX(c_supports.support_status_id)","support_status_flag")
            //             .field("c_supports.first_meeting_date")
            //             .field("customers.last_name")
            //             .field("customers.first_name")
            //             .field("agents.last_name")
            //             .field("agents.first_name")
            //             .field("MAX(c_supports.digital_ng_reason_id)","digital_ng_reason_id_flag")
            //             .field("customers.email")
            //             .field("customers.phone")
            //             .field("c_schools_alias.school_alias")
            //             .field("c_schools_alias.school_level_alias")
            //             .field("c_companies_alias.company_alias")
            //             .field("c_companies_alias.main_industry_alias")
            //             .field("c_companies_alias.sub_industry_alias")
            //             .field("c_jobs_alias.main_job_alias2")
            //             .field("c_jobs_alias.sub_job_alias2")
            //             .field("c_jobs_alias.job_period_alias2")
            //             .field("customers.birthday")
            //             .field("customers.income")
            //             .field("channels.channel")
            //             .field("c_supports.entry_date")
            //             .field("c_supports.id")
            //             .field("c_supports.customer_id")
            //             .field("c_supports.agent_id")
            //             .field("MIN(c_supports.support_finished)","support_finished_flag")
                        
            //             .from("customers")
            //             .left_join("c_supports","","customers.id=c_supports.customer_id")
            //             .left_join("agents","","c_supports.agent_id=agents.id")
            //             .left_join("channels","","c_supports.channel_id=channels.id")
            //             .left_join("support_statuses","","c_supports.support_status_id=support_statuses.id")
            //             .left_join("release_reasons","","c_supports.release_reason_id=release_reasons.id")
            //             .left_join("digital_ng_reasons","","c_supports.digital_ng_reason_id=digital_ng_reasons.id")
                        
            //             .left_join(squel.select()
            //                 .field("c_companies.customer_id","customer_id_alias")
            //                 .field("companies.id","company_id_alias")
            //                 .field("companies.company","company_alias")
            //                 .field("c_companies.join_date","join_date_alias")
            //                 .field("main_industries.main_industry","main_industry_alias")
            //                 .field("sub_industries.sub_industry","sub_industry_alias")
            //                 .from("c_companies")
            //                 .left_join("companies","","c_companies.company_id=companies.id")
            //                 .left_join("sub_industries","","companies.sub_industry_id = sub_industries.id")
            //                 .left_join("main_industries","","sub_industries.main_industry_id = main_industries.id")
            //                 ,"c_companies_alias","c_supports.customer_id=c_companies_alias.customer_id_alias")
                            
            //             .left_join(squel.select()
            //                 .field("c_schools.customer_id","customer_id_alias")
            //                 .field("schools.id","school_id_alias")
            //                 .field("schools.school","school_alias")
            //                 .field("MAX(c_schools.leave_date)","leave_date_alias")
            //                 .field("school_levels.school_level","school_level_alias")
            //                 .from("c_schools")
            //                 .left_join("schools","","c_schools.school_id=schools.id")
            //                 .left_join("school_levels","","schools.school_level_id=school_levels.id")
            //                 .group("customer_id_alias")
            //                 ,"c_schools_alias","c_supports.customer_id=c_schools_alias.customer_id_alias")
                            
            //             .left_join(squel.select()
            //                 .field("c_jobs.customer_id","customer_id_alias2")
            //                 .field("sub_jobs_alias.main_job_id_alias","main_job_id_alias2")
            //                 .field("sub_jobs_alias.main_job_alias","main_job_alias2")
            //                 .field("sub_jobs_alias.sub_job_id_alias","sub_job_id_alias2")
            //                 .field("sub_jobs_alias.sub_job_alias","sub_job_alias2")
            //                 .field("c_jobs.period","job_period_alias2")
            //                 .from("c_jobs")
            //                 .left_join(squel.select()
            //                     .field("main_jobs.id","main_job_id_alias")
            //                     .field("main_jobs.main_job","main_job_alias")
            //                     .field("sub_jobs.id","sub_job_id_alias")
            //                     .field("sub_jobs.sub_job","sub_job_alias")
            //                     .from("sub_jobs")
            //                     .left_join("main_jobs","","sub_jobs.main_job_id=main_jobs.id")
            //                     ,"sub_jobs_alias","c_jobs.sub_job_id=sub_jobs_alias.sub_job_id_alias")
            //                     .order("period",false)
            //                     ,"c_jobs_alias","c_supports.customer_id=c_jobs_alias.customer_id_alias2")
                                
            //             .left_join(squel.select()
            //                 .field("c_jobs_alias.customer_id_alias2","id_2")
            //                 .field("MAX(c_jobs_alias.job_period_alias2)","period_2")
            //                 .from("c_supports","c_supports_2")
            //                 .left_join(squel.select()
            //                     .field("c_jobs.customer_id","customer_id_alias2")
            //                     .field("sub_jobs_alias.main_job_id_alias","main_job_id_alias2")
            //                     .field("sub_jobs_alias.main_job_alias","main_job_alias2")
            //                     .field("sub_jobs_alias.sub_job_id_alias","sub_job_id_alias2")
            //                     .field("sub_jobs_alias.sub_job_alias","sub_job_alias2")
            //                     .field("c_jobs.period","job_period_alias2")
            //                     .from("c_jobs")
            //                     .left_join(squel.select()
            //                         .field("main_jobs.id","main_job_id_alias")
            //                         .field("main_jobs.main_job","main_job_alias")
            //                         .field("sub_jobs.id","sub_job_id_alias")
            //                         .field("sub_jobs.sub_job","sub_job_alias")
            //                         .from("sub_jobs")
            //                         .left_join("main_jobs","","sub_jobs.main_job_id=main_jobs.id")
            //                         ,"sub_jobs_alias","c_jobs.sub_job_id=sub_jobs_alias.sub_job_id_alias")
            //                     .order("period",false)
            //                     ,"c_jobs_alias","customer_id=c_supports.c_jobs_alias.customer_id_alias2")
            //                     .group("customer_id")
            //                 ,"c_supports_2","c_supports.customer_id=c_supports_2.id_2 AND c_jobs_alias.job_period_alias2=c_supports_2.period_2")
                            
            //             .left_join(squel.select()
            //                 .field("c_companies_alias.customer_id_alias","id_3")
            //                 .field("MAX(c_companies_alias.join_date_alias)","period_3")
            //                 .from("c_supports","c_supports_2")
            //                 .left_join(squel.select()
            //                     .field("c_companies.customer_id","customer_id_alias")
            //                     .field("companies.id","company_id_alias")
            //                     .field("companies.company","company_alias")
            //                     .field("c_companies.join_date","join_date_alias")
            //                     .from("c_companies")
            //                     .left_join("companies","","c_companies.company_id=companies.id")
            //                     ,"c_companies_alias","customer_id=c_companies_alias.customer_id_alias")
            //                     .group("customer_id")
            //                 ,"c_supports_3","c_supports.customer_id=c_supports_3.id_3 AND c_companies_alias.join_date_alias=c_supports_3.period_3")
                        
            //             .where(`customers.deleted_pesonal_information = 0 AND customers.mail_ng = 0`)
            //             .where(`c_supports.crm_transferred = 0`)
            //             .group("customers.id")
            //             .having("support_finished_flag = 1")
            //             .toString()   
            let crm_output_select_sql = `SELECT
                                          c_supports.release_reason_id_flag,
                                          c_supports.support_status_flag,
                                          c_supports.first_meeting_date,
                                          customers.last_name AS customer_last_name,
                                          customers.first_name AS customer_first_name,
                                          agents.last_name AS agent_last_name,
                                          agents.first_name AS agent_first_name,
                                          c_supports.digital_ng_reason_id_flag,
                                          customers.email,
                                          customers.phone,
                                          schools.school,
                                          school_levels.school_level,
                                          companies.company,
                                          main_industries.main_industry,
                                          sub_industries.sub_industry,
                                          main_jobs.main_job,
                                          sub_jobs.sub_job,
                                          c_jobs.period,
                                          IFNULL(TIMESTAMPDIFF(YEAR, customers.birthday, CURDATE()), TIMESTAMPDIFF(YEAR, customers.created_at, CURDATE()) + customers.entry_age) as age,
                                          customers.income,
                                          channels.channel,
                                          c_supports.entry_date,
                                          c_supports.id,
                                          c_supports.customer_id,
                                          c_supports.agent_id,
                                          c_supports.support_finished_flag
                                        FROM
                                            (SELECT
                                              customer_id,
                                              MIN(c_supports.support_finished) AS "support_finished_flag",
                                              MAX(c_supports.release_reason_id) AS "release_reason_id_flag",
                                              MAX(c_supports.support_status_id) AS "support_status_flag",
                                              MAX(c_supports.digital_ng_reason_id) AS "digital_ng_reason_id_flag",
                                              entry_date,
                                              id,
                                              agent_id,
                                              channel_id,
                                              first_meeting_date
                                            FROM
                                              c_supports
                                            WHERE
                                              crm_transferred = 0
                                            GROUP BY
                                              customer_id
                                            HAVING
                                              support_finished_flag = 1
                                          ) \`c_supports\`
                                          INNER JOIN customers ON (c_supports.customer_id = customers.id)
                                          INNER JOIN agents ON (c_supports.agent_id = agents.id)
                                          INNER JOIN channels ON (c_supports.channel_id = channels.id)
                                          INNER JOIN (
                                            SELECT
                                              customer_id,
                                              MAX(IFNULL(join_date, 0)) AS join_date
                                            FROM
                                              c_companies
                                            GROUP BY
                                              customer_id
                                          ) c_company_alias ON customers.id = c_company_alias.customer_id
                                          INNER JOIN c_companies ON c_company_alias.customer_id = c_companies.customer_id
                                          AND IFNULL(c_companies.join_date, 0) = c_company_alias.join_date
                                          INNER JOIN companies ON c_companies.company_id = companies.id
                                          INNER JOIN sub_industries ON companies.sub_industry_id = sub_industries.id
                                          INNER JOIN main_industries ON sub_industries.main_industry_id = main_industries.id
                                          INNER JOIN (
                                            SELECT
                                              customer_id,
                                              MAX(IFNULL(leave_date, 0)) AS leave_date
                                            FROM
                                              c_schools
                                            GROUP BY
                                              customer_id
                                          ) c_school_alias ON customers.id = c_school_alias.customer_id
                                          INNER JOIN c_schools ON c_school_alias.customer_id = c_schools.customer_id
                                          AND IFNULL(c_schools.leave_date, 0) = c_school_alias.leave_date
                                          INNER JOIN schools ON c_schools.school_id = schools.id
                                          INNER JOIN school_levels ON schools.school_level_id = school_levels.id
                                          INNER JOIN (
                                            SELECT
                                              customer_id,
                                              MAX(IFNULL(period, 0)) AS period
                                            FROM
                                              c_jobs
                                            GROUP BY
                                              customer_id
                                          ) c_job_alias ON customers.id = c_job_alias.customer_id
                                          INNER JOIN c_jobs ON c_job_alias.customer_id = c_jobs.customer_id
                                          AND c_job_alias.period = IFNULL(c_jobs.period, 0)
                                          INNER JOIN sub_jobs ON c_jobs.sub_job_id = sub_jobs.id
                                          INNER JOIN main_jobs ON sub_jobs.main_job_id = main_jobs.id
                                        WHERE
                                          (
                                            customers.deleted_pesonal_information = 0
                                            AND customers.mail_ng = 0
                                          )
                                        GROUP BY
                                          customers.id`;

            const crm_output_select_data = await rdsDataService.executeStatement(create_sqlparams(crm_output_select_sql)).promise();
            
            
            let crm_transferred_update_sql = squel.update()
                                                    .table("c_supports")
                                                    .set("crm_transferred",1)
                                                    
            if(crm_output_select_data.records.length > 1){
                
                let crm_transferred_update_where = "customer_id IN ("
                for(let index_id = 0; index_id < crm_output_select_data.records.length; index_id++){
                    crm_transferred_update_where += crm_output_select_data.records[index_id][23].longValue + ","
                }
                crm_transferred_update_where = crm_transferred_update_where.slice( 0, -1 ) + ")"
                crm_transferred_update_sql.where(crm_transferred_update_where)
                
                await rdsDataService.executeStatement(create_sqlparams(crm_transferred_update_sql.toString())).promise();
            }
            
            
            callback(null,crm_output_select_data)
            break
        
        case 'delete_personal_information':
            let search_customer_id_sql = squel.select()
                                        .field("id")
                                        .from("customers")
                                        .where(`email = "${event.email.trim()}"`)
                                        .toString()
                                        
            let search_customer_id_data = await rdsDataService.executeStatement(create_sqlparams(search_customer_id_sql)).promise();
            
            try{
                if(search_customer_id_data.records[0].length == 1){
                    
                    let customer_id = search_customer_id_data.records[0][0].longValue
                                            
                    let delete_personal_information = squel.update()
                                                        .table("customers")
                                                        .set("email",customer_id)
                                                        .set("phone","")
                                                        .set("last_name","個人情報削除")
                                                        .set("first_name","")
                                                        .set("last_kana","")
                                                        .set("first_kana","")
                                                        .set("entry_age","0")
                                                        .set("birthday","1900-01-01")
                                                        .set("income","0")
                                                        .set("address_id","999")
                                                        .set("gender_id","9")
                                                        .set("detail","")
                                                        .set("memo","")
                                                        .set("deleted_pesonal_information",1)
                                                        .where(`id = ${customer_id}`)
                                                        .toString()
                                                        
                    let delete_c_schools = squel.delete()
                                                        .from("c_schools")
                                                        .where(`customer_id = ${customer_id}`)
                                                        .toString()
                                                        
                    let delete_c_jobs = squel.delete()
                                                        .from("c_jobs")
                                                        .where(`customer_id = ${customer_id}`)
                                                        .toString()
                                                        
                    let delete_c_companies = squel.delete()
                                                        .from("c_companies")
                                                        .where(`customer_id = ${customer_id}`)
                                                        .toString()
                                                        
                    let insert_c_schools = squel.insert()
                                                        .into("c_schools")
                                                        .set("customer_id",customer_id)
                                                        .set("school_id","161")
                                                        .set("undergraduate","")
                                                        .set("join_date","1900-01-01")
                                                        .set("leave_date","1900-01-01")
                                                        .toString()
                                                        
                    let insert_c_jobs = squel.insert()
                                                        .into("c_jobs")
                                                        .set("customer_id",customer_id)
                                                        .set("sub_job_id","9999")
                                                        .set("period","0")
                                                        .toString()
                                                        
                    let insert_c_companies = squel.insert()
                                                        .into("c_companies")
                                                        .set("customer_id",customer_id)
                                                        .set("company_id","35121")
                                                        .set("join_date","1900-01-01")
                                                        .set("leave_date","1900-01-01")
                                                        .toString()
                                                        
                    await rdsDataService.executeStatement(create_sqlparams(delete_personal_information)).promise();
                    await rdsDataService.executeStatement(create_sqlparams(delete_c_schools)).promise();
                    await rdsDataService.executeStatement(create_sqlparams(delete_c_jobs)).promise();
                    await rdsDataService.executeStatement(create_sqlparams(delete_c_companies)).promise();
                    await rdsDataService.executeStatement(create_sqlparams(insert_c_schools)).promise();
                    await rdsDataService.executeStatement(create_sqlparams(insert_c_jobs)).promise();
                    await rdsDataService.executeStatement(create_sqlparams(insert_c_companies)).promise();
                    
                    callback(null,"successfully deleted")
                    break
                
                }
            
            }catch{
                callback(null,"no existed id")
                break;
            }
            
        case 'update_mail_ng':
                                        
            let update_mail_ng = squel.update()
                                        .table("customers")
                                        .set("mail_ng",1)
                                        .where(`email = "${event.email.trim()}"`)
                                        .toString()
                                        
            let response = await rdsDataService.executeStatement(create_sqlparams(update_mail_ng)).promise();
            
            if(response.numberOfRecordsUpdated == "1"){
                callback(null,"successfully updated")
            }else{
                callback(null,"no existed id")
            }
            break
            
        case 'click_list':
            let request_data = []
            let not_insert_list = []
            let c_index = 0;
            let list_index = 0
            for(c_index = 0; c_index < event.customer.length; c_index++){
                
                try{
                    let customer_id_select_sql = squel.select()
                                                    .field("id")
                                                    .from("customers")
                                                    .where(`email = "${event.customer[c_index].email}"`)
                                                    .toString()
                                                    
                    let customer_id_select_data = await rdsDataService.executeStatement(create_sqlparams(customer_id_select_sql)).promise();
                    console.log(customer_id_select_data)
                    let customer_id = customer_id_select_data.records[0][0].longValue
                
                    let agent_id_select_sql = squel.select()
                                                    .field("id")
                                                    .from("agents")
                                                    .where(`last_name = "${event.customer[c_index].agent}" OR id = "${event.customer[c_index].agent}"`)
                                                    .toString()
                                    
                    let agent_id_select_data = await rdsDataService.executeStatement(create_sqlparams(agent_id_select_sql)).promise();
                    
                    let agent_id = agent_id_select_data.records[0][0].longValue
                    if(agent_id == "4"){
                        agent_id = "28"
                    }
                
                    if(event.customer[c_index].click_date == ""){
                        not_insert_list.push(event.customer[c_index].email)
                        continue;
                    }
                
                    request_data[list_index] = {
                        "customer_id": customer_id,
                        "agent_id": agent_id,
                        "mail_sending_date" : `${event.customer[c_index].mail_sending_date}`,
                        "click_date" : `${event.customer[c_index].click_date}`,
                        "crm_segment" : `${event.customer[c_index].crm_segment}`,
                        "channel_id" : `${event.customer[c_index].channel_id}`,
                        "crm_transfered_date": `${event.customer[c_index].crm_transfered_date}`
                    }
                    list_index += 1
                    
                }catch(e){
                    console.log(e)
                    not_insert_list.push(event.customer[c_index].email)
                    continue;
                }
            }
            
            let click_list_sql = squel.insert()
                                        .into("crm_click")
                                        .setFieldsRows(request_data)
                                        .onDupUpdate("crm_transfered_date","VALUES(`crm_transfered_date`)",{ dontQuote: true })
                                        .onDupUpdate("crm_segment","VALUES(`crm_segment`)",{ dontQuote: true })
                                        .toString()
                                        console.log(click_list_sql)
            
            try{                            
                let response_data = await rdsDataService.executeStatement(create_sqlparams(click_list_sql)).promise();
                let last_response = [response_data.numberOfRecordsUpdated,not_insert_list]
                callback(null,last_response)
            }catch{
                callback(null,[0,[]])
            }
            break;
            
        case 'crm_analize':
            let crm_analize_1 = squel.select()
                                        .field("mail_sending_date")
                                        .field("crm_segment")
                                        .field("COUNT(*)")
                                        .from("crm_click")
                                        .where("appointment = 1")
                                        .group("crm_segment")
                                        .group("mail_sending_date")
                                        .order("mail_sending_date,crm_segment")
                                        .toString()
                                            
            let crm_analize_1_data = await rdsDataService.executeStatement(create_sqlparams(crm_analize_1)).promise();
            
            let crm_analize_2 = squel.select()
                                        .field("crm_segment")
                                        .field("crm_transfered_date")
                                        .field("mail_sending_date")
                                        .field("crm_entry_date")
                                        .from("crm_click")
                                        .where("appointment = 1")
                                        .order("crm_segment")
                                        .toString()
                                            
            let crm_analize_2_data = await rdsDataService.executeStatement(create_sqlparams(crm_analize_2)).promise();
        
            callback(null,[crm_analize_1_data.records,crm_analize_2_data.records])
            break;
            
        case 'appointment_output':
            let appointment_output = squel.select()
                                        .from("c_supports")
                                        .field("customers.email")
                                        .join("customers","","c_supports.customer_id = customers.id")
                                        .where("c_supports.channel_id IN(24,25)")
                                        .where(`c_supports.entry_date BETWEEN "${event.start_date}" AND "${event.end_date}"`)
                                        .toString()
                                            
            let appointment_output_data = await rdsDataService.executeStatement(create_sqlparams(appointment_output)).promise();
        
            callback(null,appointment_output_data)
            break;
            
        case 'appointment_output_new':
            let appointment_output_new = squel.select()
                                        .field("c_supports.entry_date","entry_date")
                                        .field("first_meeting_date","first_meeting_date")
                                        .field("CONCAT(customers.last_name,customers.first_name)","customer_name")
                                        .field("customers.email","email")
                                        .field("CONCAT(agents.last_name,agents.first_name)","agent_name")
                                        .field("channel","channel")
                                        .from("c_supports")
                                        .join("customers","","c_supports.customer_id = customers.id")
                                        .join("agents","","c_supports.agent_id = agents.id")
                                        .join("channels","","c_supports.channel_id = channels.id")
                                        .where("channel_id IN(24,25)")
                                        .where("c_supports.first_meeting_date IS NOT NULL")
                                        .where(`c_supports.entry_date >= "${event.start_date}" AND c_supports.entry_date < "${event.end_date}"`)
                                        .toString()
                                            
            let appointment_output_new_data = await rdsDataService.executeStatement(create_sqlparams(appointment_output_new)).promise();
        
            callback(null,appointment_output_new_data)
            break;
            
        case 'assign_output_select':
            let assign_output_select = squel.select()
                                        .field("last_name")
                                        .field("first_name")
                                        .field("email")
                                        .from("c_supports")
                                        .join("customers","","c_supports.customer_id = customers.id")
                                        .where("support_status_id >= 7")
                                        .where(`assign_date >= ${event.start_date}`)
                                        .group("customers.id")
                                        .toString();
                                            
            let assign_output_select_data = await rdsDataService.executeStatement(create_sqlparams(assign_output_select)).promise();
        
            callback(null,assign_output_select_data);
            break;
            
        case 'daily_release_reason_update':
            let daily_release_reason_update = `UPDATE c_supports 
                                                SET release_reason_id = 3 
                                                WHERE id IN ( 
                                                  SELECT id_alias FROM ( 
                                                	SELECT id AS id_alias FROM c_supports 
                                                    WHERE  
                                                    support_status_id <= 2  
                                                    and 
                                                    release_reason_id = 1 
                                                    and
                                                    entry_date <= CURDATE() - INTERVAL 7 DAY 
                                                  ) AS alias
                                                );`;
                                            
            await rdsDataService.executeStatement(create_sqlparams(daily_release_reason_update)).promise();
            callback(null,"OK");
            break;
            
        
        default:
            return 'error';
    }
};

