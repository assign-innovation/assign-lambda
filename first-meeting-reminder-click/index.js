// ========================================================
// Node.js v20 & aws-sdk v3
// ========================================================
import { RDSDataClient } from "@aws-sdk/client-rds-data";

import { index as errIndex } from "./model/err.js";
import { index as firstMeetingReminderClickIndex } from "./model/first-meeting-reminder-click.js";

const rds = new RDSDataClient({ region: "ap-northeast-1" });

/**
 * 初回面談リマインドのボタンクリックイベントを ACE に反映するための関数
 * @param {*} event
 * @param {*} context
 * @param {*} callback
 */
export const handler = async (event, context, callback) => {
    try {
        let res;
        switch (event.route) {
            case "click-event":
                res = await firstMeetingReminderClickIndex(event, rds);
                break;
            case "error":
                res = await errIndex(event, rds);
                break;
            default:
                throw new Error("No such route exists");
        }

        callback(null, res.statusCode === 200 ? res : JSON.stringify(res));
    } catch (error) {
        callback(
            JSON.stringify({
                statusCode: 400,
                body: JSON.stringify({ res: error.message }),
                headers: { "Content-Type": "application/json" },
            }),
        );
    }
};
