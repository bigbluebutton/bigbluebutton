import { expect } from '@playwright/test';

interface ClipObj {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface WbBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Text
export async function checkTextContent(
  baseContent: string,
  checkData: string | string[],
  description?: string,
): Promise<void> {
  const dataArray = typeof checkData === 'string' ? [checkData] : checkData;

  dataArray.forEach((word) => {
    expect(baseContent, description ?? `should contain the value "${word}"`).toContain(word);
  });
}

export function constructClipObj(wbBox: WbBox): ClipObj {
  return {
    x: wbBox.x,
    y: wbBox.y,
    width: wbBox.width,
    height: wbBox.height,
  };
}
