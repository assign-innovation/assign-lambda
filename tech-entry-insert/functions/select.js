/**
 * エントリー候補者の検索
 * @param {*} event
 * @param {*} squel
 * @param {*} rds_connect
 * @param {*} formatter
 * @returns
 */
export const index = async (event, squel, rds_connect, formatter) => {
  // 処理の用意
  const query = event.queryStringParameters.select;
  const query_list = query.split("+");
  const result_list = [];

  if (query_list.includes("agent")) {
    const agent_select_sql = squel
      .select()
      .from("agents")
      .left_join("teams", null, "agents.team_id = teams.id")
      .field("agents.id")
      .field("agents.last_name")
      .field("agents.first_name")
      .field("agents.email")
      .field("agents.rights")
      .field("agents.team_id")
      .field("agents.assistant_id")
      .field("teams.group_id")
      .field("agents.signature")
      .field("agents.calendar_url")
      .field("agents.line_register_url")
      .field("agents.google_chat_id")
      .where("agents.active = 1")
      .order("agents.id")
      .toString();

    const agent_list = await rds_connect.data_api(agent_select_sql);
    result_list.push(agent_list);
  }

  if (query_list.includes("channel")) {
    const channel_select_sql = squel
      .select()
      .from("channels")
      .field("id")
      .field("channel")
      .order("id")
      .toString();

    const channel_list = await rds_connect.data_api(channel_select_sql);
    result_list.push(channel_list);
  }

  if (query_list.includes("industry")) {
    const industry_select_sql = squel
      .select()
      .from("sub_industries")
      .join(
        "main_industries",
        null,
        "sub_industries.main_industry_id = main_industries.id",
      )
      .field("main_industries.id", "main_industry_id")
      .field("main_industries.main_industry")
      .field("sub_industries.id", "sub_industry_id")
      .field("sub_industries.sub_industry")
      .order("main_industry_id, sub_industry_id")
      .toString();

    const industry_list = await rds_connect.data_api(industry_select_sql);
    result_list.push(industry_list);
  }

  if (query_list.includes("job")) {
    const job_select_sql = squel
      .select()
      .from("sub_jobs")
      .join("main_jobs", null, "sub_jobs.main_job_id = main_jobs.id")
      .field("main_jobs.id", "main_job_id")
      .field("main_jobs.main_job")
      .field("sub_jobs.id", "sub_job_id")
      .field("sub_jobs.sub_job")
      .order("main_job_id, sub_job_id")
      .toString();

    const job_list = await rds_connect.data_api(job_select_sql);
    result_list.push(job_list);
  }

  if (query_list.includes("client_tech_industry")) {
    const client_tech_industry_select_sql = squel
      .select()
      .from("client_tech_industries")
      .field("id")
      .field("client_tech_industry")
      .order("id")
      .toString();

    const client_tech_industry_list = rds_connect.data_api(
      client_tech_industry_select_sql,
    );
    result_list.push(client_tech_industry_list);
  }

  if (query_list.includes("address")) {
    const address_select_sql = squel
      .select()
      .from("addresses")
      .field("id")
      .field("address")
      .order("id")
      .toString();

    const address_list = await rds_connect.data_api(address_select_sql);
    result_list.push(address_list);
  }

  const tmp = await Promise.all(result_list);
  const res = new Object();
  for (let i in tmp) {
    const key_name = Object.keys(tmp[i])[0];
    res[key_name] = tmp[i][key_name];
  }

  return formatter.formatJSONResponseSuccess({
    res,
  });
};
