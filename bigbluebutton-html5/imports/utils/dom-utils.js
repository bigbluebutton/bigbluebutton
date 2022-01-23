
const TITLE_WITH_VIEW = 3;
const ARIA_ALERT_TIMEOUT = 3000;
const ARIA_ALERT_EXT_TIMEOUT = 15000;

const getTitleData = () => {
    const title = document.getElementsByTagName('title')[0];
    return  { title, data: title?.text?.split(' - ') };
}

export const registerTitleView = (v) => {
    const { title, data } = getTitleData();
    if (data.length < TITLE_WITH_VIEW) data.push(`${v}`);
    else data.splice(TITLE_WITH_VIEW - 1, TITLE_WITH_VIEW, v);
    title.text = data.join(' - ');
};

export const unregisterTitleView = () => {
    const { title, data } = getTitleData();
    if (data.length === TITLE_WITH_VIEW) {
        data.splice(TITLE_WITH_VIEW - 1, TITLE_WITH_VIEW, 'Default');
    }
    title.text = data.join(' - ');
};

export const alertScreenReader = (s = '') => {
    const app = document.getElementById('app');
    const ariaAlert = document.createElement("div"); 
    ariaAlert.setAttribute("id", "aria-alert"); 
    ariaAlert.setAttribute("role", "alert"); 
    ariaAlert.setAttribute("aria-hidden", false);
    ariaAlert.setAttribute("className", "sr-only");
    ariaAlert.textContent = s;
    app.appendChild(ariaAlert);

    setTimeout(() => {
        document.getElementById('aria-alert').remove();
    }, ARIA_ALERT_TIMEOUT);
};

export const politeSRAlert = (s = '') => {
    const liveArea = document.getElementById('aria-polite-alert')
    if (liveArea) liveArea.innerHTML = s;
    setTimeout(() => {
        if (liveArea) liveArea.innerHTML = '';
    }, ARIA_ALERT_EXT_TIMEOUT);
};

export default { registerTitleView, unregisterTitleView, alertScreenReader, politeSRAlert };
