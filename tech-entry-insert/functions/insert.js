exports.index = async (event, rds, squel, rds_connect, formatter) => {
  
  try{
  
    const body = JSON.parse(event.body);
  
    // customersにinsertするクエリを取得
    const email = body.email;
    const phone = body.phone;
    const last_name = body.customer_last_name;
    const first_name = body.customer_first_name;
    const last_name_kana = body.customer_last_name_kana;
    const first_name_kana = body.customer_first_name_kana;
    const entry_age = body.entry_age;
    const birthday = body.birthday;
    const income = body.income;
    const address_id = body.address_id;
    const gender_id = body.gender_id;
    const detail = body.detail;
    const view_registry = body.view_registry;
    const c_school_list = body.c_schools;
    const c_company_list = body.c_companies;
    const c_jobs_list = body.c_jobs;
  
    // c_supportsにinsertするクエリを取得
    const agent_id = body.agent_id;
    const channel_id = body.channel_id;
    const prefer_address_list = body.prefer_addresses;
  
    // エントリー日と決着月を作成
    const today = new Date();
    const expected_assign_day = new Date();
    expected_assign_day.setDate(expected_assign_day.getDate() + 50);
  
    const entry_date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    const expected_assign_month = expected_assign_day.getFullYear() + '-' + (expected_assign_day.getMonth() + 1) + '-' + expected_assign_day.getDate();
  
    // メールアドレスが登録されているかを確認
    const register_judge_email_sql = squel.select()
                                          .from("customers")
                                          .field("COUNT(id)", "email_count")
                                          .where("email = ?", email)
                                          .toString();
    
    const register_judge_result = await rds_connect.data_api("count_num",register_judge_email_sql,rds);
    const email_count = register_judge_result.count_num[0].email_count;
  
    // トランザクションを開始
    const transaction_id = await rds_connect.begin(rds);
    if(email_count === 0){
  
      try{
        // 受け取った情報をcontractsにinsertするためのsql
        const insert_customer_sql = squel.insert()
                                        .into("customers")
                                        .set("email", email)
                                        .set("phone", phone)
                                        .set("last_name", last_name)
                                        .set("first_name", first_name)
                                        .set("last_kana", last_name_kana)
                                        .set("first_kana", first_name_kana)
                                        .set("entry_age", entry_age)
                                        .set("birthday", birthday)
                                        .set("income", income)
                                        .set("address_id", address_id)
                                        .set("gender_id", gender_id)
                                        .set("detail", detail)
                                        .set("view_registry", view_registry)
                                        .toString();
        
        // insert実行
        await rds_connect.data_api("insert_new_customer",insert_customer_sql,rds, transaction_id);
      }catch(e){
        await rds_connect.rollback(transaction_id,rds);
        console.log(e);
        return formatter.formatJSONResponseServerError("error: cannot insert user");
      }
  
      const get_customer_id_sql = squel.select()
                                      .from("customers")
                                      .field("id")
                                      .where("email = ?", email)
                                      .toString();
  
      const get_customer_id = await rds_connect.data_api("get_customer_id",get_customer_id_sql,rds, transaction_id);
      const new_customer_id = get_customer_id.get_customer_id[0].id;
  
      try{
        // 学校情報を入力、ない場合はデフォルトの値を入力
        if(c_school_list.length){
          for(let i = 0; i < c_school_list.length; i++){
            const school = body.c_schools[i].school;
            const undergraduate = body.c_schools[i].undergraduate;
            let join_date = body.c_schools[i].school_join_date;
            if(Boolean(join_date) === false){
              join_date = null;
            }
            let leave_date = body.c_schools[i].school_leave_date;
            if(Boolean(leave_date) === false){
              leave_date = null;
            }
  
            // schoolsからschool_idを取得、ない場合はschoolsに新しくinsertしてschool_idを取得する
            const get_school_id_sql = squel.select()
                                          .from("schools")
                                          .field("id")
                                          .where("school = ?", school)
                                          .toString();
  
            const get_school_id = await rds_connect.data_api("get_school_id",get_school_id_sql,rds, transaction_id);
            
            let school_id
            // school_idの有無で処理を場合分け
            if(!get_school_id.get_school_id.length){
              const insert_school_sql = squel.insert()
                                            .into("schools")
                                            .set("school", school)
                                            .set("school_level_id", 7)
                                            .toString();
              
              try{
                await rds_connect.data_api("insert_new_school",insert_school_sql,rds, transaction_id);
              }catch(e){
                await rds_connect.rollback(transaction_id,rds);
                console.log(e);
                return formatter.formatJSONResponseServerError("error: cannot insert school");
              }
  
              // 挿入したschool_idを取得
              const get_new_school_id_sql = squel.select()
                                                .from("schools")
                                                .field("id")
                                                .where("school = ?", school)
                                                .toString();
  
              const get_new_school_id = await rds_connect.data_api("get_new_school_id",get_new_school_id_sql,rds, transaction_id);
              school_id = get_new_school_id.get_new_school_id[0].id;
  
            }else{
              school_id = get_school_id.get_school_id[0].id;
            }
  
            // c_schoolsに挿入
            const insert_c_schools_sql = squel.insert()
                                              .into("c_schools")
                                              .set("customer_id", new_customer_id)
                                              .set("school_id", school_id)
                                              .set("undergraduate", undergraduate)
                                              .set("join_date", join_date)
                                              .set("leave_date", leave_date)
                                              .set("school_background_id", 99)
                                              .toString();
  
            try{
              await rds_connect.data_api("insert_c_schools",insert_c_schools_sql,rds, transaction_id);
            }catch(e){
              await rds_connect.rollback(transaction_id,rds);
              console.log(e);
              return formatter.formatJSONResponseServerError("error: cannot insert user's school info");
            }
  
          }
        }else{
          // c_schoolsに挿入
          const insert_c_schools_sql = squel.insert()
                                            .into("c_schools")
                                            .set("customer_id", new_customer_id)
                                            .set("school_id", 161)
                                            .set("undergraduate", "")
                                            .set("join_date", null)
                                            .set("leave_date", null)
                                            .set("school_background_id", 99)
                                            .toString();
      
          try{
            await rds_connect.data_api("insert_c_schools",insert_c_schools_sql,rds, transaction_id);
          }catch(e){
            await rds_connect.rollback(transaction_id,rds);
            console.log(e);
            return formatter.formatJSONResponseServerError("error: cannot insert user's school info");
          }
        }
  
        // 会社情報を入力
        if(c_company_list.length){
          for(let i = 0; i < c_company_list.length; i++){
            const company = body.c_companies[i].company;
            const sub_industry_id = body.c_companies[i].sub_industry_id;
            let join_date = body.c_companies[i].company_join_date;
            if(Boolean(join_date) === false){
              join_date = "1900-01-01";
            }
            let leave_date = body.c_companies[i].company_leave_date;
            if(Boolean(leave_date) === false){
              leave_date = null;
            }
  
            // companiesからcompany_idを取得、ない場合はcompaniesに新しくinsertしてcompany_idを取得する
            const get_company_id_sql = squel.select()
                                          .from("companies")
                                          .field("id")
                                          .where("company = ?", company)
                                          .toString();
  
            const get_company_id = await rds_connect.data_api("get_company_id",get_company_id_sql,rds, transaction_id);
            
            let company_id
            // company_idの有無で処理を場合分け
            if(!get_company_id.get_company_id.length){
              const insert_company_sql = squel.insert()
                                            .into("companies")
                                            .set("company", company)
                                            .set("sub_industry_id", sub_industry_id)
                                            .toString();
  
              try{
                await rds_connect.data_api("insert_new_company",insert_company_sql,rds, transaction_id);
              }catch(e){
                await rds_connect.rollback(transaction_id,rds);
                console.log(e);
                return formatter.formatJSONResponseServerError("error: cannot insert company info");
              }
  
              // 挿入したcompany_idを取得
              const get_new_company_id_sql = squel.select()
                                                .from("companies")
                                                .field("id")
                                                .where("company = ?", company)
                                                .toString();
  
              const get_new_company_id = await rds_connect.data_api("get_new_company_id",get_new_company_id_sql,rds, transaction_id);
              company_id = get_new_company_id.get_new_company_id[0].id;
  
            }else{
              company_id = get_company_id.get_company_id[0].id;
            }
  
            // c_companiesに挿入
            const insert_c_companies_sql = squel.insert()
                                                .into("c_companies")
                                                .set("customer_id", new_customer_id)
                                                .set("company_id", company_id)
                                                .set("join_date", join_date)
                                                .set("leave_date", leave_date)
                                                .toString();
  
            try{
              await rds_connect.data_api("insert_c_companies",insert_c_companies_sql,rds, transaction_id);
            }catch(e){
              await rds_connect.rollback(transaction_id,rds);
              console.log(e);
              return formatter.formatJSONResponseServerError("error: cannot insert user's company info");
            }
  
          }
        }else{
          // c_companiesに挿入
          const insert_c_companies_sql = squel.insert()
                                              .into("c_companies")
                                              .set("customer_id", new_customer_id)
                                              .set("company_id", 35121)
                                              .set("join_date", "1900-01-01")
                                              .set("leave_date", null)
                                              .toString();
      
          try{
            await rds_connect.data_api("insert_c_companies",insert_c_companies_sql,rds, transaction_id);
          }catch(e){
            await rds_connect.rollback(transaction_id,rds);
            console.log(e);
            return formatter.formatJSONResponseServerError("error: cannot insert user's company info");
          }
        }
  
        // 職種情報を入力
        if(c_jobs_list.length){
          // sub_job_idの重複を排除
          const unique_jobs_list = Array.from(new Set(c_jobs_list.map(job => job.sub_job_id)))
                                        .map(sub_job_id => c_jobs_list.find(job => job.sub_job_id === sub_job_id));
        
          for (let i = 0; i < unique_jobs_list.length; i++) {
            const sub_job_id = unique_jobs_list[i].sub_job_id;
            const period = unique_jobs_list[i].job_period;
        
            const insert_c_jobs_sql = squel.insert()
                                            .into("c_jobs")
                                            .set("customer_id", new_customer_id)
                                            .set("sub_job_id", sub_job_id)
                                            .set("period", period)
                                            .toString();
        
            try {
              await rds_connect.data_api("insert_c_jobs", insert_c_jobs_sql, rds, transaction_id);
            } catch (e) {
              await rds_connect.rollback(transaction_id, rds);
              console.log(e);
              return formatter.formatJSONResponseServerError("error: cannot insert user's job info");
            }
          }
        }else{
          const insert_c_jobs_sql = squel.insert()
                                        .into("c_jobs")
                                        .set("customer_id", new_customer_id)
                                        .set("sub_job_id", 9999)
                                        .set("period", 0)
                                        .toString();
      
          try{
            await rds_connect.data_api("insert_c_jobs",insert_c_jobs_sql,rds, transaction_id);
          }catch(e){
            await rds_connect.rollback(transaction_id,rds);
            console.log(e);
            return formatter.formatJSONResponseServerError("error: cannot insert user's job info");
          }
        }
  
        // c_supportsを挿入
        const insert_c_supports_sql = squel.insert()
                                          .into("c_supports")
                                          .set("customer_id", new_customer_id)
                                          .set("agent_id", agent_id)
                                          .set("entry_date", entry_date)
                                          .set("channel_id", channel_id)
                                          .set("support_status_id", 1)
                                          .set("release_reason_id", 1)
                                          .set("digital_ng_reason_id", 1)
                                          .set("first_meeting_date", null)
                                          .set("expected_assign_month", expected_assign_month)
                                          .toString();
  
        try{
          await rds_connect.data_api("insert_c_supports",insert_c_supports_sql,rds, transaction_id);
        }catch(e){
          await rds_connect.rollback(transaction_id,rds);
          console.log(e);
          return formatter.formatJSONResponseServerError("error: cannot insert user support info");
        }
  
        // c_support_idを取得し、希望勤務地を挿入
        if(prefer_address_list.length){
          const get_c_support_id_sql = squel.select()
                                            .from("c_supports")
                                            .field("id")
                                            .where("customer_id = ?", new_customer_id)
                                            .where("agent_id = ?", agent_id)
                                            .where("entry_date = ?", entry_date)
                                            .where("channel_id = ?", channel_id)
                                            .toString();
  
          const get_c_support_id = await rds_connect.data_api("get_c_support_id",get_c_support_id_sql,rds, transaction_id)
          const c_support_id = get_c_support_id.get_c_support_id[0].id;
  
          // 希望勤務地を入力
          const prefer_address_array = new Array();
          for(let i = 0; i < prefer_address_list.length; i++){
            const obj = {
              "c_support_id": c_support_id,
              "address_id": prefer_address_list[i]
            };
            prefer_address_array.push(obj);
          }
          const insert_prefer_addresses_sql = squel.insert()
                                                  .into("cs_prefer_addresses")
                                                  .setFieldsRows(prefer_address_array)
                                                  .toString();
  
          try{
            await rds_connect.data_api("insert_prefer_addresses",insert_prefer_addresses_sql,rds, transaction_id);
          }catch(e){
            await rds_connect.rollback(transaction_id,rds);
            console.log(e);
            return formatter.formatJSONResponseServerError("error: cannot insert prefer address");
          }
        }
      }catch(e){
        await rds_connect.rollback(transaction_id,rds);
        console.log(e);
        return formatter.formatJSONResponseServerError("error: cannot insert any user suport info");
      }
  
    }else{
      
      const get_customer_id_sql = squel.select()
                                      .from("customers")
                                      .field("id")
                                      .where("email = ?", email)
                                      .toString();
  
      const get_customer_id = await rds_connect.data_api("get_customer_id",get_customer_id_sql,rds, transaction_id);
      const customer_id = get_customer_id.get_customer_id[0].id;
  
      // c_supportsに既に挿入されていないかを確認
      const register_judge_c_support_sql = squel.select()
                                                .from("c_supports")
                                                .field("COUNT(id)", "count_num")
                                                .where("customer_id = ?", customer_id)
                                                .where("agent_id = ?", agent_id)
                                                .where("entry_date = ?", entry_date)
                                                .toString();
  
      const c_support_judge_result = await rds_connect.data_api("count_cs_num",register_judge_c_support_sql,rds, transaction_id);
      const cs_count_num = c_support_judge_result.count_cs_num[0].count_num;
      
      // 挿入されていない場合
      if(cs_count_num === 0){
        try{
          const insert_c_supports_sql = squel.insert()
                                            .into("c_supports")
                                            .set("customer_id", customer_id)
                                            .set("agent_id", agent_id)
                                            .set("entry_date", entry_date)
                                            .set("channel_id", channel_id)
                                            .set("support_status_id", 1)
                                            .set("release_reason_id", 1)
                                            .set("digital_ng_reason_id", 1)
                                            .set("first_meeting_date", null)
                                            .set("expected_assign_month", expected_assign_month)
                                            .toString();
    
          await rds_connect.data_api("insert_c_supports",insert_c_supports_sql,rds, transaction_id);
        }catch(e){
          await rds_connect.rollback(transaction_id,rds);
          console.log(e);
          return formatter.formatJSONResponseServerError("error: cannot insert user support info");
        }
      } else {
        return formatter.formatJSONResponseSuccess({
          "res": "duplicated"
        });
      }
  
      // c_support_idを取得し、希望勤務地を挿入
      if(prefer_address_list.length){
        try{
          const get_c_support_id_sql = squel.select()
                                            .from("c_supports")
                                            .field("id")
                                            .where("customer_id = ?", customer_id)
                                            .where("agent_id = ?", agent_id)
                                            .where("entry_date = ?", entry_date)
                                            .where("channel_id = ?", channel_id)
                                            .toString();
      
          const get_c_support_id = await rds_connect.data_api("get_c_support_id",get_c_support_id_sql,rds, transaction_id)
          const c_support_id = get_c_support_id.get_c_support_id[0].id;
      
          // 希望勤務地を入力
          const prefer_address_array = new Array();
          for(let i = 0; i < prefer_address_list.length; i++){
            const obj = {
              "c_support_id": c_support_id,
              "address_id": prefer_address_list[i]
            };
            prefer_address_array.push(obj);
          }
          const insert_prefer_addresses_sql = squel.insert()
                                                  .into("cs_prefer_addresses")
                                                  .setFieldsRows(prefer_address_array)
                                                  .toString();
    
          await rds_connect.data_api("insert_prefer_addresses",insert_prefer_addresses_sql,rds, transaction_id);
        }catch(e){
          await rds_connect.rollback(transaction_id,rds);
          console.log(e);
          return formatter.formatJSONResponseServerError("error: cannot insert prefer address info");
        }
      }
    
    }
    
    // 全部通過した場合にcommitを実行
    await rds_connect.commit(transaction_id,rds);
    return formatter.formatJSONResponseSuccess({
      "res": 'completed'
    });
  }catch(err){
    console.log(err);
    return formatter.formatJSONResponseServerError("error");
  }

};
