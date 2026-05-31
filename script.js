const input = document.getElementById("url");
const button = document.getElementById("downloadBtn");
const status = document.getElementById("status");

button.addEventListener("click", async () => {
    const url = input.value.trim();

    if (!url) {
        status.innerText = "Paste Instagram link first";
        return;
    }

    status.innerText = "Loading... Please wait.";

    try {
        // CHANGED: Removed 'http://localhost:3000' so it uses relative routing. 
        // This makes it work perfectly on Render deployment as well as local machines.
        const response = await fetch(`/download?url=${encodeURIComponent(url)}`);

        if (!response.ok) {
            throw new Error("Server error handling media conversion");
        }

        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");

        const contentDisposition = response.headers.get("content-disposition");
        let filename = "instagram-media"; // fallback name

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
        status.innerText = "Failed to download media. Ensure URL is correct.";
    }
});