import SlideCalcUtil from './slideCalcUtils';

const MAX_ZOOM_PERCENT = 400;
const HUNDRED_PERCENT = 100;
const MYSTERY_NUM = 2;

export default class SlideViewModel {
  // private static const LOGGER:ILogger = getClassLogger(SlideViewModel);

  constructor(vw, vh, sw, sh) {
    this.viewportX = 0;
    this.viewportY = 0;
    this.viewportW = vw;
    this.viewportH = vh;

    this.loaderW = 0;
    this.loaderH = 0;
    this.loaderX = 0;
    this.loaderY = 0;

    this.viewedRegionX = 0;
    this.viewedRegionY = 0;
    this.viewedRegionW = HUNDRED_PERCENT;
    this.viewedRegionH = HUNDRED_PERCENT;

    this.pageOrigW = sw;
    this.pageOrigH = sh;
    this.calcPageW = 0;
    this.calcPageH = 0;
    this.calcPageX = 0;
    this.calcPageY = 0;
    this.parentW = vw;
    this.parentH = vh;

    this.fitToPage = true;

    // After lots of trial and error on why synching doesn't work properly, I found I had to
    // multiply the coordinates by 2. There's something I don't understand probably on the
    // canvas coordinate system. (ralam feb 22, 2012)
  }

  isPortraitDoc() {
    return this.pageOrigH > this.pageOrigW;
  }

  reset(pageWidth, pageHeight) {
    this.pageOrigW = pageWidth;
    this.pageOrigH = pageHeight;
  }

  resetForNewSlide(pageWidth, pageHeight) {
    this.pageOrigW = pageWidth;
    this.pageOrigH = pageHeight;
  }
  // Not used into class
  // parentChange(parentW, parentH) {
  //   this.viewportW = this.parentW = parentW;
  //   this.viewportH = this.parentH = parentH;
  // }

  calculateViewportXY() {
    this.viewportX = SlideCalcUtil.calculateViewportX(this.viewportW, this.parentW);
    this.viewportY = SlideCalcUtil.calculateViewportY(this.viewportH, this.parentH);
  }

  calcViewedRegion() {
    this.viewedRegionW = SlideCalcUtil.calcViewedRegionWidth(this.viewportW, this.calcPageW);
    this.viewedRegionH = SlideCalcUtil.calcViewedRegionHeight(this.viewportH, this.calcPageH);
    this.viewedRegionX = SlideCalcUtil.calcViewedRegionX(this.calcPageX, this.calcPageW);
    this.viewedRegionY = SlideCalcUtil.calcViewedRegionY(this.calcPageY, this.calcPageH);
  }

  displayPresenterView() {
    this.loaderX = Math.round(this.calcPageX);
    this.loaderY = Math.round(this.calcPageY);
    this.loaderW = Math.round(this.calcPageW);
    this.loaderH = Math.round(this.calcPageH);
  }

  adjustSlideAfterParentResized() {
    if (this.fitToPage) {
      this.calculateViewportNeededForRegion(this.viewedRegionW, this.viewedRegionH);
      this.displayViewerRegion(this.viewedRegionX, this.viewedRegionY, this.viewedRegionW, this.viewedRegionH);
      this.calculateViewportXY();
      this.displayPresenterView();
      this.printViewedRegion();
    } else {
      this.calculateViewportSize();
      this.calculateViewportXY();
      this.calcPageW = (this.viewportW / this.viewedRegionW) * HUNDRED_PERCENT;
      this.calcPageH = (this.pageOrigH / this.pageOrigW) * this.calcPageW;
      this.calcViewedRegion();
      this.doBoundsValidation();
    }
  }

  switchToFitToPage(ftp) {
    // LOGGER.debug("switchToFitToPage");

    this.fitToPage = ftp;

    this.saveViewedRegion(0, 0, 100, 100);

    this.calculateViewportSize();
    this.calculateViewportXY();
  }

  doWidthBoundsDetection() {
    if (this.calcPageX >= 0) {
      // Don't let the left edge move inside the view.
      this.calcPageX = 0;
    } else if ((this.calcPageW + this.calcPageX * MYSTERY_NUM) < this.viewportW) {
      // Don't let the right edge move inside the view.
      this.calcPageX = (this.viewportW - this.calcPageW) / MYSTERY_NUM;
    } else {
      // Let the move happen.
    }
  }

  doHeightBoundsDetection() {
    if (this.calcPageY >= 0) {
      // Don't let the top edge move into the view.
      this.calcPageY = 0;
    } else if ((this.calcPageH + this.calcPageY * MYSTERY_NUM) < this.viewportH) {
      // Don't let the bottome edge move into the view.
      this.calcPageY = (this.viewportH - this.calcPageH) / MYSTERY_NUM;
    } else {
      // Let the move happen.
    }
  }

  doBoundsValidation() {
    this.doWidthBoundsDetection();
    this.doHeightBoundsDetection();
  }

  /** Returns whether or not the page actually moved */
  onMove(deltaX, deltaY) {
    const oldX = this.calcPageX;
    const oldY = this.calcPageY;

    this.calcPageX += deltaX / MYSTERY_NUM;
    this.calcPageY += deltaY / MYSTERY_NUM;

    this.doBoundsValidation();

    if (oldX != this.calcPageX || oldY != this.calcPageY) {
      this.calcViewedRegion();
      return true;
    }
    return false;
  }

  calculateViewportSize() {
    this.viewportW = this.parentW;
    this.viewportH = this.parentH;

    /*
    * For some reason when the viewport values are both whole numbers the clipping doesn't 
    * function. When the second part of the width/height pair is rounded up and then 
    * reduced by 0.5 the clipping always seems to happen. This was a long standing, bug 
    * and if you try to remove the Math.ceil and "-0.5" you better know what you're doing.
    *             - Chad (Aug 30, 2017)
    */

    if (this.fitToPage) {
      // If the height is smaller than the width, we use the height as the base to determine the size of the slide.
      if (this.parentH < this.parentW) {
        this.viewportH = this.parentH;
        this.viewportW = Math.ceil((this.pageOrigW * this.viewportH) / this.pageOrigH) - 0.5;
        if (this.parentW < this.viewportW) {
          this.viewportW = this.parentW;
          this.viewportH = Math.ceil((this.pageOrigH * this.viewportW) / this.pageOrigW) - 0.5;
        }
      } else {
        this.viewportW = this.parentW;
        this.viewportH = Math.ceil((this.viewportW / this.pageOrigW) * this.pageOrigH) - 0.5;
        if (this.parentH < this.viewportH) {
          this.viewportH = this.parentH;
          this.viewportW = Math.ceil((this.pageOrigW * this.viewportH) / this.pageOrigH) - 0.5;
        }
      }
    } else {
      this.viewportH = Math.ceil((this.viewportW / this.pageOrigW) * this.pageOrigH) - 0.5;
      if (this.viewportH > this.parentH) {
        this.viewportH = this.parentH;
      }
    }
  }

  printViewedRegion() {
    			console.debug("Region [" + this.viewedRegionW + "," + this.viewedRegionH + "] [" + this.viewedRegionX + "," + this.viewedRegionY + "]");			
    			console.debug("Region [" + ((this.viewedRegionW / HUNDRED_PERCENT)*this.calcPageW) + "," + ((this.viewedRegionH/HUNDRED_PERCENT)*this.calcPageH) + 
    			"] [" + ((this.viewedRegionX/HUNDRED_PERCENT)*this.calcPageW) + "," + ((this.viewedRegionY/HUNDRED_PERCENT)*this.calcPageH) + "]");
  }

  onZoom(zoomValue, mouseX, mouseY) {

    // Absolute x and y positions of the mouse over the (enlarged) slide:
    let absXcoordInPage = Math.abs(this.calcPageX) * MYSTERY_NUM + mouseX;
    let absYcoordInPage = Math.abs(this.calcPageY) * MYSTERY_NUM + mouseY;

    // Relative position of mouse over the slide. For example, if your slide is 1000 pixels wide, 
    // and your mouse has an absolute x-coordinate of 700, then relXcoordInPage will be 0.7 :
    const relXcoordInPage = absXcoordInPage / this.calcPageW;
    const relYcoordInPage = absYcoordInPage / this.calcPageH;

    // Relative position of mouse in the view port (same as above, but with the view port):
    const relXcoordInViewport = mouseX / this.viewportW;
    const relYcoordInViewport = mouseY / this.viewportH;

    if (this.isPortraitDoc()) {
      if (this.fitToPage) {
        this.calcPageH = this.viewportH * zoomValue / HUNDRED_PERCENT;
        this.calcPageW = (this.pageOrigW / this.pageOrigH) * this.calcPageH;
      } else {
        this.calcPageW = this.viewportW * zoomValue / HUNDRED_PERCENT;
        this.calcPageH = (this.calcPageW / this.pageOrigW) * this.pageOrigH;
      }
    } else if (this.fitToPage) {
      this.calcPageW = this.viewportW * zoomValue / HUNDRED_PERCENT;
      this.calcPageH = this.viewportH * zoomValue / HUNDRED_PERCENT;
    } else {
      this.calcPageW = this.viewportW * zoomValue / HUNDRED_PERCENT;
      this.calcPageH = (this.calcPageW / this.pageOrigW) * this.pageOrigH;
    }


    absXcoordInPage = relXcoordInPage * this.calcPageW;
    absYcoordInPage = relYcoordInPage * this.calcPageH;

    this.calcPageX = -((absXcoordInPage - mouseX) / MYSTERY_NUM);
    this.calcPageY = -((absYcoordInPage - mouseY) / MYSTERY_NUM);

    this.doWidthBoundsDetection();
    this.doHeightBoundsDetection();

    this.calcViewedRegion();
    this.printViewedRegion();
  }

  displayViewerRegion(x, y, regionW, regionH) {
    // LogUtil.debug("** disp viewer 1 [" + regionW + "," + regionH + "][" + x + "," + y + "]");
    this.calcPageW = this.viewportW / (regionW / HUNDRED_PERCENT);
    this.calcPageH = this.viewportH / (regionH / HUNDRED_PERCENT);
    this.calcPageX = (x / HUNDRED_PERCENT) * this.calcPageW;
    this.calcPageY = (y / HUNDRED_PERCENT) * this.calcPageH;
    // LogUtil.debug("** disp viewer 2 [" + viewportW + "," + viewportH + "]
    // [" +_calcPageW + "," + _calcPageH + "][" + _calcPageX + "," + _calcPageY + "]");
  }

  saveViewedRegion(x, y, regionW, regionH) {
    this.viewedRegionX = x;
    this.viewedRegionY = y;
    this.viewedRegionW = regionW;
    this.viewedRegionH = regionH;
  }

  calculateViewportNeededForRegion(regionW, regionH) {
    const vrwp = this.pageOrigW * (regionW / HUNDRED_PERCENT);
    const vrhp = this.pageOrigH * (regionH / HUNDRED_PERCENT);

    /*
    * For some reason when the viewport values are both whole numbers the clipping doesn't 
    * function. When the second part of the width/height pair is rounded up and then 
    * reduced by 0.5 the clipping always seems to happen. This was a long standing, bug 
    * and if you try to remove the Math.ceil and "-0.5" you better know what you're doing.
    *             - Chad (Aug 30, 2017)
    */

    if (this.parentW < this.parentH) {
      this.viewportW = this.parentW;
      this.viewportH = Math.ceil((vrhp / vrwp) * this.parentW) - 0.5;
      if (this.parentH < this.viewportH) {
        this.viewportH = this.parentH;
        this.viewportW = Math.ceil((vrwp * this.viewportH) / vrhp) - 0.5;
      }
    } else {
      this.viewportH = this.parentH;
      this.viewportW = Math.ceil((vrwp / vrhp) * this.parentH) - 0.5;
      if (this.parentW < this.viewportW) {
        this.viewportW = this.parentW;
        this.viewportH = Math.ceil((vrhp * this.viewportW) / vrwp) - 0.5;
      }
    }
  // LOGGER.debug("calc viewport ***** resizing [" + viewportW + "," + viewportH + "] 
  // [" + parentW + "," + parentH + "," + fitToPage + "] [" + pageOrigW + "," + pageOrigH + "]");
  }
}
