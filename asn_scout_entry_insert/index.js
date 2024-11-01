const AWS = require('aws-sdk');
const rdsDataService = new AWS.RDSDataService();

const arn = require('./arn.json');
function create_sqlparams(sql){
    let sqlParams = {
        secretArn: arn["secretArn"],
        resourceArn: arn["resourceArn"],
        sql: sql,
        database: 'asnkpi',
        includeResultMetadata: false
    };
    return sqlParams;
}

exports.handler = async(event, context, callback) => {

    // イベントログを取得
    console.log(`event_log: ${JSON.stringify(event)}`);
    
    //address idを取得
    let get_address_id = `SELECT id FROM addresses WHERE address = "${event["customers"]["address"]}";`;
    const address_id_data = await rdsDataService.executeStatement(create_sqlparams(get_address_id)).promise();
    let address_id = address_id_data["records"][0][0]["longValue"];
    console.log("get_address_id:",address_id);
    
    //customersをupsert
    let birthday;
    if(event["customers"]["birthday"] == "NULL"){
        birthday = "NULL";
    }else{
        birthday = "\""+event["customers"]["birthday"]+"\"";
    }
    
    //customerが既に登録されているかで場合分け
    let get_customer_id_count_sql = `SELECT COUNT(id) FROM customers WHERE email = "${event["customers"]["email"]}";`;
    let customer_id_count_data = await rdsDataService.executeStatement(create_sqlparams(get_customer_id_count_sql)).promise();
    let customer_id_count = customer_id_count_data.records[0][0]["longValue"];
    let customer_id;
    switch (customer_id_count) {
        case 0:
            let customers_insert_sql = `INSERT customers(\
                                            email,\
                                            phone,\
                                            last_name,\
                                            first_name,\
                                            last_kana,\
                                            first_kana,\
                                            entry_age,\
                                            birthday,\
                                            income,\
                                            address_id,\
                                            gender_id,\
                                            detail,\
                                            memo,\
                                            view_registry\
                                        )\
                                        VALUES(\
                                            "${event["customers"]["email"]}",\
                                            "${event["customers"]["phone"]}",\
                                            "${event["customers"]["last_name"]}",\
                                            "${event["customers"]["first_name"]}",\
                                            "${event["customers"]["last_kana"]}",\
                                            "${event["customers"]["first_kana"]}",\
                                            ${event["customers"]["entry_age"]},\
                                            ${birthday},\
                                            ${event["customers"]["income"]},\
                                            "${address_id}",\
                                            "${event["customers"]["gender_id"]}",\
                                            "${event["customers"]["detail"]}",\
                                            "",\
                                            ${Number(event["customers"]["view_registry"])}\
                                        );`;
            let customer_insert = await rdsDataService.executeStatement(create_sqlparams(customers_insert_sql)).promise();
            console.log("result_of_customer_insert:",customer_insert);
            //customer_idを取得
            let get_customer_id = `SELECT id FROM customers WHERE email ="${event["customers"]["email"]}";`;
            let customer_id_data = await rdsDataService.executeStatement(create_sqlparams(get_customer_id)).promise();
            customer_id = customer_id_data.records[0][0]["longValue"];
            console.log("get_customer_id:",customer_id);
            
            console.log("customer新規登録");
            break;
        
        default:
        let customer_update_sql = `UPDATE customers SET`;
        let update_flag = 0;
        
        // if(event["customers"]["phone"] != ""){
        //     customer_update_sql += ` phone =  "${event["customers"]["phone"]}",`;
        //     update_flag = 1;
        // }
        // if(event["customers"]["last_name"] != ""){
        //     customer_update_sql += ` last_name =  "${event["customers"]["last_name"]}",`;
        //     update_flag = 1;
        // }
        // if(event["customers"]["first_name"] != ""){
        //     customer_update_sql += ` first_name =  "${event["customers"]["first_name"]}",`;
        //     update_flag = 1;
        // }
        // if(event["customers"]["last_kana"] != ""){
        //     customer_update_sql += ` last_kana =  "${event["customers"]["last_kana"]}",`;
        //     update_flag = 1;
        // }
        // if(event["customers"]["first_kana"] != ""){
        //     customer_update_sql += ` first_kana =  "${event["customers"]["first_kana"]}",`;
        //     update_flag = 1;
        // }
        // if(event["customers"]["entry_age"] != "NULL"){
        //     customer_update_sql += ` entry_age =  "${event["customers"]["entry_age"]}",`;
        //     update_flag = 1;
        // }
        // if(event["customers"]["birthday"] != "NULL"){
        //     customer_update_sql += ` birthday =  "${event["customers"]["birthday"]}",`;
        //     update_flag = 1;
        // }
        // if(event["customers"]["address"] != ""){
        //     customer_update_sql += ` address_id =  "${address_id}",`;
        //     update_flag = 1;
        // }
        // if(event["customers"]["income"] != "NULL"){
        //     customer_update_sql += ` income =  "${event["customers"]["income"]}",`;
        //     update_flag = 1;
        // }
        // if(event["customers"]["gender_id"] != ""){
        //     customer_update_sql += ` gender_id =  "${event["customers"]["gender_id"]}",`;
        //     update_flag = 1;
        // }
        // if(event["customers"]["detail"] != ""){
        //     customer_update_sql += ` detail =  "${event["customers"]["detail"]}",`;
        //     update_flag = 1;
        // }
        if(event["customers"]["view_registry"] == "1"){
            customer_update_sql += ` view_registry =  ${Number(event["customers"]["view_registry"])},`;
            update_flag = 1;
        }
        
        if(update_flag == 1){
            //customer_idを取得
            let get_customer_id = `SELECT id FROM customers WHERE email ="${event["customers"]["email"]}";`;
            let customer_id_data = await rdsDataService.executeStatement(create_sqlparams(get_customer_id)).promise();
            customer_id = customer_id_data.records[0][0]["longValue"];
            console.log("get_customer_id:",customer_id);
            
            customer_update_sql = customer_update_sql.slice(0, -1) + ` WHERE id = ${customer_id};`;
            let customer_update = await rdsDataService.executeStatement(create_sqlparams(customer_update_sql)).promise();
            console.log("result_of_customer_update:",customer_update);
        }else{
            let get_customer_id = `SELECT id FROM customers WHERE email ="${event["customers"]["email"]}";`;
            let customer_id_data = await rdsDataService.executeStatement(create_sqlparams(get_customer_id)).promise();
            customer_id = customer_id_data.records[0][0]["longValue"];
            console.log("get_customer_id:",customer_id);
        }
        console.log("customer更新");
    }
    
    
    //c_schoolsにcustomer_idがあるか確認
    let get_c_schools_customer_id = `SELECT count(customer_id) FROM c_schools WHERE customer_id = "${customer_id}";`;
    const c_schools_customer_id_exist_data = await rdsDataService.executeStatement(create_sqlparams(get_c_schools_customer_id)).promise();
    let c_schools_customer_id_exist = Number(c_schools_customer_id_exist_data.records[0][0]["longValue"]);
    console.log("get_c_schools_customer_id_exist:",c_schools_customer_id_exist);
    
    if(c_schools_customer_id_exist == 1){
        let get_c_schools_school = `SELECT school_id FROM c_schools WHERE customer_id = "${customer_id}";`;
        const c_schools_school_data = await rdsDataService.executeStatement(create_sqlparams(get_c_schools_school)).promise();
        let c_schools_school = c_schools_school_data.records[0][0]["longValue"];
        console.log("get_c_schools_customer_id:",c_schools_school);
        if(c_schools_school == "161"){
            c_schools_customer_id_exist = 0;
        }
    }
    
    //入力schoolデータがあるか確認
    let school_number = Number(event["c_schools"]["school_number"]);
    
    //入力schoolデータで場合分け
    switch (school_number) {
        case 0:
            // c_schoolsに既にデータがあるかで場合分け
            switch (c_schools_customer_id_exist) {
                case 0:
                    let c_schools_sql_case_00 = `INSERT c_schools(customer_id,school_id,undergraduate,join_date,leave_date,school_background_id)\
                                                VALUES("${customer_id}","161","",NULL,"1900-01-01","99");`;
                    try{
                        console.log("result_of_c_schools_insert_00:",await rdsDataService.executeStatement(create_sqlparams(c_schools_sql_case_00)).promise());
                     }catch(e){
                     }
                    console.log("入力学校データなし、所属学校履歴なし");
                    break;
                default:
                    console.log("入力学校データなし、所属学校履歴あり");
                    break;
            }
            break;
        
        default:
            switch (c_schools_customer_id_exist) {
                case 0:
                    console.log("入力学校データあり、所属学校履歴なし");
                    
                    for(let index_1 = 0; index_1<school_number; index_1++){
                        let get_school_id = `SELECT id FROM schools WHERE school = "${event["c_schools"][`school_${index_1+1}`]}";`;
                        let school_id_data = await rdsDataService.executeStatement(create_sqlparams(get_school_id)).promise();
                        let school_id = 0;
                        let school_id_exist = 1;
                        if (school_id_data.records != ""){
                            school_id = school_id_data.records[0][0]["longValue"];
                        }else{
                            school_id_exist = 0;
                        }
                        console.log("school_id",school_id);
                        console.log("school_id",school_id_exist);
                        //登録データにschoolが既にあるかで場合分け
                        switch (school_id_exist) {
                            case 0:
                                let school_insert = `INSERT schools(school,school_level_id) VALUES("${event["c_schools"][`school_${index_1+1}`]}","7");`;
                                console.log(await rdsDataService.executeStatement(create_sqlparams(school_insert)).promise());
                            default:
                                let school_id_data = await rdsDataService.executeStatement(create_sqlparams(get_school_id)).promise();
                                school_id = school_id_data.records[0][0]["longValue"];
                                console.log("school_id",school_id);
                                let join_date;
                                if(event["c_schools"][`join_date_${index_1+1}`] == "NULL"){
                                    join_date = "NULL";
                                }else{
                                    join_date = "\""+event["c_schools"][`join_date_${index_1+1}`]+"\"";
                                }
                                let leave_date;
                                if(event["c_schools"][`leave_date_${index_1+1}`] == "NULL"){
                                    leave_date = "NULL";
                                }else{
                                    leave_date = "\""+event["c_schools"][`leave_date_${index_1+1}`]+"\"";
                                }
                                let c_schools_insert = `INSERT c_schools(customer_id,school_id,undergraduate,join_date,leave_date,school_background_id)\
                                                        VALUES(\
                                                            "${customer_id}",\
                                                            "${school_id}",\
                                                            "",\
                                                            ${join_date},\
                                                            ${leave_date},\
                                                            "${event["c_schools"][`school_background_id_${index_1+1}`]}"\
                                                            );`;
                                console.log("c_schools_insert",await rdsDataService.executeStatement(create_sqlparams(c_schools_insert)).promise());
                        }
                        
                        
                        
                    }
                    break;
                    
                default:
                    console.log("入力学校データあり、所属学校履歴あり");
                    // let delete_c_schools = `DELETE FROM c_schools WHERE customer_id = "${customer_id}";`;
                    // console.log("delete_c_schools:",await rdsDataService.executeStatement(create_sqlparams(delete_c_schools)).promise());
            }
            
    }
    
    //c_jobsにcustomer_idがあるか確認
    let get_c_jobs_customer_id = `SELECT count(customer_id) FROM c_jobs WHERE customer_id = "${customer_id}";`;
    const c_jobs_customer_id_exist_data = await rdsDataService.executeStatement(create_sqlparams(get_c_jobs_customer_id)).promise();
    let c_jobs_customer_id_exist = Number(c_jobs_customer_id_exist_data.records[0][0]["longValue"]);
    console.log("get_c_jobs_customer_id_exist:",c_jobs_customer_id_exist);
    
    if(c_jobs_customer_id_exist == 1){
        let get_c_jobs_sub_job = `SELECT sub_job_id FROM c_jobs WHERE customer_id = "${customer_id}";`;
        const c_jobs_sub_job_data = await rdsDataService.executeStatement(create_sqlparams(get_c_jobs_sub_job)).promise();
        let c_jobs_sub_job = c_jobs_sub_job_data.records[0][0]["longValue"];
        console.log("get_c_companies_customer_id_exist:",c_jobs_sub_job);
        if(c_jobs_sub_job == "9999"){
            c_jobs_customer_id_exist = 0;
        }
    }
    
    //入力jobデータがあるか確認
    let job_number = Number(event["c_jobs"]["job_number"]);
    
    //入力jobデータで場合分け
    switch (job_number) {
        case 0:
            // c_jobsに既にデータがあるかで場合分け
            switch (c_jobs_customer_id_exist) {
                case 0:
                    let c_jobs_sql_case_00 = `INSERT c_jobs(customer_id,sub_job_id,period)\
                                                VALUES("${customer_id}","9999",0);`;
                    try{
                        console.log("result_of_c_jobs_insert_00:",await rdsDataService.executeStatement(create_sqlparams(c_jobs_sql_case_00)).promise());
                    }catch(e){
                    }
                    console.log("入力職種データなし、経験職種履歴なし");
                    break;
                default:
                    console.log("入力職種データなし、経験職種履歴あり");
                    break;
            }
            break;
                
        default:
            let resisted_sum_job_period = 0;
            let insert_job_period = 0;
            for(let index_2 = 0; index_2<job_number; index_2++){
                if(event["c_jobs"][`period_${index_2+1}`] != "NULL"){
                    insert_job_period += Number(event["c_jobs"][`period_${index_2+1}`]);
                }
            }
            
            let resisted_sum_job_period_sql = `SELECT SUM(period) FROM c_jobs WHERE customer_id = "${customer_id}";`;
            let resisted_sum_job_period_data = await rdsDataService.executeStatement(create_sqlparams(resisted_sum_job_period_sql)).promise();
            resisted_sum_job_period = resisted_sum_job_period_data.records[0][0]["stringValue"];
            
            if(!resisted_sum_job_period){
                resisted_sum_job_period = 0
            }
            console.log("resisted_sum_job_period:",resisted_sum_job_period);
        
            switch (c_jobs_customer_id_exist) {
                case 0:
                    console.log("入力職種データあり、経験職種履歴なし");
                    for(let index_3 = 0; index_3<job_number; index_3++){
                        let get_main_job_id = `SELECT id FROM main_jobs WHERE main_job = "${event["c_jobs"][`main_job_${index_3+1}`]}";`;
                        
                        let main_job_id_data = await rdsDataService.executeStatement(create_sqlparams(get_main_job_id)).promise();
                        let main_job_id = main_job_id_data.records[0][0]["longValue"];
                        
                        let get_sub_job_id = `SELECT id FROM sub_jobs WHERE sub_job = "${event["c_jobs"][`sub_job_${index_3+1}`]}" and main_job_id = "${main_job_id}";`;
                        let sub_job_id_data = await rdsDataService.executeStatement(create_sqlparams(get_sub_job_id)).promise();
                        let sub_job_id;
                        try{
                            sub_job_id = sub_job_id_data.records[0][0]["longValue"];
                        }catch{
                            sub_job_id = "9999"
                        }
                    
                        let period = event["c_jobs"][`period_${index_3+1}`];            
                        
                        let c_jobs_insert = `INSERT c_jobs(customer_id,sub_job_id,period)\
                                                VALUES(\
                                                    "${customer_id}",\
                                                    "${sub_job_id}",\
                                                    ${period}\
                                                    );`;
                        try{
                            console.log("c_jobs_insert",await rdsDataService.executeStatement(create_sqlparams(c_jobs_insert)).promise());
                        }catch(e){
                        }
                        
                    }
                    break;
                default:
                    console.log("入力職種データあり、経験職種履歴あり");
                    // let delete_c_jobs = `DELETE FROM c_jobs WHERE customer_id = "${customer_id}";`;
                    // console.log("delete_c_jobs:",await rdsDataService.executeStatement(create_sqlparams(delete_c_jobs)).promise());
            }
    }
    
    
    //c_companiesにcustomer_idがあるか確認
    let get_c_companys_customer_id = `SELECT count(customer_id) FROM c_companies WHERE customer_id = "${customer_id}";`;
    const c_companys_customer_id_exist_data = await rdsDataService.executeStatement(create_sqlparams(get_c_companys_customer_id)).promise();
    let c_companies_customer_id_exist = Number(c_companys_customer_id_exist_data.records[0][0]["longValue"]);
    console.log("get_c_companies_customer_id_exist:",c_companies_customer_id_exist);
    if(c_companies_customer_id_exist == 1){
        let get_c_companies_company = `SELECT company_id FROM c_companies WHERE customer_id = "${customer_id}";`;
        const c_companies_company_data = await rdsDataService.executeStatement(create_sqlparams(get_c_companies_company)).promise();
        let c_companies_company = c_companies_company_data.records[0][0]["longValue"];
        console.log("get_c_companies_customer_id_exist:",c_companies_company);
        if(c_companies_company == "35121" || c_companies_company == "35232"){
            c_companies_customer_id_exist = 0;
        }
    }
    //入力companyデータがあるか確認
    let company_number = Number(event["c_companies"]["company_number"]);
    
    //入力companyデータで場合分け
    switch (company_number) {
        case 0:
            // c_companiesに既にデータがあるかで場合分け
            switch (c_companies_customer_id_exist) {
                case 0:
                    let c_companies_sql_case_00 = `INSERT c_companies(customer_id,company_id,join_date,leave_date)\
                                                VALUES("${customer_id}","35121","1900-01-01",NULL);`;
                    try{
                        console.log("result_of_c_companies_insert_00:",await rdsDataService.executeStatement(create_sqlparams(c_companies_sql_case_00)).promise());
                    }catch(e){
                    }
                    console.log("入力企業データなし、経験企業履歴なし");
                    break;
                default:
                    console.log("入力企業データなし、経験企業履歴あり");
                    break;
            }
            break;
                
        default:
            
            
            switch (c_companies_customer_id_exist) {
                case 0:
                    console.log("入力企業データあり、経験企業履歴なし");
                    break;
                default:
                    console.log("入力企業データあり、経験企業履歴あり");
                    // let delete_c_companies = `DELETE FROM c_companies WHERE customer_id = "${customer_id}";`;
                    // console.log("delete_c_companies:",await rdsDataService.executeStatement(create_sqlparams(delete_c_companies)).promise());
            }
        
            for(let index_4 = 0; index_4<company_number; index_4++){
                //companyが存在するか
                let get_company_id = `SELECT id FROM companies WHERE company = "${event["c_companies"][`company_${index_4+1}`]}";`;
                let company_id_data = await rdsDataService.executeStatement(create_sqlparams(get_company_id)).promise();
                let company_id = 0;
                let company_id_exist = 1;
                if (company_id_data.records != ""){
                    company_id = company_id_data.records[0][0]["longValue"];
                }else{
                    company_id_exist = 0;
                }
                console.log("company_id",company_id);
                
                //業界のid変換
                let get_main_industry_id = `SELECT id FROM main_industries WHERE main_industry = "${event["c_companies"][`main_industry_${index_4+1}`]}";`;
                let main_industry_id_data = await rdsDataService.executeStatement(create_sqlparams(get_main_industry_id)).promise();
                let main_industry_id = main_industry_id_data.records[0][0]["longValue"];
                
                let get_sub_industry_id = `SELECT id FROM sub_industries WHERE sub_industry = "${event["c_companies"][`sub_industry_${index_4+1}`]}" and main_industry_id = "${main_industry_id}";`;
                let sub_industry_id_data = await rdsDataService.executeStatement(create_sqlparams(get_sub_industry_id)).promise();
                let sub_industry_id = sub_industry_id_data.records[0][0]["longValue"];
                
                //登録データにcompanyが既にあるかで場合分け
                switch (company_id_exist) {
                    case 0:
                        let company_insert = `INSERT companies(company,sub_industry_id) VALUES("${event["c_companies"][`company_${index_4+1}`]}","${sub_industry_id}");`;
                        console.log(await rdsDataService.executeStatement(create_sqlparams(company_insert)).promise());
                        let company_id_data = await rdsDataService.executeStatement(create_sqlparams(get_company_id)).promise();
                        company_id = company_id_data.records[0][0]["longValue"];
                        console.log("company_id",company_id);
                        break;
                    default:
                        break;
                }
                let join_date;
                if(event["c_companies"][`join_date_${index_4+1}`] == "NULL"){
                    join_date = "\""+"1900-01-01"+"\"";
                }else{
                    join_date = "\""+event["c_companies"][`join_date_${index_4+1}`]+"\"";
                }
                let leave_date;
                if(event["c_companies"][`leave_date_${index_4+1}`] == "NULL"){
                    leave_date = "NULL";
                }else{
                    leave_date = "\""+event["c_companies"][`leave_date_${index_4+1}`]+"\"";
                }
                let c_companies_insert = `INSERT c_companies(customer_id,company_id,join_date,leave_date)\
                                        VALUES(\
                                            "${customer_id}",\
                                            "${company_id}",\
                                            ${join_date},\
                                            ${leave_date}\
                                            );`;
                try{
                    console.log("c_companies_insert",await rdsDataService.executeStatement(create_sqlparams(c_companies_insert)).promise());
                }catch(e){
                }
                
                if(sub_industry_id != "999"){
                        
                    let companies_update = `UPDATE companies\
                                                SET \
                                                    sub_industry_id = "${sub_industry_id}"\
                                            WHERE \
                                                id = "${company_id}"\
                                            ;`;
                    try{
                        console.log("companies_update",await rdsDataService.executeStatement(create_sqlparams(companies_update)).promise());
                    }catch(e){
                    }
                }
                
            }
    }
    
    
    //c_supportsのデータを追加
    let get_agent_id_sql = `SELECT id FROM agents WHERE last_name = "${event["c_supports"]["agent_last_name"]}" and first_name = "${event["c_supports"]["agent_first_name"]}";`;
    let get_agent_id_data = await rdsDataService.executeStatement(create_sqlparams(get_agent_id_sql)).promise();
    let get_agent_id = get_agent_id_data.records[0][0]["longValue"];
    console.log("agent_id",get_agent_id);
    
    let get_channel_id_sql = `SELECT id FROM channels WHERE channel = "${event["c_supports"]["channel"]}";`;
    let get_channel_id_data = await rdsDataService.executeStatement(create_sqlparams(get_channel_id_sql)).promise();
    let get_channel_id = get_channel_id_data.records[0][0]["longValue"];
    console.log("channel_id",get_channel_id);
    
    let get_c_support_id_exist_sql = `SELECT count(id) FROM c_supports WHERE customer_id = "${customer_id}" and agent_id = "${get_agent_id}" and entry_date = "${event["c_supports"]["entry_date"]}";`;
    let get_c_support_id_exist_data = await rdsDataService.executeStatement(create_sqlparams(get_c_support_id_exist_sql)).promise();
    let c_support_id_exist = Number(get_c_support_id_exist_data.records[0][0]["longValue"]);
    console.log("c_support_id_exist:",c_support_id_exist);
    
    let cs_entry_age;
    if(event["customers"]["entry_age"] != "NULL"){
        cs_entry_age = event["customers"]["entry_age"];
    }else{
        cs_entry_age = "NULL";
    }
    
    switch (c_support_id_exist) {
        case 0:
            let entry_date = new Date(event["c_supports"]["entry_date"])
            let expected_assign_month = entry_date.setDate(entry_date.getDate() + 50);
            expected_assign_month = getStringFromDate(new Date(expected_assign_month))
            console.log(expected_assign_month)
            
            let insert_c_support_sql = `INSERT c_supports(customer_id,agent_id,entry_date,channel_id,support_status_id,release_reason_id,digital_ng_reason_id,first_meeting_date,expected_assign_month,cs_entry_age)\
                                        VALUES(
                                            "${customer_id}",\
                                            "${get_agent_id}",\
                                            "${event["c_supports"]["entry_date"]}",\
                                            "${get_channel_id}",\
                                            "${event["c_supports"]["support_status_id"]}",\
                                            "${event["c_supports"]["release_reason_id"]}",\
                                            "${event["c_supports"]["digital_ng_reasons_id"]}",\
                                            ${event["c_supports"]["first_meeting_date"]},\
                                            "${expected_assign_month}",\
                                            ${cs_entry_age}\
                                        )\;`;
            console.log("insert_c_support:",await rdsDataService.executeStatement(create_sqlparams(insert_c_support_sql)).promise());
            break;

        default:
    }
    
    let get_c_support_id_sql = `SELECT id FROM c_supports WHERE customer_id = "${customer_id}" and agent_id = "${get_agent_id}" and entry_date = "${event["c_supports"]["entry_date"]}";`;
    let get_c_support_id_data = await rdsDataService.executeStatement(create_sqlparams(get_c_support_id_sql)).promise();
    let c_support_id = get_c_support_id_data.records[0][0]["longValue"];
    console.log("c_support_id:",c_support_id);
    
    
    //cs_prefer_addressを追加
    let prefer_address_number = Number(event["cs_prefer_addresses"]["prefer_address_number"]);
    let delete_prefer_address_sql = `DELETE FROM cs_prefer_addresses WHERE c_support_id = ${c_support_id};`;
    let delete_prefer_address_data = await rdsDataService.executeStatement(create_sqlparams(delete_prefer_address_sql)).promise();
    console.log("delete_prefer_address:",delete_prefer_address_data)
    
    switch (prefer_address_number) {
        case 0:
            let insert_cs_prefer_sql = `INSERT cs_prefer_addresses(c_support_id,address_id)\
                                VALUES(\
                                    "${c_support_id}",\
                                    "999"\
                                )\;`;
            try{
                let insert_cs_prefer_data = await rdsDataService.executeStatement(create_sqlparams(insert_cs_prefer_sql)).promise();
                console.log("insert_cs_prefer:",insert_cs_prefer_data.records);
            }catch(e){
            }    
            break;
        
        default:
            for(let index_5 = 0; index_5<prefer_address_number; index_5++){
                let get_address_id_sql = `SELECT id FROM addresses WHERE address = "${event["cs_prefer_addresses"][`prefer_address_${index_5+1}`]}";`;
                let get_address_id_data = await rdsDataService.executeStatement(create_sqlparams(get_address_id_sql)).promise();
                let get_address_id
                try{
                    get_address_id = get_address_id_data.records[0][0]["longValue"];
                }catch{
                    get_address_id = "999"
                }
                
                let insert_cs_prefer_sql = `INSERT cs_prefer_addresses(c_support_id,address_id)\
                                                VALUES(\
                                                    "${c_support_id}",\
                                                    "${get_address_id}"\
                                );`;
                try{
                    let insert_cs_prefer_data = await rdsDataService.executeStatement(create_sqlparams(insert_cs_prefer_sql)).promise();
                    console.log("insert_cs_prefer::",insert_cs_prefer_data.records);
                }catch{}
            }
            
    }
    
};

function getStringFromDate(date) {
 
 let year_str = date.getFullYear();
 let month_str = 1 + date.getMonth();
 let day_str = date.getDate();
 
 
 let format_str = 'YYYY-MM-DD';
 format_str = format_str.replace(/YYYY/g, year_str);
 format_str = format_str.replace(/MM/g, month_str);
 format_str = format_str.replace(/DD/g, day_str);
 
 return format_str;
};