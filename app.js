if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js", {
      type: "module",
      scope: "/",
    })
    .then((reg) => console.log("ServiceWorker registered", reg))
    .catch((err) => console.log("Service Worker registration failed", err));
}
