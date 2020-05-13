async function autoJoinTest(test) {
  const resp = await test.page.evaluate(async () => await document.querySelectorAll('div[aria-label="Join audio modal"]').length === 0) !== false;
  return resp;
}

exports.autoJoinTest = autoJoinTest;
