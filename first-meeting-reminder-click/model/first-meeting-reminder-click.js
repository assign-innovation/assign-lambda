import squel from "squel";
import { data_api, begin, commit, rollback } from "../src/rds_connect.js";

squel.useFlavour("mysql");

/**
 * クリックイベント
 * @param {*} event
 * @param {*} rds
 * @returns
 */
export const index = async (event, rds) => {
    const c_support_id = event.id;

    // c_support_id がない場合はエラーを返す
    if (!Boolean(c_support_id)) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                res: "c_support_id is required",
            }),
            headers: {
                "Content-Type": "application/json",
            },
        };
    }

    // --------------------------------
    // クリックフラグを true にする
    // --------------------------------
    // SQL の生成
    const update_sql = squel
        .update()
        .table("c_supports")
        .set("is_reminder_clicked", true)
        .where("id = ?", c_support_id)
        .where("agent_id = ?", 156) // todo: けす
        .toString();

    // Data API にアクセス
    const transactionId = await begin(); // トランザクションを開始
    try {
        await data_api(update_sql, transactionId);
        await commit(transactionId);
    } catch (error) {
        console.error("Error during update:", error);
        await rollback(transactionId);
        return {
            statusCode: 500,
            body: JSON.stringify({
                res: `is_reminder_clicked update error : ${error}`,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        };
    }

    // --------------------------------
    // 担当エージェントの名前、電話番号、メールアドレスを返す
    // --------------------------------
    // SQL の生成
    const select_sql = squel
        .select()
        .from("c_supports")
        .join("agents", null, "c_supports.agent_id = agents.id")
        .field("CONCAT(agents.last_name, ' ', agents.first_name)", "agent_name")
        .field("agents.phone")
        .field("agents.email")
        .where("c_supports.id = ?", c_support_id)
        .where("c_supports.agent_id = ?", 156) // todo: けす
        .toString();

    // Data API にアクセス
    try {
        const select_result = await data_api(select_sql);

        return {
            statusCode: 200,
            body: JSON.stringify({
                res: select_result[0],
            }),
            headers: {
                "Content-Type": "application/json",
            },
        };
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                res: `first-meeting-reminder-click error : ${err}`,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        };
    }
};
