/**
 * RPA のスカウトエントリーの候補者データを ACE に追加するためのフォーマット
 * @param {*} event
 * @param {*} squel
 * @param {*} rds_connect
 */
export const formatRPAJSON = async (event, squel, rds_connect) => {
  try {
    // --------------------------------
    // address_id を設定
    // --------------------------------
    const get_address_id_sql = squel
      .select()
      .field("id")
      .from("addresses")
      .where("address = ?", event.customers.address)
      .toString();
    const address_id_data = await rds_connect.data_api(get_address_id_sql);
    const addressId = !!address_id_data[0] ? address_id_data[0].id : null;

    // --------------------------------
    // agent_id を設定
    // --------------------------------
    const get_agent_id_sql = squel
      .select()
      .field("id")
      .from("agents")
      .where("last_name = ?", event.c_supports.agent_last_name)
      .where("first_name = ?", event.c_supports.agent_first_name)
      .toString();
    const agent_id_data = await rds_connect.data_api(get_agent_id_sql);
    const agentId = !!agent_id_data[0] ? agent_id_data[0].id : null;

    // --------------------------------
    // channel_id を設定
    // --------------------------------
    const get_channel_id_sql = squel
      .select()
      .field("id")
      .from("channels")
      .where("channel = ?", event.c_supports.channel)
      .toString();
    const channel_id_data = await rds_connect.data_api(get_channel_id_sql);
    const channelId = !!channel_id_data[0] ? channel_id_data[0].id : null;

    // --------------------------------
    // c_schools を設定
    // --------------------------------
    let cSchools = Object.keys(event.c_schools)
      .filter((key) => key.startsWith("school_") && event.c_schools[key])
      .map((key, index) => {
        const school = event.c_schools[`school_${index + 1}`];
        if (!school) return null;

        return {
          school,
          undergraduate: (
            event.c_schools[`undergraduate_${index + 1}`] || ""
          ).trim(),
          school_join_date:
            event.c_schools[`join_date_${index + 1}`] === "NULL"
              ? ""
              : event.c_schools[`join_date_${index + 1}`],
          school_leave_date: event.c_schools[`leave_date_${index + 1}`],
        };
      })
      .filter((school) => school !== null);

    let seenSchools = new Set();
    cSchools = cSchools.filter((item) => {
      if (seenSchools.has(item.school)) {
        return false;
      } else {
        seenSchools.add(item.school);
        return true;
      }
    });

    // --------------------------------
    // c_companies を設定
    // --------------------------------
    const cCompanies = Object.keys(event.c_companies)
      .filter((key) => key.startsWith("company_") && event.c_companies[key])
      .map((key, index) => {
        const company = event.c_companies[`company_${index + 1}`];
        if (!company) return null;

        return {
          company,
          sub_industry_id:
            event.c_companies[`sub_industry_id_${index + 1}`] || 999,
          company_join_date:
            event.c_companies[`company_join_date_${index + 1}`] || "",
          company_leave_date:
            event.c_companies[`company_leave_date_${index + 1}`] || "",
        };
      })
      .filter((company) => company !== null);

    // --------------------------------
    // c_jobs を設定
    // --------------------------------
    const cJobsPromises = Object.keys(event.c_jobs)
      .filter((key) => key.startsWith("sub_job_"))
      .map(async (key, index) => {
        const subJobName = event.c_jobs[`sub_job_${index + 1}`];
        const mainJobName = event.c_jobs[`main_job_${index + 1}`];

        let subJobId;
        if (!subJobName || !mainJobName) {
          console.warn(
            `Empty job names detected, setting subJobId to 999: sub_job: ${subJobName}, main_job: ${mainJobName}`,
          );
          subJobId = 999;
        } else {
          const get_sub_job_id_sql = squel
            .select()
            .field("sub_jobs.id")
            .from("sub_jobs")
            .left_join("main_jobs", null, "sub_jobs.main_job_id = main_jobs.id")
            .where("sub_jobs.sub_job = ?", subJobName)
            .where("main_jobs.main_job = ?", mainJobName)
            .limit(1)
            .toString();
          const sub_job_id_data = await rds_connect.data_api(
            get_sub_job_id_sql,
          );

          subJobId = !!sub_job_id_data[0] ? sub_job_id_data[0].id : 999;
        }

        return {
          sub_job_id: subJobId,
          job_period: parseInt(event.c_jobs[`period_${index + 1}`], 10),
        };
      });

    const cJobs = await Promise.all(cJobsPromises);

    // --------------------------------
    // prefer_addresses を設定
    // --------------------------------
    const preferAddresses = Object.keys(event.cs_prefer_addresses)
      .filter(
        (key) =>
          key.startsWith("prefer_address_") && key !== "prefer_address_number",
      )
      .sort((a, b) => parseInt(a.split("_")[2]) - parseInt(b.split("_")[2]))
      .map((key) => event.cs_prefer_addresses[key])
      .filter((address) => !!address);

    // --------------------------------
    // formatJsonBody を設定
    // --------------------------------
    const formatJsonBody = {
      email: event.customers.email,
      phone: event.customers.phone,
      customer_last_name: event.customers.last_name,
      customer_first_name: event.customers.first_name,
      customer_last_name_kana: event.customers.last_kana,
      customer_first_name_kana: event.customers.first_kana,
      entry_age: parseInt(event.customers.entry_age, 10),
      birthday: event.customers.birthday.replace(/\//g, "-"),
      income: parseInt(event.customers.income, 10),
      address_id: addressId,
      gender_id: parseInt(event.customers.gender_id, 10),
      detail: event.customers.detail,
      view_registry: event.customers.view_registry === "1",
      agent_id: agentId,
      channel_id: channelId,
      c_schools: cSchools,
      c_companies: cCompanies,
      c_jobs: cJobs.filter((job) => job.sub_job_id !== 999),
      prefer_addresses: preferAddresses,
    };

    return {
      body: JSON.stringify(formatJsonBody),
    };
  } catch (error) {
    console.error(error);
    return {
      body: { error },
    };
  }
};
