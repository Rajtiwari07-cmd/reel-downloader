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

    // Using --no-warnings to ensure clean JSON extraction
    const command = `yt-dlp -j --no-warnings "${url}"`;

    console.log("Fetching info...");
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.log("Info extraction failed, using fallback:", stderr);
            
            // FALLBACK: If preview fails, pass placeholder data instead of crashing
            return res.json({
                success: true,
                title: "Instagram Media",
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
            console.log("JSON Parse fallback triggered:", e);
            res.json({
                success: true,
                title: "Instagram Media",
                thumbnail: "",
                webpage_url: url
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

    // Clear old downloaded files to prevent mixing up user downloads
    try {
        const oldFiles = fs.readdirSync(downloadFolder);
        for (const file of oldFiles) {
            fs.unlinkSync(path.join(downloadFolder, file));
        }
    } catch (err) {
        console.log("Error clearing directory:", err);
    }

    // Removed strict video format locks so yt-dlp grabs images or reels dynamically
    const command = `yt-dlp --no-playlist --no-warnings -o "${downloadFolder}/%(title)s.%(ext)s" "${url}"`;

    console.log("Downloading from URL:", url);
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.log("Execution error:", error);
            return res.status(500).send(stderr || "Download execution failed");
        }

        const files = fs.readdirSync(downloadFolder);
        if (files.length === 0) {
            return res.status(500).send("No file found on disk");
        }

        // Find the most recently downloaded file
        const latestFile = files
            .map(file => ({
                name: file,
                time: fs.statSync(path.join(downloadFolder, file)).mtime.getTime()
            }))
            .sort((a, b) => b.time - a.time)[0];

        const filePath = path.join(downloadFolder, latestFile.name);
        console.log("Sending file back to client:", latestFile.name);

        // Express automatically sets content-type header based on file extension (.mp4, .jpg, etc)
        res.download(filePath, latestFile.name, (err) => {
            if (err) {
                console.log("Error during delivery transfer:", err);
            }
            // Cleanup file from Render server storage after download finishes
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