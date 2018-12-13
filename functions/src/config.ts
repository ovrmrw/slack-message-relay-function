import * as functions from "firebase-functions";

export const webhookUrl = functions.config().slack.webhookurl;
