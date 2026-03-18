if (localStorage.getItem("settings") == undefined) {
    let defaultSettings = { boardAnimations: "medium", pathPlayback: "medium" };
    localStorage.setItem("settings", JSON.stringify(defaultSettings));
}
if (localStorage.getItem("boards") == undefined) {
    localStorage.setItem("boards", JSON.stringify({}));
}
if (localStorage.getItem("configurations") == undefined) {
    localStorage.setItem("configurations", JSON.stringify([]));
}

