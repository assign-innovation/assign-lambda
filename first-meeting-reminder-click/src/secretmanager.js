import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import {
    SecretsManagerClient,
    GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

// secretmanagerの接続
const secretsManager = new SecretsManagerClient({ region: "ap-northeast-1" });

// .env ファイルの読み込み
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// 環境変数の取得
const environment = process.env.ENVIROMENT || "";

// キャッシュ用のオブジェクトを定義
const cache = {
    dataAPIArn: null,
};

// -- [ methods ] -------------------------------------------------------------
/**
 * AWS Secrets Managerから秘密情報を取得する関数
 * @param {string} secretId - SecretManager から取得するシークレット名
 * @returns {Promise<string>} - シークレット名のシークレットの値をJSONですべて返す
 */
const getSecret = async (secretId) => {
    try {
        const command = new GetSecretValueCommand({ SecretId: secretId });
        const secretValue = await secretsManager.send(command);
        const secretObject = JSON.parse(secretValue.SecretString);
        return secretObject;
    } catch (err) {
        console.error(`getSecret ERROR : ${err}`);
        throw err;
    }
};

// -- [ methods ] -------------------------------------------------------------
/**
 * AWS Secrets Managerから asnkpi DB の情報を取得する関数
 * @returns {Promise<string>} - シークレットの JSON
 */
export const getDataAPIArn = async () => {
    if (cache.dataAPIArn) {
        return cache.dataAPIArn;
    }

    try {
        const secretJson = await getSecret("ace-common");

        if (environment === "production" || environment.includes("release")) {
            cache.dataAPIArn = {
                secretArn: secretJson["ACE_DATA_API_PROD_SECRET_ARN"],
                resourceArn: secretJson["ACE_DATA_API_PROD_RESOURCE_ARN"],
            };
        } else {
            cache.dataAPIArn = {
                secretArn: secretJson["ACE_DATA_API_DEV_SECRET_ARN"],
                resourceArn: secretJson["ACE_DATA_API_DEV_RESOURCE_ARN"],
            };
        }

        return cache.dataAPIArn;
    } catch (err) {
        console.error(`getDataAPIArn ERROR : ${err}`);
        throw err;
    }
};
