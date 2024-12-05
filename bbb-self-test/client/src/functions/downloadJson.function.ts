export const downloadJson = (jsonObject: object) => {
    const downloadNode = document.createElement('a');
    downloadNode.download = "bbb-checks.json";
    downloadNode.href =  "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jsonObject));
    downloadNode.click();
}