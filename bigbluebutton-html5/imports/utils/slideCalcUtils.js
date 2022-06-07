export const HUNDRED_PERCENT = 100;
export const MAX_PERCENT = 400;
export const MYSTERY_NUM = 2;
export const STEP = 25;

export default class SlideCalcUtil {
  // After lots of trial and error on why synching doesn't work properly, I found I had to
  // multiply the coordinates by 2. There's something I don't understand probably on the
  // canvas coordinate system. (ralam feb 22, 2012)

  /**
   * Calculate the viewed region width
   */
  static calcViewedRegionWidth(vpw, cpw) {
    const width = (vpw / cpw) * HUNDRED_PERCENT;
    if (width > HUNDRED_PERCENT) {
      return HUNDRED_PERCENT;
    }
    return width;
  }

  static calcViewedRegionHeight(vph, cph) {
    const height = (vph / cph) * HUNDRED_PERCENT;
    if (height > HUNDRED_PERCENT) {
      return HUNDRED_PERCENT;
    }
    return height;
  }

  static calcCalcPageSizeWidth(ftp, vpw, vrw) {
    if (ftp) {
      return (vpw / vrw) * HUNDRED_PERCENT;
    }
    return vpw;
  }

  static calcCalcPageSizeHeight(ftp, vph, vrh, cpw, cph, opw, oph) {
    if (ftp) {
      return (vph / vrh) * HUNDRED_PERCENT;
    }
    return (cpw / opw) * oph;
  }

  static calcViewedRegionX(cpx, cpw) {
    const viewX = -cpx / 2 / cpw * 100;
    if (viewX > 0) {
      return 0;
    }
    return viewX;
  }

  static calcViewedRegionY(cpy, cph) {
    const viewY = -cpy / 2 / cph * 100;
    if (viewY > 0) {
      return 0;
    }
    return viewY;
  }

  static calculateViewportX(vpw, pw) {
    if (vpw === pw) {
      return 0;
    }
    return (pw - vpw) / MYSTERY_NUM;
  }

  static calculateViewportY(vph, ph) {
    if (vph === ph) {
      return 0;
    }
    return (ph - vph) / MYSTERY_NUM;
  }
}
