const Page = require('./page');
const UploadTestPage = require('./page-upload');

test('Tests uploading an image as a presentation', async () => {
  const test = new UploadTestPage();
  try {
    await test.init(Page.getArgs());
    await test.test();
    await test.close();
  } catch (e) {
    console.log(e);
    await test.close();
    throw new Error('Test failed');
  }
});
