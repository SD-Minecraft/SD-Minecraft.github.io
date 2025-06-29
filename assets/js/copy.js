function Copy() {
    navigator.clipboard.writeText("play.sdminecraft.net");
    document.getElementById("copytext").innerText="Copied!";

    setTimeout(() => {
        document.getElementById("copytext").innerText="Copy IP Address";
    }, "2500");

}
