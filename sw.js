import { del, entries } from "./idb.keyval.js";
const staticCacheName = "site-static-v1";
const dynamicCacheName = "site-dynamic-v1";
const assets = ["/", "/index.html", "/app.js", "/fallback.html"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(staticCacheName).then((cache) => {
      console.log("Caching assets");
      cache.addAll(assets);
    })
  );
});

self.addEventListener("activate", (e) => {
  console.log("Service Worker has been activated");
  e.waitUntil(
    caches.keys().then((keys) => {
      //console.log(keys);
      return Promise.all(
        keys
          .filter((key) => key !== staticCacheName && key !== dynamicCacheName)
          .map((key) => caches.delete(key))
      );
    })
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches
      .match(e.request)
      .then((res) => {
        return (
          res ||
          fetch(e.request).then(async (fetchRes) => {
            const cache = await caches.open(dynamicCacheName);
            cache.put(e.request.url, fetchRes.clone());
            return fetchRes;
          })
        );
      })
      .catch(() => {
        if (e.request.url.indexOf(".html") > -1) {
          //ako html postoji (znaci trazimo url) onda nema index -1
          return caches.match("/fallback.html");
        }
      })
  );
});

self.addEventListener("sync", function (event) {
  console.log("Background sync!", event);
  if (event.tag === "sync-snaps") {
    event.waitUntil(syncSnaps());
  }
});

let syncSnaps = async function () {
  entries().then((entries) => {
    entries.forEach(async (entry) => {
      let snap = entry[1];
      let title = snap.title;
      let id = snap.id;
      console.log(title);
      await fetch("/saveSnap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, id }),
      })
        .then(function (res) {
          if (res.ok) {
            res.json().then(function (data) {
              del(data.id);
            });
          } else {
            console.log(res);
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    });
  });
};

self.addEventListener("notificationclick", function (event) {
  let notification = event.notification;
  console.log("notification", notification);

  event.waitUntil(
    clients.matchAll().then(function (clis) {
      if (clis.length > 0) {
        clis.forEach((client) => {
          client.navigate(notification.data.redirectUrl);
          client.focus();
        });
      } else {
        clients.openWindow(notification.data.redirectUrl);
      }

      notification.close();
    })
  );
});

self.addEventListener("notificationclose", function (event) {
  console.log("notificationclose", event);
});

self.addEventListener("push", function (event) {
  console.log("push event", event);

  var data = { title: "title", body: "body", redirectUrl: "/" };

  if (event.data) {
    data = JSON.parse(event.data.text());
  }

  var options = {
    body: data.body,
    icon: "assets/img/android/android-launchericon-96-96.png",
    badge: "assets/img/android/android-launchericon-96-96.png",
    vibrate: [200, 100, 200, 100, 200, 100, 200],
    data: {
      redirectUrl: data.redirectUrl,
    },
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});
