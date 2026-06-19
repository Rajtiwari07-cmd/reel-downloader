const express = require("express");
const cors = require("cors");
const { exec, spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(cors());

app.use(express.json());

app.use(express.static(__dirname));
let downloadProgress = 0;

app.get("/progress", (req, res) => {

    res.json({
        progress: downloadProgress
    });

});

const downloadFolder =
    path.join(__dirname, "downloads");

if (!fs.existsSync(downloadFolder)) {

    fs.mkdirSync(downloadFolder);
}

/* =========================
   FETCH MEDIA INFO
========================= */

app.get("/info", (req, res) => {

    const url = req.query.url;

    if (!url) {

        return res.status(400).json({
            success: false,
            error: "No URL provided"
        });
    }

    const command = `yt-dlp -j "${url}"`;

    console.log("Fetching info:");
    console.log(command);

    exec(command, (error, stdout, stderr) => {

      if (error) {

    console.log("YT-DLP ERROR:");
    console.log(stderr);

    return res.json({
        success: true,
        title: "Instagram Reel",
        thumbnail: "",
        webpage_url: url
    });
}

        try {

            const data = JSON.parse(stdout);

            res.json({
                success: true,
                title: data.title || "Instagram Media",
                thumbnail: data.thumbnail || "",
                webpage_url: data.webpage_url || url
            });

        } catch (e) {

            console.log(e);

            res.status(500).json({
                success: false,
                error: "JSON parse failed"
            });
        }

    });

});

/* =========================
   DOWNLOAD MEDIA
========================= */

app.get("/download", (req, res) => {

const url = req.query.url;
const quality = req.query.quality || "best";

if (!url) {
    return res.status(400).send("No URL provided");
}

let format = "best";

if (quality === "720") {
    format = "bestvideo[height<=720]+bestaudio/best[height<=720]";
}

if (quality === "480") {
    format = "bestvideo[height<=480]+bestaudio/best[height<=480]";
}

if (quality === "audio") {
    format = "bestaudio";
}

const command =
    `yt-dlp --no-playlist --format "${format}" -o "${downloadFolder}/%(title)s.%(ext)s" "${url}"`;

console.log(command);

downloadProgress = 0;

const yt = spawn("yt-dlp", [
    "--no-playlist",
    "--format",
    format,
    "-o",
    `${downloadFolder}/%(title)s.%(ext)s`,
    url
]);

yt.stdout.on("data", (data) => {

    const text = data.toString();

    console.log(text);

    const match = text.match(/(\d+\.\d+)%/);

    if (match) {

        downloadProgress =
            parseFloat(match[1]);

    }

});

yt.stderr.on("data", (data) => {

    console.log(data.toString());

});

yt.on("close", () => {

    downloadProgress = 100;

    const files = fs.readdirSync(downloadFolder);

    if (files.length === 0) {

        return res.status(500).send(
            "No file downloaded"
        );

    }

    const latestFile = files
        .map(file => ({
            name: file,
            time: fs.statSync(
                path.join(downloadFolder, file)
            ).mtime.getTime()
        }))
        .sort((a, b) => b.time - a.time)[0];

    const filePath =
        path.join(downloadFolder, latestFile.name);

    res.download(filePath);

});

});
app.listen(3000, () => {

    console.log(
        "Server running on http://localhost:3000"
    );

});