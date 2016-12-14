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
};

export function revertFontState(fs){
  localStorage.getItem('bbbSavedFontSize', fs);
  if(fs){
    this.setState({ currentFontSize: fs }, function () {
      applyFontSize.call(this);
    });
  }else{
    this.setState({ currentFontSize: 3 }, function () {
      applyFontSize.call(this);
    });
  }
}

export function saveFontState(fs) {
  localStorage.setItem('bbbSavedFontSize', fs);
  this.setState({ currentFontSize: fs }, function () {
    applyFontSize.call(this);
  });
};

export function getFontSizeName() {
  return FontControl.fontSizeEnum.properties[this.state.currentFontSize].name;
};

function applyFontSize() {
  const size = FontControl.fontSizeEnum.properties[this.state.currentFontSize].size;
  document.getElementsByTagName('html')[0].style.fontSize = size;
}

function storeFontSize(fs) {
  localStorage.setItem('bbbFontSize', fs);
  this.setState({ currentFontSize: fs }, function () {
    applyFontSize.call(this);
  });
}

export function increaseFontSize() {
  let fs = ( this.state.currentFontSize < 5) ? ++this.state.currentFontSize : 5;
  storeFontSize.call(this, fs);
};

export function decreaseFontSize() {
  let fs = ( this.state.currentFontSize > 1) ? --this.state.currentFontSize : 1;
  storeFontSize.call(this, fs);
};

export default FontControl;
