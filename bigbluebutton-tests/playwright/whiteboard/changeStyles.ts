import { expect } from '@playwright/test';

import { elements as e } from '../core/elements';
import { DrawShape } from './drawShape';
import { snapshotComparison } from './util';

const referenceDrawnShape = `${e.wbDrawnShape} svg path`;

export class ChangeStyles extends DrawShape {
  async changingColor() {
    await this.drawShape(e.wbEllipseShape, 'ellipse');
    await this.modPage.page.keyboard.press('v');
    // change the color of the shape
    await this.modPage.waitAndClick(e.whiteboardStyles);
    await this.modPage.waitAndClick(e.wbColorRed);
    await this.modPage.press('Escape');
    // check for the new shape color
    await expect(
      await this.modPage.page.$eval(referenceDrawnShape, (element) => getComputedStyle(element).stroke),
      'should the color of the shape be red',
    ).toBe('rgb(224, 49, 49)');
    await snapshotComparison(this.modPage, this.userPage, 'change-color');
  }

  async fillDrawing() {
    await this.drawShape(e.wbEllipseShape, 'ellipse');
    await this.modPage.page.keyboard.press('v');
    // fill the shape
    await this.modPage.waitAndClick(e.whiteboardStyles);
    await this.modPage.waitAndClick(e.wbFillDrawing);
    await this.modPage.press('Escape');
    // check for the filled shaped
    await expect(
      await this.modPage.page.$eval(referenceDrawnShape, (element) => getComputedStyle(element).fill),
      'should the inner color of the shape be gray',
    ).toBe('rgb(232, 232, 232)');
    await snapshotComparison(this.modPage, this.userPage, 'fill-drawing');
  }

  async dashDrawing() {
    await this.drawShape(e.wbEllipseShape, 'ellipse');
    await this.modPage.page.keyboard.press('v');
    // dash the shape
    await this.modPage.waitAndClick(e.whiteboardStyles);
    await this.modPage.waitAndClick(e.wbDashDotted);
    await this.modPage.press('Escape');
    // check for the dashed shape
    await expect(
      await this.modPage.page.$eval(referenceDrawnShape, (element) => getComputedStyle(element).strokeDasharray),
      'should the shape be dashed',
    ).not.toBe('none');
    await snapshotComparison(this.modPage, this.userPage, 'dash-drawing');
  }

  async sizeDrawing() {
    await this.drawShape(e.wbEllipseShape, 'ellipse');
    await this.modPage.page.keyboard.press('v');
    // change the size of the shape
    await this.modPage.waitAndClick(e.whiteboardStyles);
    await this.modPage.waitAndClick(e.wbSizeLarge);
    await this.modPage.press('Escape');
    // check for the larger shape
    await expect(
      await this.modPage.page.$eval(referenceDrawnShape, (element) => getComputedStyle(element).strokeWidth),
      'should the shape be with a larger stroke',
    ).toBe('5px');
    await snapshotComparison(this.modPage, this.userPage, 'size-drawing');
  }
}
