
const TITLE_WITH_VIEW = 3;

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

export const convertRemToPixels = (rem) => {
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

export default {
  registerTitleView,
  unregisterTitleView,
  convertRemToPixels,
};
