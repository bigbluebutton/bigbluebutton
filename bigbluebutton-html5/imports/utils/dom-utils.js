
const TITLE_WITH_VIEW = 3;

const getTitleData = () => {
    const title = document.getElementsByTagName('title')[0];
    return  { title, data: title?.text?.split(' - ') };
}

export const registerTitleView = (v) => {
    const { title, data } = getTitleData();
    if (data) {
        if (data.length < TITLE_WITH_VIEW) data.push(`${v}`);
        else data.splice(TITLE_WITH_VIEW - 1, TITLE_WITH_VIEW, v);
    }
    if (title) title.text = data.join(' - ');
};

export const unregisterTitleView = () => {
    const { title, data } = getTitleData();
    if (data && data.length === TITLE_WITH_VIEW) {
        data.splice(TITLE_WITH_VIEW - 1, TITLE_WITH_VIEW, 'Default');
    }
    if (title) title.text = data.join(' - ');
};

export const convertRemToPixels = (rem) => {
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

// The per-request CSP nonce nginx injects into this document (see the csp-nonce
// meta tag in client/main.html). Scripts created dynamically (e.g. third-party
// plugin entrypoints) must carry it to be admitted by the policy's script-src.
export const getCspNonce = () => {
  const meta = document.querySelector('meta[name="csp-nonce"]');
  return meta ? meta.content : '';
};

export default {
  registerTitleView,
  unregisterTitleView,
  convertRemToPixels,
  getCspNonce,
};
