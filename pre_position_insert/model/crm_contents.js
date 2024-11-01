const squel = require("squel").useFlavour('mysql');
const rds_connect = require('../src/rds_connect.js');

exports.index =  async function(event, rds){
    
    let match_apealpoint = [];
    // ポジション情報を取得
    let data_sql = squel.select()
        .from("positions")
        .join("clients","","positions.client_id = clients.id")
        .join("picks","","positions.pick_id = picks.id")
        .join("cl_industries","","clients.id = cl_industries.client_id")
        .join("client_sub_industries","","cl_industries.client_sub_industry_id = client_sub_industries.id")
        .join("client_main_industries","","client_sub_industries.client_main_industry_id = client_main_industries.id")
        .field("clients.member","member")
        .field("clients.listed_id","listed_id")
        .field("clients.glitter_flag","glitter_flag")
        .field("clients.large_company_flag","large_company_flag")
        .field("clients.venture_flag","venture_flag")
        .field("picks.remote_work_flag","remote_work_flag")
        .field("picks.work_life_balance_flag","work_life_balance_flag")
        .field("picks.incentive_flag","incentive_flag")
        .field("picks.start_up_skill_flag","start_up_skill_flag")
        .field("GROUP_CONCAT(client_main_industry)","client_main_industry")
        .field("positions.job_detail","job_detail")
        .field("positions.requirement","requirement")
        .field("positions.other","other")
        .field("clients.client_short","client")
        .where(`positions.id = ${event.position[0]}`)
        .group("positions.id")
        .toString();
        
    let data = await rds_connect.data_api("select",data_sql,rds);
        
    // 各魅力点毎に繰り返し
    let member_done = false;
    for(let i = 0; i < event.appeals.length; i++){
        switch (event.appeals[i][1]) {
            case '従業員数':
                if(member_done == false){
                    let member = Number(data.select[0].member);
                    if(member >= event.appeals[i][2]){
                        match_apealpoint.push(event.appeals[i]);
                        match_apealpoint.push(event.appeals[i+1]);
                        match_apealpoint.push(event.appeals[i+2]);
                        i = i + 2;
                        member_done = true;
                    }
                }
                break;
                
            case '上場':
                let listed_id = data.select[0].listed_id;
                if(listed_id == event.appeals[i][2]){
                    match_apealpoint.push(event.appeals[i]);
                    match_apealpoint.push(event.appeals[i+1]);
                    match_apealpoint.push(event.appeals[i+2]);
                    i = i + 2;
                }
                break;
                
            case '業界No.1':
                if(data.select[0].glitter_flag == 1){
                    match_apealpoint.push(event.appeals[i]);
                    match_apealpoint.push(event.appeals[i+1]);
                    match_apealpoint.push(event.appeals[i+2]);
                    i = i + 2;
                }
                break;
            
            case '大手':
                if(data.select[0].large_company_flag == 1){
                    match_apealpoint.push(event.appeals[i]);
                    match_apealpoint.push(event.appeals[i+1]);
                    match_apealpoint.push(event.appeals[i+2]);
                    i = i + 2;
                }
                break;
            
            case 'ベンチャー':
                if(data.select[0].venture_flag == 1){
                    match_apealpoint.push(event.appeals[i]);
                    match_apealpoint.push(event.appeals[i+1]);
                    match_apealpoint.push(event.appeals[i+2]);
                    i = i + 2;
                }
                break;
            
            case 'リモートワーク推奨':
                if(data.select[0].remote_work_flag == 1){
                    match_apealpoint.push(event.appeals[i]);
                    match_apealpoint.push(event.appeals[i+1]);
                    match_apealpoint.push(event.appeals[i+2]);
                    i = i + 2;
                }
                break;
            
            case 'ワークライフバランス':
                if(data.select[0].work_life_balance_flag == 1){
                    match_apealpoint.push(event.appeals[i]);
                    match_apealpoint.push(event.appeals[i+1]);
                    match_apealpoint.push(event.appeals[i+2]);
                    i = i + 2;
                }
                break;
            
            case 'インセン重視':
                if(data.select[0].incentive_flag == 1){
                    match_apealpoint.push(event.appeals[i]);
                    match_apealpoint.push(event.appeals[i+1]);
                    match_apealpoint.push(event.appeals[i+2]);
                    i = i + 2;
                }
                break;
            
            case '起業向け経験':
                if(data.select[0].start_up_skill_flag == 1){
                    match_apealpoint.push(event.appeals[i]);
                    match_apealpoint.push(event.appeals[i+1]);
                    match_apealpoint.push(event.appeals[i+2]);
                    i = i + 2;
                }
                break;
                
            case '年収上限':
                if(Number(event.position[7].replace("万円","")) >= Number(event.appeals[i][2])){
                    match_apealpoint.push(event.appeals[i]);
                    match_apealpoint.push(event.appeals[i+1]);
                    match_apealpoint.push(event.appeals[i+2]);
                    i = i + 2;
                }
                break;
            
            case '年収下限':
                if(Number(event.position[6].replace("万円","")) >= Number(event.appeals[i][2])){
                    match_apealpoint.push(event.appeals[i]);
                    match_apealpoint.push(event.appeals[i+1]);
                    match_apealpoint.push(event.appeals[i+2]);
                    i = i + 2;
                }
                break;
                
            case '業界':
                if(data.select[0].client_main_industry.match(new RegExp(event.appeals[i][2]))){
                    match_apealpoint.push(event.appeals[i]);
                    match_apealpoint.push(event.appeals[i+1]);
                    match_apealpoint.push(event.appeals[i+2]);
                    i = i + 2;
                }
                break;
                
            case '業務内容':
                if(data.select[0].job_detail.match(new RegExp(event.appeals[i][2]))){
                    match_apealpoint.push(event.appeals[i]);
                    match_apealpoint.push(event.appeals[i+1]);
                    match_apealpoint.push(event.appeals[i+2]);
                    i = i + 2;
                }
                break;
                
            case '応募要件':
                if(data.select[0].requirement.match(new RegExp(event.appeals[i][2]))){
                    match_apealpoint.push(event.appeals[i]);
                    match_apealpoint.push(event.appeals[i+1]);
                    match_apealpoint.push(event.appeals[i+2]);
                    i = i + 2;
                }
                break;
                
            case '仕事環境':
                if(data.select[0].other.match(new RegExp(event.appeals[i][2]))){
                    match_apealpoint.push(event.appeals[i]);
                    match_apealpoint.push(event.appeals[i+1]);
                    match_apealpoint.push(event.appeals[i+2]);
                    i = i + 2;
                }
                break;
                
            case '企業名':
                if(data.select[0].client == event.appeals[i][2]){
                    match_apealpoint.push(event.appeals[i]);
                    match_apealpoint.push(event.appeals[i+1]);
                    match_apealpoint.push(event.appeals[i+2]);
                    i = i + 2;
                }
                break;
            
            default:
                // code
        }
        
    }
    
    return match_apealpoint;
};
