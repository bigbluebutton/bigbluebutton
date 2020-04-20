const Audio = require('./audio/audio');

describe('Audio', () => {
  test('Join audio', async () => {
    const test = new Audio();
    let response;
    try {
      await test.init();
      response = await test.test();
    } catch (e) {
      console.log(e);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
  });

  test('Mute the other User', async () => {
    const test = new Audio();
    let response;
    try {
      await test.init();
      response = await test.mute();
    } catch (e) {
      console.log(e);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
  });
});
