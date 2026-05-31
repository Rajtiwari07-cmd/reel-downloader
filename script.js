const input = document.getElementById("url");
const button = document.getElementById("downloadBtn");
const status = document.getElementById("status");

button.addEventListener("click", async () => {
    const url = input.value.trim();

    if (!url) {
        status.innerText = "Paste Instagram link first";
        return;
    }

    status.innerText = "Processing media link...";

    // Step 1: Attempt to grab info safely without letting it crash the script
    try {
        const infoResponse = await fetch(`/info?url=${encodeURIComponent(url)}`);
        if (infoResponse.ok) {
            const infoData = await infoResponse.json();
            console.log("Media metadata loaded successfully:", infoData.title);
        }
    } catch (infoErr) {
        console.log("Preview step skipped or timed out, jumping straight to downloader.");
    }

    // Step 2: Proceed immediately to the core download route
    status.innerText = "Downloading... Please wait.";

    try {
        // Relative routing used here so it functions properly on Render deployment as well as localhost
        const response = await fetch(`/download?url=${encodeURIComponent(url)}`);

        if (!response.ok) {
            throw new Error("Server error processing media download file");
        }

        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");

        const contentDisposition = response.headers.get("content-disposition");
        let filename = "instagram-media"; // Default backup filename

        if (contentDisposition) {
            const match = contentDisposition.match(/filename="(.+)"/);
            if (match && match[1]) {
                filename = match[1];
            }
        }

        a.href = downloadUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();

        window.URL.revokeObjectURL(downloadUrl);
        status.innerText = "Download complete!";
    } catch (err) {
        console.error("Frontend Downloader Error:", err);
        status.innerText = "Download failed. Check link or try a different post.";
    }
});