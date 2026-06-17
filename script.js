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

}

catch {

msg.innerText =
"Clipboard access denied";

}

});


/* GENERATE PREVIEW */

previewBtn?.addEventListener("click", async () => {

const url =
urlInput.value.trim();


if(!url){

msg.innerText =
"Paste Instagram URL";

return;

}


currentUrl = url;


msg.innerText =
"Loading preview...";


preview.style.display =
"none";


try{


const response =
await fetch(
`${API}/info?url=${encodeURIComponent(url)}`
);


const data =
await response.json();



if(!data.success){

msg.innerText =
"Preview failed";

return;

}



thumbnail.src =
"https://images.weserv.nl/?url=" +
encodeURIComponent(
data.thumbnail.replace(/^https?:\/\//,"")
);



thumbnail.style.display =
"block";


videoPreview.style.display =
"none";


title.innerText =
data.title;



preview.style.display =
"block";


msg.innerText =
"Preview loaded successfully";



}

catch(err){

console.log(err);

msg.innerText =
"Server error";

}


});



/* DOWNLOAD */


downloadBtn?.addEventListener("click", async()=>{


if(!currentUrl){

msg.innerText =
"Generate preview first";

return;

}



progressContainer.style.display =
"block";


progressBar.style.width =
"0%";



let progress=0;


const timer =
setInterval(()=>{


if(progress<90){

progress +=10;

progressBar.style.width =
progress+"%";

}


},300);



try{


const response =
await fetch(
`${API}/download?url=${encodeURIComponent(currentUrl)}`
);



const blob =
await response.blob();



clearInterval(timer);


progressBar.style.width =
"100%";



const videoURL =
URL.createObjectURL(blob);





/* SHOW VIDEO PLAYER */

videoPreview.src =
videoURL;


videoPreview.style.display =
"block";


thumbnail.style.display =
"none";


videoPreview.play();





/* DOWNLOAD FILE */

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


catch(err){

clearInterval(timer);

console.log(err);

msg.innerText =
"Download failed";

}



});