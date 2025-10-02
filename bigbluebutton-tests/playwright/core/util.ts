import { expect } from '@playwright/test';
import { exec } from 'child_process';

interface RunScriptOptions {
  handleError?: (stderr: string) => void;
  handleOutput?: (stdout: string) => void;
  timeout?: number;
}

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
  description?: string
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

export async function runScript(script: string, options: RunScriptOptions): Promise<void> {
  const { handleError, handleOutput, timeout } = options;
  return new Promise((res) => {
    exec(script, { timeout }, (_, stdout, stderr) => {
      if (handleError) {
        res(handleError(stderr));
      } else if (handleOutput) {
        res(handleOutput(stdout));
      } else {
        res();
      }
    });
  });
}
