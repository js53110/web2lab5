const express = require("express");
const path = require("path");
const fs = require("fs");
const httpPort = 5500;

const app = express();
app.use(express.json());

app.use(express.static(path.join(__dirname, "/")));

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "/", "index.html"));
});

const webpush = require("web-push");

let subscriptions = [];
const SUBS_FILENAME = "subscriptions.json";
try {
  subscriptions = JSON.parse(fs.readFileSync(SUBS_FILENAME));
} catch (error) {
  console.error(error);
}

app.post("/saveSubscription", function (req, res) {
  let sub = req.body.sub;
  subscriptions.push(sub);
  fs.writeFileSync(SUBS_FILENAME, JSON.stringify(subscriptions));
  res.json({
    success: true,
  });
});

app.post("/saveSnap", async function (req, res) {
  res.json({ success: true, id: req.body.id });
  await sendPushNotifications(req.body.title);
});

async function sendPushNotifications(snapTitle) {
  webpush.setVapidDetails(
    "mailto:sikiric.jakov@outlook.com",
    "BFsq-L3tzHGohdZXTraQuw2LXXSZlbWIpCAB3yTpgoOV_StMYZfeSlnzOiHzQLaZuVFnK5C1aP8t1_e36rxVfxg",
    "rJ3lmZTop--CgtqryeWkj5URG3ShAM7K6DEQBVlOxE8"
  );
  subscriptions.forEach(async (sub) => {
    try {
      await webpush.sendNotification(
        sub,
        JSON.stringify({
          title: "New snap!",
          body: "Somebody just snaped a new photo: " + snapTitle,
          redirectUrl: "/",
        })
      );
    } catch (error) {}
  });
}

app.listen(httpPort, function () {
  console.log(`HTTP listening on port: ${`http://localhost:` + httpPort}`);
});
