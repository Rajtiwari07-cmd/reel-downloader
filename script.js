const API = "https://reel-downloader-a0pc.onrender.com";

const urlInput = document.getElementById("url");
const pasteBtn = document.getElementById("pasteBtn");
const previewBtn = document.getElementById("previewBtn");
const downloadBtn = document.getElementById("downloadBtn");

const preview = document.getElementById("preview");
const thumbnail = document.getElementById("thumbnail");
const videoPreview = document.getElementById("videoPreview");
const title = document.getElementById("title");

const msg = document.getElementById("msg");
const quality = document.getElementById("quality");

const progressContainer =
document.querySelector(".progress-container");

const progressBar =
document.querySelector(".progress-bar");

let currentUrl = "";

/* PASTE */

pasteBtn?.addEventListener("click", async () => {

    try {

        const text =
        await navigator.clipboard.readText();

        urlInput.value = text;

    } catch {

        msg.innerText =
        "Clipboard access denied";

    }

});

/* PREVIEW */

previewBtn?.addEventListener("click", async () => {

    const url = urlInput.value.trim();

    if (!url) {

        msg.innerText =
        "Paste Instagram URL first";

        return;
    }

    currentUrl = url;

    msg.innerText =
    "Loading preview...";

    preview.style.display = "none";

    try {

        const response =
        await fetch(
        `${API}/info?url=${encodeURIComponent(url)}`
        );

        const data =
        await response.json();

        if (!data.success) {

            msg.innerText =
            "Failed to fetch preview";

            return;
        }

        thumbnail.src = data.thumbnail;

        title.innerText =
        data.title;

        videoPreview.style.display =
        "none";

        thumbnail.style.display =
        "block";

        preview.style.display =
        "block";

        msg.innerText =
        "Preview loaded successfully";

    } catch (err) {

        console.error(err);

        msg.innerText =
        "Server error while loading preview";
    }

});

/* DOWNLOAD */

downloadBtn?.addEventListener("click", async () => {

    if (!currentUrl) {

        msg.innerText =
        "Generate preview first";

        return;
    }

    progressContainer.style.display =
    "block";

    progressBar.style.width =
    "0%";

    let progress = 0;

    const fakeProgress =
    setInterval(() => {

        if (progress < 90) {

            progress += 10;

            progressBar.style.width =
            progress + "%";
        }

    }, 300);

    try {

        const selectedQuality =
        quality.value;

        const response =
        await fetch(
        `${API}/download?url=${encodeURIComponent(currentUrl)}&quality=${selectedQuality}`
        );

        if (!response.ok) {

            throw new Error();
        }

        const blob =
        await response.blob();

        clearInterval(fakeProgress);

        progressBar.style.width =
        "100%";

        const fileUrl =
        URL.createObjectURL(blob);

        const a =
        document.createElement("a");

        a.href = fileUrl;

        a.download =
        "vynelu-video.mp4";

        document.body.appendChild(a);

        a.click();

        a.remove();

        msg.innerText =
        "Download completed";

    } catch (err) {

        clearInterval(fakeProgress);

        console.error(err);

        msg.innerText =
        "Download failed";
    }

});