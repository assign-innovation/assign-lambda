// import axios from "axios";
const {google} = require('googleapis');
const key = require('credentials.json');
const SCOPES = ['https://mail.google.com/'];
const squel = require("squel").useFlavour('mysql');
const rds_connect = require('../src/rds_connect.js');

exports.index =  async function(event, rds){
    
    
  const select_target_customer = squel
    .select()
    .from("c_supports")
    .join("customers",null,"c_supports.customer_id = customers.id")
    .join("agents","agent_alias_1","c_supports.agent_id = agent_alias_1.id")
    .join("agents","agent_alias_2","agent_alias_1.assistant_id = agent_alias_2.id")
    .join("channels", null, "c_supports.channel_id = channels.id AND channel LIKE '%マーケ%'") //マーケのみ
    .field("customers.last_name","customer_last_name")
    .field("customers.email","customer_email")
    .field("agent_alias_1.last_name","agent_last_name")
    .field("agent_alias_1.email","agent_email")
    .field("agent_alias_1.phone","agent_phone")
    .field("agent_alias_1.signature","agent_signature")
    .field("agent_alias_2.last_name","assistant_last_name")
    .field("agent_alias_2.email","assistant_agent")
    .field("first_meeting_date","first_meeting_date")
    .field("first_meeting_time","first_meeting_time")
    .field("mail_auto_sending")
    .where("first_meeting_date = CURRENT_DATE + INTERVAL 3 DAY") //標準時時刻になるから9:00以降にプログラムを回す
    .toString();
  
  const target_customer_data = await rds_connect.data_api("select", select_target_customer, rds);
  let error_log = [];

  // 各ターゲットの転職者の分だけ繰り返す
  let done = 0;
  let error = new Array();
  for(let data of target_customer_data.select){
    try{
      let subAddress = data.assistant_agent;
      let fromAddress = data.agent_email;
      let toAddress = data.customer_email;
      let agentLastName = data.agent_last_name;
      let customerLastName = data.customer_last_name;
      let meetingTime = "○○時";
      if(data.first_meeting_time != null){
        meetingTime = data.first_meeting_time.slice(0, -3);
      }
      // let agentPhone = data.agent_phone;
      let signature = data.agent_signature.replace(/\n/g,"<br>");

      let subject = `【キャリア面談のご案内】株式会社アサイン${agentLastName}`;
      // タイトルは特別に文字コード変換が必要
      subject = Buffer.from(subject, "utf-8").toString("base64");
      let body = `${customerLastName}様<br><br>
                  お世話になっております。<br>
                  株式会社アサイン・シニアエージェントの${agentLastName}でございます。<br><br>
                  
                  この度はご面談の日程調整をしていただきまして、ありがとうございました。<br><br>
                  
                  弊社ではキャリアを「点」ではなく「線」で捉え、<br>
                  足元の転職だけではなく、${customerLastName}様の目指す姿から逆算した、<br>
                  長期的なキャリア形成のサポートをさせていただいております。<br>
                  ご面談当日は、${customerLastName}様の価値観を軸にキャリアを考えていければと思います。<br><br><br>
                  
                  
                  また、もし既に作成された履歴書・職務経歴書がございましたら、<br>
                  下記登録フォームにて事前にご共有いただけますと幸いです。面談時に参考にさせていただきます。<br><br>
                  
                  事前のご準備は必須ではなく、<br>
                  書類作成のサポートもさせていただいておりますのでご安心ください。<br>
                  ========================================<br>
                  【履歴書・職務経歴書お持ちの場合】<br>
                  下記URLよりファイルのアップロードにご協力ください。<br>
                  ★<br>
                  【お持ちでない場合】<br>
                  下記URLよりアンケートのご回答にご協力ください。<br>
                  ★<br>
                  =======================================<br>
                  ※ご協力いただける場合は、ご面談の前日の20:00までにご回答ください。<br><br>
                  
                  当日はお話しできることを楽しみにしております。<br>
                  どうぞよろしくお願いいたします。<br><br>
                  
                  ${signature}
                  `;
      let jwtClient;
      // サービスアカウント情報の読み込み
      try{ 
        jwtClient = new google.auth.JWT(
        key.client_email,
        null,
        key.private_key,
        SCOPES,fromAddress,
        );
      }catch(e){
        console.log("error1");
        console.log(e);
      }
      
      // サービスアカウント情報を利用したクライアント認証
      try{
        await jwtClient.authorize();
      }catch(e){
        console.log("error2");
        console.log(e);
      }

      // メールの内容を設定
      let message = 
        `To:${toAddress}\r\n` +
        `From:${fromAddress}\r\n` +
        `Bcc:m_arai@a-ssign.com\r\n` +
        `Subject:=?UTF-8?b?${subject}?=\r\n` +
        `Content-Type: text/html; charset=utf-8\r\n` +
        `MIME-Version: 1.0\r\n\r\n${body}`
      ;
      let encodedMessage = Buffer.from(message, "utf-8").toString("base64");

      let res;
      try{
        if(data.mail_auto_sending === true){
          res = await sendMail(jwtClient,encodedMessage);
        }else{
          res = await makeDrafts(jwtClient,encodedMessage);
        }
      }catch(e){
        console.log("error3");
        console.log(e);
      }
      if(res === "OK"){
        done = done + 1;
      }else{
        error.push(res);
      }
    }catch(e){
      error_log.push(JSON.stringify(data) + ',' + JSON.stringify(e));
    }
  }

  // リクエスト内容
  const endpoint = 'https://chat.googleapis.com/v1/spaces/rd2d4EAAAAE/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=eD_8U5XFS3qqqI3lLbPzjnIrnVyMduliZg1TGSmG1zE%3D';
  const message = {
    text: `抽出数:${target_customer_data.select.length}\n実行数:${String(done)}\nエラーログ:${error.join(" , ")}`
  };

  // 送信
//   await axios.post(endpoint, message)
//     .then((success) => {
//       success;
//     })
//     .catch((err) => {
//       err;
//     });

  // error_logがある場合は吐き出す
  if(error_log.length){
    const insert_error_log = squel.insert()
                                  .into("ace_api_error_log")
                                  .set("agent_id", 0)
                                  .set("function", "first_meeting_reminder")
                                  .set("method", "event_bridge")
                                  .set("request", "")
                                  .set("detail", error_log.join("\n\n"))
                                  .set("page", "first_meeting_reminder")
                                  .toString();

    await rds_connect.data_api("insert", insert_error_log, rds);
  }

  const update_mail_auto_sending_false = squel.update()
                                              .table("c_supports")
                                              .set("mail_auto_sending", false)
                                              .where("mail_auto_sending = true")
                                              .toString();

  await rds_connect.data_api("update", update_mail_auto_sending_false, rds);

  return "OK";
};


// メールのドラフトを作成
async function makeDrafts(auth,Message) {
  const gmail = google.gmail({version: 'v1', auth});
  let res;
  try{
    res =  await gmail.users.drafts.create({
      userId: 'me',
      requestBody: {
        message: {
          raw: Message,
        }
      }
    });
  }catch(e){
    console.log("error4");
    console.log(e);
    res.statusText = "NG";
  }
  return res.statusText;
}

async function sendMail(auth, Message) {
  const gmail = google.gmail({version: 'v1', auth});
  let res;
  
  try{
    res = await gmail.users.messages.send({
      userId: 'me',
      resource: {
        raw: Message,
      }
    });
  }catch(e){
    console.log("error4");
    console.log(e);
    res.statusText = "NG";
  }
  return res.statusText;
}