import { expect, Frame as PlaywrightFrame } from '@playwright/test';

import { ELEMENT_WAIT_TIME } from './constants';

export class Frame {
  public frame: PlaywrightFrame;

  constructor(frame: PlaywrightFrame) {
    this.frame = frame;
  }

  async hasElement(selector: string, description?: string, timeout: number = ELEMENT_WAIT_TIME): Promise<void> {
    const locator = this.frame.locator(selector);
    await expect(locator, description).toBeVisible({ timeout });
  }
}
