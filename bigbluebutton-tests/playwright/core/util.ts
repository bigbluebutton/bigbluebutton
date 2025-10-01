import { expect } from "@playwright/test";
import { exec } from 'child_process';

interface RunScriptOptions {
  handleError?: (stderr: string) => any;
  handleOutput?: (stdout: string) => any;
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
export async function checkTextContent(baseContent: string, checkData: string | string[], description?: string): Promise<void> {
  if (typeof checkData === 'string') checkData = new Array(checkData);

  checkData.forEach(word => {
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

export async function runScript(script: string, options: RunScriptOptions): Promise<any> {
  const { handleError, handleOutput, timeout } = options;
  return new Promise((res, rej) => {
    return exec(script, { timeout }, (err, stdout, stderr) => {
      res(handleError ? handleError(stderr) : handleOutput ? handleOutput(stdout) : null)
    })
  })
}
