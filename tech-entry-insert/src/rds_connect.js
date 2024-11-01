import {
    RDSDataClient,
    ExecuteStatementCommand,
    BeginTransactionCommand,
    CommitTransactionCommand,
    RollbackTransactionCommand,
} from "@aws-sdk/client-rds-data";
import { getDataAPIArn } from "./secretmanager.js";

const client = new RDSDataClient({ region: process.env.region });
const databaseName = "asnkpi";

// -- [ methods ] -------------------------------------------------------------
/**
 * CRUD
 * @param {string} sql SQL
 * @param {string} transactionId トランザクションID
 * @returns {
 *   Promise<
 *     ExecuteStatementCommandOutput,
 *     Record<string, string | number | boolean | Date | Buffer
 *   >[]
 * } データ
 */
export const data_api = async function (sql, transactionId = "") {
    const arnValues = await getDataAPIArn();

    const params = {
        resourceArn: arnValues.resourceArn,
        secretArn: arnValues.secretArn,
        sql: sql,
        database: databaseName,
        includeResultMetadata: true,
        transactionId: transactionId,
    };

    const command = new ExecuteStatementCommand(params);
    const sql_data = await client.send(command);

    if (sql_data.records) {
        const res = key_insert(sql_data);
        return res;
    } else {
        return sql_data;
    }
};

// -- [ methods ] -------------------------------------------------------------
/**
 * トランザクションを開始する
 * @returns トランザクションID
 */
export const begin = async function () {
    const arnValues = await getDataAPIArn();
    const params = {
        resourceArn: arnValues.resourceArn,
        secretArn: arnValues.secretArn,
        database: databaseName,
    };

    const command = new BeginTransactionCommand(params);
    const transaction = await client.send(command);
    return transaction.transactionId;
};

/**
 * トランザクションをコミットする
 * @param {string} transactionId トランザクションID
 * @returns トランザクションステータス
 */
export const commit = async function (transactionId) {
    const arnValues = await getDataAPIArn();
    const params = {
        resourceArn: arnValues.resourceArn,
        secretArn: arnValues.secretArn,
        transactionId: transactionId,
        database: databaseName,
    };

    const command = new CommitTransactionCommand(params);
    const status = await client.send(command);
    return status.transactionStatus;
};

/**
 * トランザクションをロールバックする
 * @param {string} transactionId トランザクションID
 * @returns トランザクションステータス
 */
export const rollback = async function (transactionId) {
    const arnValues = await getDataAPIArn();
    const params = {
        resourceArn: arnValues.resourceArn,
        secretArn: arnValues.secretArn,
        transactionId: transactionId,
        database: databaseName,
    };

    const command = new RollbackTransactionCommand(params);
    const status = await client.send(command);
    return status.transactionStatus;
};

// -- [ methods ] -------------------------------------------------------------
/**
 * select時のデータをマッピングする
 * @param {ExecuteStatementCommandOutput} sql_data SQLデータ
 * @returns キーをキーとして配列に変換したデータ
 */
export const key_insert = (sql_data) => {
    const array = [];
    for (let i = 0; i < sql_data.records.length; i++) {
        const obj = {};
        for (let j = 0; j < sql_data.columnMetadata.length; j++) {
            const resKey = sql_data.columnMetadata[j].label;
            if (Object.keys(sql_data.records[i][j])[0] == "isNull") {
                obj[resKey] = null;
            } else {
                obj[resKey] = Object.values(sql_data.records[i][j])[0];
            }
        }
        array.push(obj);
    }
    return array;
};
