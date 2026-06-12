const API =
"https://reel-downloader-a0pc.onrender.com";

const urlInput =
document.getElementById("url");

const pasteBtn =
document.getElementById("pasteBtn");

const previewBtn =
document.getElementById("previewBtn");

const downloadBtn =
document.getElementById("downloadBtn");

const preview =
document.getElementById("preview");

const thumbnail =
document.getElementById("thumbnail");

const title =
document.getElementById("title");

const msg =
document.getElementById("msg");

let currentUrl = "";

pasteBtn.addEventListener(
"click",
async () => {

try {

const text =
await navigator.clipboard.readText();

urlInput.value = text;

} catch {

alert(
"Clipboard access denied"
);

}

}
);

previewBtn.addEventListener(
"click",
async () => {

const url =
urlInput.value.trim();

if (!url) {

msg.innerText =
"Paste a Reel URL";

return;

}

currentUrl = url;

msg.innerText =
"Loading preview...";

preview.style.display =
"none";

try {

const response =
await fetch(
"${API}/info?url=${encodeURIComponent(url)}"
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

preview.style.display =
"block";

msg.innerText =
"Preview loaded";

} catch (err) {

console.log(err);

msg.innerText =
"Server error";

}

}
);

downloadBtn.addEventListener(
"click",
async () => {

if (!currentUrl) {

msg.innerText =
"Generate preview first";

return;

}

try {

const response =
await fetch(
"${API}/download?url=${encodeURIComponent(currentUrl)}"
);

if (!response.ok) {

throw new Error();

}

const blob =
await response.blob();

const fileUrl =
URL.createObjectURL(blob);

const a =
document.createElement("a");

a.href = fileUrl;

a.download =
"instagram-reel.mp4";

document.body.appendChild(a);

a.click();

a.remove();

msg.innerText =
"Download complete";

} catch (err) {

console.log(err);

msg.innerText =
"Download failed";

}

}
);