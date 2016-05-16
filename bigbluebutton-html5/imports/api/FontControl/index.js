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

export default FontControl;
