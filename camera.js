let inputImage = document.getElementById("fileInput")
        let image;
        let cameraAvailable = true;
        
        inputImage.addEventListener("change", async (e)=>{
        image = inputImage.files[0]
        inputImage.value = ""
        image = await fileToImage(image)
        document.getElementById("btnSnap").click()
        })

        function fileToImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function (event) {
            const img = new Image();
            img.src = event.target.result;

            img.onload = function () {
                resolve(img);
            };

            img.onerror = function (error) {
                reject(error);
            };
        };

        reader.onerror = function (error) {
            reject(error);
        };

        // Read the file as a data URL
        reader.readAsDataURL(file);
    });
}
       
        import {
                get,
                set,
            } from "https://cdn.jsdelivr.net/npm/idb-keyval@6/+esm";

            let player = document.getElementById("player");
            let canvas = document.getElementById("cnvFood");
            let beforeSnap = document.getElementById("beforeSnap");
            let afterSnap = document.getElementById("afterSnap");
            let snapName = document.getElementById("snapName");
            let startCapture = function () {                
                beforeSnap.classList.remove("d-none");
                beforeSnap.classList.add("d-flex", "flex-column", "align-items-center");
                afterSnap.classList.remove("d-flex", "flex-column", "align-items-center");
                afterSnap.classList.add("d-none");
                if (!("mediaDevices" in navigator)) {
                    // fallback to file upload button, ili sl.
                    // vidjet i custom API-je: webkitGetUserMedia i mozGetUserMedia
                    cameraAvailable = false;
                    document.getElementById("btnSnap").style.display = "none"


                } else {
                    navigator.mediaDevices
                        .getUserMedia({ video: true, audio: false })
                        .then((stream) => {
                            player.srcObject = stream;
                        })
                        .catch((err) => {
                            let titleHeader = document.getElementById("titleHeader")
                            titleHeader.innerHTML = "Cam not working, upload img"
                            cameraAvailable = false;
                            inputImage.style.display = "block"
                            document.getElementById("btnSnap").style.display = "none"

                            //console.log(err);
                        });
                }
            };
            startCapture();
            let stopCapture = function () {
                afterSnap.classList.remove("d-none");
                afterSnap.classList.add("d-flex", "flex-column", "align-items-center");
                beforeSnap.classList.remove("d-flex", "flex-column", "align-items-center");
                beforeSnap.classList.add("d-none");
                if(cameraAvailable){
                    player.srcObject.getVideoTracks().forEach(function (track) {
                    track.stop();
                });
                }
               
            }
            document
                .getElementById("btnSnap")
                .addEventListener("click", function (event) {
                    canvas.width = player.getBoundingClientRect().width;
                    canvas.height = player.getBoundingClientRect().height;                    
                    canvas
                        .getContext("2d")
                        .drawImage(cameraAvailable ? player : image, 0, 0, canvas.width, canvas.height);
                       stopCapture();
                });
            document
                .getElementById("btnUpload")
                .addEventListener("click", function (event) {
                    event.preventDefault();
                    if (!snapName.value.trim()) {
                        alert("Give it a cathcy name!");
                        return false;
                    }
                    if (
                        "serviceWorker" in navigator &&
                        "SyncManager" in window
                    ) {
                        let url = canvas.toDataURL();
                        fetch(url)
                            .then((res) => res.blob())
                            .then((blob) => {
                                let ts = new Date().toISOString();
                                let id = ts + snapName.value.replace(/\s/g, '_');  // ws->_
                                set(id, {
                                    id,
                                    ts,
                                    title: snapName.value,
                                    image: blob
                                });
                                return navigator.serviceWorker.ready;
                            })
                            .then((swRegistration) => {
                                return swRegistration.sync.register(
                                    "sync-snaps"
                                );
                            })
                            .then(() => {
                                console.log("Queued for sync");
                                startCapture();
                            })
                            .catch((err) => {
                                console.log(error);
                            });
                    } else {
                        alert("TODO - vaš preglednik ne podržava bckg sync...");
                    }
                });