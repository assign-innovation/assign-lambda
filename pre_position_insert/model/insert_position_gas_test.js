const squel = require("squel").useFlavour('mysql');
const rds_connect = require('../src/rds_connect.js');

exports.index =  async function(event, rds){
    
    let pick_insert_sql = squel.insert()
                            .into("picks")
                            .setFieldsRows(event.records[0])
                            .onDupUpdate("position_name = VALUES(position_name)")
                            .toString()
                            .replace(/'SELECT/g,"(SELECT")
                            .replace(/AS apply_point'/g,"AS apply_point)")
                            .replace(/AS special_note'/g,"AS special_note)")
                            ;
    try{
        await rds_connect.data_api("insert",pick_insert_sql,rds);
    }catch{return 1}
    
    let position_name_list = '';
    for(let i = 0; i < event.records[0].length; i++){
        position_name_list += ',"' + event.records[0][i].position_name + '"';
    }
    
    let pick_id_select_sql = squel.select()
                                .from("picks")
                                .field("id")
                                .field("client_id")
                                .field("position_name")
                                .where("(client_id,position_name) IN ?",(event.records[2]))
                                .order(`FIELD(position_name${position_name_list})`)
                                .toString();
    let res_2;
    try{
        try{
            res_2 = await rds_connect.data_api("select",pick_id_select_sql,rds);
        }catch{
            let pick_id_select_sql = squel.select()
                                .from("picks")
                                .field("id")
                                .field("client_id")
                                .field("position_name")
                                .where("(client_id,position_name) IN (?)",(event.records[2]))
                                .order(`FIELD(position_name${position_name_list})`)
                                .toString();
            
            res_2 = await rds_connect.data_api("select",pick_id_select_sql,rds);
        }    
    }catch{
        return pick_id_select_sql;
    }
    
    for(let i = 0; i < event.records[1].length; i++){
        for(let j = 0; j < res_2.select.length; j++){
            if(event.records[0][i].client_id == res_2.select[j].client_id && event.records[0][i].position_name == res_2.select[j].position_name){
                event.records[1][i].pick_id = res_2.select[j].id;
                break;
            }
        }
    }
    
    let sql = squel.insert()
                .into("positions")
                .setFieldsRows(event.records[1])
                .onDupUpdate("open", 1)
                .onDupUpdate("url = VALUES(url)")
                .onDupUpdate("tool_data = VALUES(tool_data)")
                // .onDupUpdate("expired_date = VALUES(expired_date)")
                // .onDupUpdate("pick_id = VALUES(pick_id)")
                .toString();
    
    try{
        await rds_connect.data_api("insert",sql,rds);
    }catch{return 3}
    
    let position_list = '';
    for(let i = 0; i < event.records[3].length; i++){
        position_list += ',"' + event.records[3][i][1] + '"';
    }
    
    let position_id_select_sql = squel.select()
                                .from("positions")
                                .field("id")
                                // .field("client_id")
                                // .field("full_position")
                                .where("(client_id,full_position) IN ?",event.records[3])
                                .order(`FIELD(full_position${position_list})`)
                                .toString();
    let res_4;
    try{
        res_4 = await rds_connect.data_api("select",position_id_select_sql,rds);
    }catch{
        let position_id_select_sql = squel.select()
                                .from("positions")
                                .field("id")
                                // .field("client_id")
                                // .field("full_position")
                                .where("(client_id,full_position) IN (?)",event.records[3])
                                .order(`FIELD(full_position${position_list})`)
                                .toString();
        try{
            res_4 = await rds_connect.data_api("select",position_id_select_sql,rds);
        }catch{
            return position_id_select_sql;
        }
    }
    
    let segment_list = [];
    let job_list = [];
    let address_list = [];
    // ポジションごとに繰り返す
    for(let i = 0; i < res_4.select.length;i++){
        // id毎に繰り返す
        for(let j = 0; j < event.records[4][i].length; j++){
            if(event.records[4][i][j] != ""){
                segment_list.push({
                    "position_id" : res_4.select[i].id,
                    "position_segment_id" : event.records[4][i][j]
                });
            }
        }
        for(let j = 0; j < event.records[5][i].length; j++){
            if(event.records[5][i][j] != ""){
                job_list.push({
                    "position_id" : res_4.select[i].id,
                    "client_sub_job_id" : event.records[5][i][j]
                });
            }
        }
        for(let j = 0; j < event.records[6][i].length; j++){
            if(event.records[6][i][j] != ""){
                address_list.push({
                    "position_id" : res_4.select[i].id,
                    "address_id" : event.records[6][i][j]
                });
            }
        }
    }
    if(segment_list.length > 0){
        let segment_insert_sql = squel.insert()
                                    .into("po_segments")
                                    .setFieldsRows(segment_list)
                                    .onDupUpdate("updated_at = CURRENT_TIMESTAMP()")
                                    .toString();
        try{
            rds_connect.data_api("insert",segment_insert_sql,rds);
        }catch{return 5}
    }
    
    if(job_list.length > 0){
        let job_insert_sql = squel.insert()
                                    .into("po_jobs")
                                    .setFieldsRows(job_list)
                                    .onDupUpdate("updated_at = CURRENT_TIMESTAMP()")
                                    .toString();
        try{
            rds_connect.data_api("insert",job_insert_sql,rds);
        }catch{return 6}
    
    }
    
    if(address_list.length > 0){
    let address_insert_sql = squel.insert()
                                .into("po_addresses")
                                .setFieldsRows(address_list)
                                .onDupUpdate("updated_at = CURRENT_TIMESTAMP()")
                                .toString();
        try{
            rds_connect.data_api("insert",address_insert_sql,rds);
        }catch{return 7}
    }
                                
                                
    return "OK";
    
};
