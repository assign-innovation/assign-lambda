// 必要なモジュールを読み込み
import squel from "squel";

import * as rds_connect from "./src/rds_connect.js";
import * as formatter from "./src/formatter_response.js";
import { formatRPAJSON } from "./src/formatter_json.js";

import { index as insertIndex } from "./functions/insert.js";
// import { index as selectIndex } from "./functions/select.js";

// 処理
export const handler = async (event, context, callback) => {
  try {
    console.log(event);

    let res;
    const resource = event.resource || "";
    const isRpaRoute = !!event.customers;

    if (resource == "/users/create") {
      // Tech: エントリー候補者の登録
      res = await insertIndex(event, squel, rds_connect, formatter);
    } else if (resource == "/items/search") {
      // Tech: エントリー候補者の検索
      res = await selectIndex(event, squel, rds_connect, formatter);
    } else if (!Boolean(resource) && isRpaRoute) {
      // RPA: エントリー候補者の登録
      const formattedEventJSON = await formatRPAJSON(event, squel, rds_connect);
      res = await insertIndex(
        formattedEventJSON,
        squel,
        rds_connect,
        formatter,
      );
    } else {
      return formatter.formatJSONResponseBadRequest({ res: "invalid request" });
    }

    return res;
  } catch (err) {
    console.log(err);
    return formatter.formatJSONResponseServerError("error");
  }
};
