const Audio = require('./audio/audio');
const Page = require('./core/page');

const audioTest = () => {
  beforeEach(() => {
    jest.setTimeout(30000);
  });

  test('Join audio with Listen Only', async () => {
    const test = new Audio();
    let response;
    try {
      await test.init(Page.getArgsWithAudio());
      response = await test.test();
    } catch (e) {
      console.log(e);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
  });

  test('Join audio with Microphone', async () => {
    const test = new Audio();
    let response;
    try {
      await test.init(Page.getArgsWithAudio());
      response = await test.microphone();
    } catch (e) {
      console.log(e);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
  });
};

module.exports = exports = audioTest;
