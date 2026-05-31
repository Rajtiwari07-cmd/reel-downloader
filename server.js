const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

/* =========================
   HOME ROUTE
========================= */
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

/* =========================
   DOWNLOAD FOLDER
========================= */
const downloadFolder = path.join(__dirname, "downloads");
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

    // -j extracts metadata without enforcing video formats
    const command = `yt-dlp -j "${url}"`;

    console.log("Fetching info...");
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.log(stderr);
            return res.status(500).json({
                success: false,
                error: "Failed to fetch media info"
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
   DOWNLOAD MEDIA (REELS & IMAGES)
========================= */
app.get("/download", (req, res) => {
    const url = req.query.url;

    if (!url) {
        return res.status(400).send("No URL provided");
    }

    // BEFORE running the download command, we clear old files in the download folder 
    // to prevent mixing up files if multiple downloads happen concurrently.
    try {
        const oldFiles = fs.readdirSync(downloadFolder);
        for (const file of oldFiles) {
            fs.unlinkSync(path.join(downloadFolder, file));
        }
    } catch (err) {
        console.log("Error clearing directory:", err);
    }

    // Removed strict video configurations so yt-dlp grabs images OR videos seamlessly
    const command = `yt-dlp --no-playlist --no-warnings -o "${downloadFolder}/%(title)s.%(ext)s" "${url}"`;

    console.log("Downloading from URL:", url);
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.log("Execution error:", error);
            return res.status(500).send(stderr || "Download execution failed");
        }

        const files = fs.readdirSync(downloadFolder);
        if (files.length === 0) {
            return res.status(500).send("No file found down on disk");
        }

        // Target the newest file added to the directory
        const latestFile = files
            .map(file => ({
                name: file,
                time: fs.statSync(path.join(downloadFolder, file)).mtime.getTime()
            }))
            .sort((a, b) => b.time - a.time)[0];

        const filePath = path.join(downloadFolder, latestFile.name);
        console.log("Sending file back to client:", latestFile.name);

        // Express automatically parses content-type header context based on file extension (.mp4, .jpg, .webp etc)
        res.download(filePath, latestFile.name, (err) => {
            if (err) {
                console.log("Error during delivery download transfer:", err);
            }
            // Cleanup file from Render server storage after delivery completes
            try {
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            } catch (cleanupErr) {
                console.log("Cleanup error:", cleanupErr);
            }
        });
    });
});

/* =========================
   START SERVER
========================= */
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});