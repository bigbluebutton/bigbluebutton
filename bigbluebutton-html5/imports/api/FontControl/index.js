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

  static applyFontSize() {
    const size = FontControl.fontSizeEnum.properties[this.state.currentFontSize].size;
    document.getElementsByTagName('html')[0].style.fontSize = size;
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

  static storeFontSize(fs) {
    localStorage.setItem('bbbFontSize', fs);
    this.setState({ currentFontSize: fs }, function () {
      FontControl.applyFontSize.call(this);
    });
  }

  static getFontSizeName() {
    return FontControl.fontSizeEnum.properties[this.state.currentFontSize].name;
  }

  static increaseFontSize() {
    const fs = Math.min(this.state.currentFontSize + 1, FontControl.fontSizeEnum.EXTRA_LARGE);
    FontControl.storeFontSize.call(this, fs);
  };

  static decreaseFontSize() {
    const fs = Math.max(this.state.currentFontSize - 1, FontControl.fontSizeEnum.EXTRA_SMALL);
    FontControl.storeFontSize.call(this, fs);
  };
};



export function getFontSizeName (s) {
  let fontName = '';
  console.log("the state of current FS for getting the name : ->>>>");

  switch (s){
    case 1:
      fontName = 'Extra Small';
      break;
    case 2:
      fontName = 'Small';
      break;
    case 3:
      fontName = 'Medium';
      break;
    case 4:
      fontName = 'Large';
      break;
    case 5:
      fontName = 'Extra Large';
      break;
  }
  return fontName;
};

export function getFontSizePixels () {
  let size = '';
  switch (this.state.currentFontSize){
    case 1:
      size = '12px';
      break;
    case 2:
      size = '14px';
      break;
    case 3:
      size = '16px';
      break;
    case 4:
      size = '18px';
      break;
    case 5:
      size = '20px';
      break;
    default:
      break;
  }
  return size;
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
