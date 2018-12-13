import * as functions from "firebase-functions";
import axios from "axios";
import { Message, Result } from "./schema";
import { webhookUrl } from "./config";

const listeningChannel = "GES0KQ9PG";

export const messageRelay = functions.https.onRequest((req, res) => {
  console.log("body", req.body);
  if (
    typeof req.body.type === "string" &&
    req.body.type === "url_verification"
  ) {
    res.send(req.body.challenge);
  }
  const message: Message = req.body;
  if (message.event && message.event.text) {
    if (message.event.channel === listeningChannel) {
      postToConsumerChannel(message.event.text)
        .then(result => responder(res, { ...message, result } as Result))
        .catch(() =>
          responder(
            res,
            { error: "posting to consumer channel is failed." },
            500
          )
        );
    } else {
      responder(res, {
        ...message,
        result: "event.channel is not match to the expected channel."
      } as Result);
    }
  } else {
    responder(res, {
      ...message,
      result: "event.text is not defined in the body."
    } as Result);
  }
});

function postToConsumerChannel(text: string): Promise<string | void> {
  const whoToMention = `<!channel> `;
  const template = `${whoToMention} (メッセージを転送しました)`;
  const message = `${template}\n${text}`;
  return axios
    .post(webhookUrl, { text: message })
    .then(() => "ok")
    .catch(console.error);
}

function responder(
  res: functions.Response,
  obj: any,
  status: number = 200
): void {
  console.log("response", obj);
  res.status(status).send(obj);
}
