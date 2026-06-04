const input = document.getElementById("url");
const button = document.getElementById("downloadBtn");
const status = document.getElementById("status");

button.addEventListener("click", async () => {

    const url = input.value.trim();

    if (!url) {
        status.innerText = "Paste Instagram link first";
        return;
    }

    status.innerText = "Loading...";

    try {

        const response = await fetch(
            `http://localhost:3000/download?url=${encodeURIComponent(url)}`
        );

        if (!response.ok) {
            throw new Error("Server Error");
        }

        const blob = await response.blob();

        const downloadUrl = window.URL.createObjectURL(blob);

        const a = document.createElement("a");

        const contentDisposition =
            response.headers.get("content-disposition");

        let filename = "instagram-media";

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

        status.innerText = "Download complete";

    } catch (err) {

        console.error(err);

        status.innerText = "Server Error";

    }

});