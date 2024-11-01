import https from "https";

/**
 * エラーログを Google Chat に送信する関数
 * @param {*} event
 * @param {*} rds
 * @returns
 */
export const index = async (event, rds) => {
    if (event.err_log != "クエリパラメータなし") {
        const endpoint =
            "https://chat.googleapis.com/v1/spaces/AAAA49ItOgw/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=20RxWGTJfDFbMNcan3NUy9fu2V2SwKbwK6qE6s1prcg";
        const messages = JSON.stringify({
            text:
                `■初回面談クリックログ\n` +
                `・c_support_id：${event.id}\n` +
                `・エラー内容：${event.err_log}\n`,
        });
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        };
        const request = https.request(endpoint, options);

        request.write(messages);
        request.end();
    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            res: "done",
        }),
        headers: {
            "Content-Type": "application/json",
        },
    };
};
