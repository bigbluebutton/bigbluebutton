class CustomReporter {
  onTestEnd(test, result) {
    const { retries } = test;
    const { status, error, retry } = result;
    const titlePath = test.titlePath();
    titlePath.shift();
    const logTitle = `[${titlePath.shift()}] › ${titlePath.join(' › ')}`.replace('@ci', '').trim();

    if (status === 'failed') {
      const baseMessage = `${logTitle}\n${error.stack}`;

      if (retries != retry) {
        const warningMessage = `Flaky (attempt #${retry + 1}) ────────────────────────────────────────────────────────────\n${baseMessage}\n`;
        console.log(`::warning title=${logTitle}::  ${warningMessage}`.replace(/\n/g, '%0A  '));
        return;
      }

      console.log(`::error title=${logTitle}::  ${baseMessage}`.replace(/\n/g, '%0A  '));
    }
  }
}

export default CustomReporter;
