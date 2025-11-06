import { expect } from '@playwright/test';
import { exec } from 'child_process';

interface RunScriptOptions {
  handleError?: (stderr: string) => unknown;
  handleOutput?: (stdout: string) => unknown;
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

/**
 * Run a shell script and handle its output or error.
 * @param script  The shell script to run.
 * @param options Options for handling output and errors.
 * @returns True if the script ran successfully, false otherwise.
 */
export async function runScript(script: string, options: RunScriptOptions = {}): Promise<boolean> {
  const { handleError, handleOutput, timeout } = options;
  return new Promise((resolve) => {
    exec(script, { timeout }, (error, stdout, stderr) => {
      if (error || stderr) {
        if (handleError) return resolve(Boolean(handleError(stderr)));
        return resolve(false);
      }
      if (handleOutput) return resolve(Boolean(handleOutput(stdout)));
      return resolve(true);
    });
  });
}
