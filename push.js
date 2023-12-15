let btnNotif = document.getElementById("subID");
if ("Notification" in window && "serviceWorker" in navigator) {
  btnNotif.addEventListener("click", function () {
    Notification.requestPermission(async function (res) {
      console.log("Request permission result:", res);
      if (res === "granted") {
        console.log("Allowing notifications");
        await setupPushSubscription();
      } else {
        console.log("User denied push notifs:", res);
      }
    });
  });
} else {
  btnNotif.setAttribute("disabled", "");
  btnNotif.classList.add("btn-outline-danger");
}

function urlBase64ToUint8Array(base64String) {
  var padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  var base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");

  var rawData = window.atob(base64);
  var outputArray = new Uint8Array(rawData.length);

  for (var i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function setupPushSubscription() {
  try {
    let reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();

    if (sub === null) {
      var publicKey =
        "BFsq-L3tzHGohdZXTraQuw2LXXSZlbWIpCAB3yTpgoOV_StMYZfeSlnzOiHzQLaZuVFnK5C1aP8t1_e36rxVfxg";
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      // Using fetch with async/await
      const res = await fetch("/saveSubscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ sub }),
      });

      if (res.ok) {
        const result = await res.json(); // Assuming the response is JSON
        alert(
          "Yay, subscription generated and saved:\n" + JSON.stringify(result)
        );
      } else {
        alert("Failed to save subscription");
      }
    } else {
      alert("You are already subscribed:\n\n\n" + JSON.stringify(sub));
    }
  } catch (error) {
    console.log(error);
  }
}
