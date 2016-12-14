class FontControl {
  static get fontSizeEnum() {
    return {
      EXTRA_SMALL: 1,
      SMALL: 2,
      MEDIUM: 3,
      LARGE: 4,
      EXTRA_LARGE: 5,

      properties: {
        1: { size: '12px', name: 'Extra Small' },
        2: { size: '14px', name: 'Small' },
        3: { size: '16px', name: 'Medium' },
        4: { size: '18px', name: 'Large' },
        5: { size: '20px', name: 'Extra Large' },
      },
    };
  }

  static loadFontSize() {
    const existingFontSize = localStorage.getItem('bbbFontSize');
    let newFontSize = null;
    if (existingFontSize &&
      existingFontSize >= _this.fontSizeEnum.EXTRA_SMALL &&
      existingFontSize <= _this.fontSizeEnum.EXTRA_LARGE) {
      newFontSize = existingFontSize;
    } else {
      newFontSize = FontControl.fontSizeEnum.MEDIUM;
    }

    FontControl.storeFontSize.call(this, newFontSize);
  }
};

export function getFontSizeName () {
  return FontControl.fontSizeEnum.properties[this.state.currentFontSize].name;
};

export function getFontSizePixels () {
  return FontControl.fontSizeEnum.properties[this.state.currentFontSize].size;
};

function applyFontSize() {
  const size = FontControl.fontSizeEnum.properties[this.state.currentFontSize].size;
  console.log('applying fontsize = {' + size + '} to the app');
  document.getElementsByTagName('html')[0].style.fontSize = size;
}

function storeFontSize(fs) {
  console.log('saving bbbFontSize = {' + fs + '}');
  localStorage.setItem('bbbFontSize', fs);
  this.setState({ currentFontSize: fs }, function () {
    applyFontSize.call(this);
  });
}

export function increaseFontSize() {
  console.log('value to increase: ' + this.state.currentFontSize);
  let fs = ( this.state.currentFontSize < 5) ? ++this.state.currentFontSize : 5;
  console.log('increased to     : ' + fs);
  storeFontSize.call(this, fs);
};

export function decreaseFontSize() {
  console.log('value to decrease: ' + this.state.currentFontSize);
  let fs = ( this.state.currentFontSize > 1) ? --this.state.currentFontSize : 1;
  console.log('decreased to     : ' + fs);
  storeFontSize.call(this, fs);
};


export default FontControl;
