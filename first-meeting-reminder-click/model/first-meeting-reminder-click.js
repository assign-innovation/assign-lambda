const squel = require("squel").useFlavour('mysql');
const rds_connect = require('../src/rds_connect.js');

exports.index =  async function(event, rds){
    
    const c_support_id = event.id;
    if(Boolean(c_support_id) === false){
        return {
            statusCode: 400,
            body: JSON.stringify({
                res: "invalid id"
            }),
            headers: {
                'Content-Type': 'application/json',
            }
        };
    }
    
    // クリックログをtrueにする
    const update_sql = squel.update()
                            .table("c_supports")
                            .set("is_reminder_clicked", true)
                            .where("id = ?", c_support_id)
                            .toString();
    
    // 担当エージェントの名前、電話番号、メールアドレスを返す
    const select_sql = squel.select()
                            .from("c_supports")
                            .join("agents", null, "c_supports.agent_id = agents.id")
                            .field("CONCAT(agents.last_name, ' ', agents.first_name)", "agent_name")
                            .field("agents.phone")
                            .field("agents.email")
                            .where("c_supports.id = ?", c_support_id)
                            .toString();

    // 結果を返却する
    return await Promise.all([rds_connect.data_api("update", update_sql, rds), rds_connect.data_api("select", select_sql, rds)])
        .then(result => {
            console.log(result);
            return {
                statusCode: 200,
                body: JSON.stringify({
                    res: result[1]["select"][0]
                }),
                headers: {
                    'Content-Type': 'application/json',
                }
            };
        })
        .catch(err => {
            return {
                statusCode: 500,
                body: JSON.stringify({
                    res: err
                }),
                headers: {
                    'Content-Type': 'application/json',
                }
            };
        });
};
