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
const loader = document.getElementById("loader");

const progressContainer =
document.querySelector(".progress-container");

const progressBar =
document.querySelector(".progress-bar");

const progressCircle =
document.getElementById("progressCircle");

const progressPercent =
document.getElementById("progressPercent");

let currentUrl = "";

/* =================
   PASTE BUTTON
================= */

pasteBtn?.addEventListener(
"click",
async () => {

try {

const text =
await navigator.clipboard.readText();

urlInput.value =
text;

}

catch {

msg.innerText =
"Clipboard access denied";

}

});

/* =================
   PREVIEW
================= */

previewBtn?.addEventListener(
"click",
async () => {

const url =
urlInput.value.trim();

if (!url) {

msg.innerText =
"Paste Instagram URL";

return;

}

currentUrl = url;

if (loader) {

loader.style.display =
"block";

}

msg.innerText = "";

preview.style.display =
"none";

try {

const response =
await fetch(
`${API}/info?url=${encodeURIComponent(url)}`
);

const data =
await response.json();

if (!data.success) {

if (loader) {

loader.style.display =
"none";

}

msg.innerText =
"Preview failed";

return;

}

thumbnail.src =
"https://images.weserv.nl/?url=" +
encodeURIComponent(
data.thumbnail.replace(/^https?:\/\//, "")
);

thumbnail.style.display =
"block";

videoPreview.style.display =
"none";

title.innerText =
data.title ||
"Instagram Reel";

preview.style.display =
"block";

if (loader) {

loader.style.display =
"none";

}

msg.innerText =
"Preview loaded successfully";

}

catch (err) {

console.log(err);

if (loader) {

loader.style.display =
"none";

}

msg.innerText =
"Server error";

}

});

/* =================
   DOWNLOAD
================= */

downloadBtn?.addEventListener(
"click",
async () => {

if (!currentUrl) {

msg.innerText =
"Generate preview first";

return;

}

if (progressContainer) {

progressContainer.style.display =
"block";

}

if (progressBar) {

progressBar.style.width =
"0%";

}

if (progressCircle) {

progressCircle.style.display =
"flex";

}

if (progressPercent) {

progressPercent.innerText =
"0%";

}

let progress = 0;

const timer =
setInterval(() => {

if (progress < 95) {

progress +=
Math.floor(Math.random() * 7) + 1;

if (progress > 95) {

progress = 95;

}

if (progressBar) {

progressBar.style.width =
progress + "%";

}

if (progressPercent) {

progressPercent.innerText =
progress + "%";

}

}

}, 400);

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

clearInterval(timer);

if (progressBar) {

progressBar.style.width =
"100%";

}

if (progressPercent) {

progressPercent.innerText =
"100%";

}

setTimeout(() => {

if (progressCircle) {

progressCircle.style.display =
"none";

}

}, 1000);

const videoURL =
URL.createObjectURL(blob);

/* SHOW VIDEO */

videoPreview.src =
videoURL;

videoPreview.style.display =
"block";

thumbnail.style.display =
"none";

videoPreview.play();

/* SAVE FILE */

const a =
document.createElement("a");

a.href =
videoURL;

a.download =
"vynelu-reel.mp4";

document.body.appendChild(a);

a.click();

a.remove();

msg.innerText =
"Download completed";

}

catch (err) {

clearInterval(timer);

if (progressCircle) {

progressCircle.style.display =
"none";

}

console.log(err);

msg.innerText =
"Download failed";

}

});