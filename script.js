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
const quality =
document.getElementById("quality");

const progressContainer =
document.querySelector(".progress-container");

const progressBar =
document.querySelector(".progress-bar");

const themeBtn =
document.getElementById("themeBtn");

let currentUrl = "";

/* PASTE BUTTON */

if (pasteBtn) {

pasteBtn.addEventListener(
"click",
async () => {

try {

const text =
await navigator.clipboard.readText();

urlInput.value = text;

} catch (err) {

msg.innerText =
"Clipboard access denied";

}

});

}

/* PREVIEW */

if (previewBtn) {

previewBtn.addEventListener(
"click",
async () => {

const url =
urlInput.value.trim();

if (!url) {

msg.innerText =
"Please paste an Instagram URL";

return;

}

currentUrl = url;

msg.innerText =
"Loading preview...";

preview.style.display =
"none";

try {

const selectedQuality =
quality.value;

const response =
await fetch(
`${API}/download?url=${encodeURIComponent(currentUrl)}&quality=${selectedQuality}`
);

const data =
await response.json();

if (!data.success) {

msg.innerText =
"Failed to fetch preview";

return;

}

thumbnail.src =
"https://images.weserv.nl/?url=" +
encodeURIComponent(
data.thumbnail.replace(/^https?:\/\//, "")
);

thumbnail.onerror = () => {
    console.log("Thumbnail failed:", data.thumbnail);
};

title.innerText =
data.title || "Instagram Reel";

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

}

/* DOWNLOAD */

if (downloadBtn) {

downloadBtn.addEventListener(
"click",
async () => {

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

const response =
await fetch(
`${API}/download?url=${encodeURIComponent(currentUrl)}`
);

if (!response.ok) {

throw new Error(
"Download failed"
);

}

const blob =
await response.blob();

clearInterval(fakeProgress);

progressBar.style.width =
"100%";

const fileUrl =
window.URL.createObjectURL(blob);

const a =
document.createElement("a");

a.href = fileUrl;

a.download =
"vynelu-reel.mp4";

document.body.appendChild(a);

a.click();

a.remove();

videoPreview.src =
fileUrl;

videoPreview.style.display =
"block";

thumbnail.style.display =
"none";

msg.innerText =
"Download completed";

} catch (err) {

clearInterval(fakeProgress);

console.error(err);

msg.innerText =
"Download failed";

}

});

}

/* DARK MODE */

if (themeBtn) {

themeBtn.addEventListener(
"click",
() => {

document.body.classList.toggle(
"dark-mode"
);

}
);

}