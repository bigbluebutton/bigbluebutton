/**
 * Telemetry contract of the LiveKit autoplay prompt.
 *
 * These tests pin the counting rules, because they are what a dashboard reads
 * and a dashboard cannot tell a missing event from a zero:
 *
 *   - every playback start emits livekit_audio_played carrying its source
 *   - livekit_audio_autoplayed means genuine autoplay only, i.e. source
 *     'indirect' - never a gesture-mediated start
 *   - a failed start emits livekit_audio_play_failed carrying its source, once
 *   - the prompt emits one livekit_audio_autoplay_prompt_shown per display,
 *     edge triggered on isOpen
 *   - a block is logged once per episode, gated on the pending modal request
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  environment,
  resetEnvironment,
  logsFor,
  logCodes,
  makeModalRegistration,
} from './support/environment.mjs';
import { renderHook, renderComponent } from './support/render.mjs';

import { useAutoplayState } from '/imports/ui/components/livekit/autoplay-modal/hooks';
import LKAutoplayModal from '/imports/ui/components/livekit/autoplay-modal/component';
import LKAutoplayModalContainer from '/imports/ui/components/livekit/autoplay-modal/container';

const SOURCES = ['indirect', 'button', 'dismissal'];
const GESTURE_SOURCES = ['button', 'dismissal'];

// Removed by this change. They double-logged a single failure, so their absence
// is part of the contract, not an accident of these fixtures.
const RETIRED_LOG_CODES = ['livekit_audio_autoplay_failed', 'livekit_audio_autoplay_handle_failed'];

const renderAutoplayState = () => renderHook(() => useAutoplayState(undefined));

// A real successful start flips LiveKit's canPlayAudio, and the hook resets
// hasAttempted whenever canPlayAudio is false. Modelling that is what makes the
// hasAttempted assertions meaningful.
const startAudioSucceeds = async () => { environment.canPlayAudio = true; };
const startAudioFails = async () => {
  throw new Error("play() failed because the user didn't interact with the document first.");
};

const settle = (promise) => promise.then(() => null, (error) => error);

// --- handleStartAudio: success ----------------------------------------------

SOURCES.forEach((source) => {
  test(`handleStartAudio: a successful ${source} start logs livekit_audio_played with its source`, async () => {
    resetEnvironment({ startAudio: startAudioSucceeds });
    const { result } = await renderAutoplayState();

    await settle(result.current[1](source));

    const played = logsFor('livekit_audio_played');
    assert.equal(played.length, 1, 'exactly one start is counted');
    assert.deepEqual(played[0].extraInfo, { source });
    assert.equal(logsFor('livekit_audio_play_failed').length, 0);
  });
});

test('handleStartAudio: livekit_audio_autoplayed is emitted for indirect success only', async () => {
  resetEnvironment({ startAudio: startAudioSucceeds });
  const { result } = await renderAutoplayState();

  await settle(result.current[1]('indirect'));

  assert.equal(logsFor('livekit_audio_autoplayed').length, 1);
});

GESTURE_SOURCES.forEach((source) => {
  test(`handleStartAudio: a ${source} start is not counted as autoplay`, async () => {
    resetEnvironment({ startAudio: startAudioSucceeds });
    const { result } = await renderAutoplayState();

    await settle(result.current[1](source));

    assert.equal(
      logsFor('livekit_audio_autoplayed').length,
      0,
      'a gesture-mediated start is not autoplay',
    );
  });
});

test('handleStartAudio: omitting the source counts as indirect', async () => {
  resetEnvironment({ startAudio: startAudioSucceeds });
  const { result } = await renderAutoplayState();

  await settle(result.current[1]());

  assert.deepEqual(logsFor('livekit_audio_played')[0].extraInfo, { source: 'indirect' });
  assert.equal(logsFor('livekit_audio_autoplayed').length, 1);
});

test('handleStartAudio: only a gesture-mediated start registers an attempt', async () => {
  resetEnvironment({ startAudio: startAudioSucceeds });

  const indirect = await renderAutoplayState();
  await settle(indirect.result.current[1]('indirect'));
  assert.equal(indirect.result.current[0].hasAttempted, false);

  resetEnvironment({ startAudio: startAudioSucceeds });
  const button = await renderAutoplayState();
  await settle(button.result.current[1]('button'));
  assert.equal(button.result.current[0].hasAttempted, true);
});

// --- handleStartAudio: failure ----------------------------------------------

SOURCES.forEach((source) => {
  test(`handleStartAudio: a failed ${source} start logs livekit_audio_play_failed with its source`, async () => {
    resetEnvironment({ startAudio: startAudioFails });
    const { result } = await renderAutoplayState();

    const error = await settle(result.current[1](source));

    assert.ok(error instanceof Error, 'the failure is rethrown for the caller to handle');

    const failed = logsFor('livekit_audio_play_failed');
    assert.equal(failed.length, 1, 'a single failure is logged once');
    assert.equal(failed[0].extraInfo.source, source);
    assert.equal(failed[0].extraInfo.errorMessage, error.message);

    assert.equal(logsFor('livekit_audio_played').length, 0, 'a failed start is not a start');
    assert.equal(logsFor('livekit_audio_autoplayed').length, 0);
    RETIRED_LOG_CODES.forEach((retired) => {
      assert.ok(!logCodes().includes(retired), `${retired} is retired`);
    });
  });
});

test('handleStartAudio: the attempt is no longer in flight once it fails', async () => {
  resetEnvironment({ startAudio: startAudioFails });
  const { result } = await renderAutoplayState();

  await settle(result.current[1]('button'));

  assert.equal(result.current[0].isAttempting, false);
});

// --- the prompt: one event per display --------------------------------------

const modalProps = (overrides = {}) => ({
  autoplayHandler: async () => {},
  isOpen: false,
  onPromptShown: () => {},
  onRequestClose: () => {},
  priority: 'medium',
  setIsOpen: () => {},
  isAttemptingAutoplay: false,
  ...overrides,
});

test('the prompt reports a display on the false-to-true edge of isOpen, once per display', async () => {
  resetEnvironment();
  let shown = 0;
  const onPromptShown = () => { shown += 1; };

  const { rerender } = await renderComponent(LKAutoplayModal, modalProps({ isOpen: false, onPromptShown }));
  assert.equal(shown, 0, 'mounting while closed is not a display');

  await rerender(modalProps({ isOpen: true, onPromptShown }));
  assert.equal(shown, 1, 'the prompt reached the user');

  // A re-render while already open is the same display.
  await rerender(modalProps({ isOpen: true, onPromptShown, isAttemptingAutoplay: true }));
  assert.equal(shown, 1);

  await rerender(modalProps({ isOpen: false, onPromptShown }));
  assert.equal(shown, 1, 'closing is not a display');

  // Hidden by the modal queue and readmitted: one display, then another.
  await rerender(modalProps({ isOpen: true, onPromptShown }));
  assert.equal(shown, 2);
});

test('the prompt button starts audio with source "button", not with the click event', async () => {
  resetEnvironment();
  const calls = [];
  const autoplayHandler = async (...args) => { calls.push(args); };

  const { renderer } = await renderComponent(LKAutoplayModal, modalProps({ isOpen: true, autoplayHandler }));
  const button = renderer.root.findByProps({ 'data-test': 'playAudioButton' });

  // AudioAutoplayPrompt wires onClick straight through, so the handler is
  // called with a click event unless the call site passes its source. That is
  // the bug this pins: the source, and nothing else, reaches the handler.
  await button.props.onClick({ type: 'click', preventDefault: () => {} });

  assert.deepEqual(calls, [['button']]);
});

test('the prompt button swallows a failed start instead of leaving a rejection unhandled', async () => {
  resetEnvironment();
  const autoplayHandler = async () => { throw new Error('NotAllowedError'); };

  const { renderer } = await renderComponent(LKAutoplayModal, modalProps({ isOpen: true, autoplayHandler }));
  const button = renderer.root.findByProps({ 'data-test': 'playAudioButton' });

  await assert.doesNotReject(async () => button.props.onClick({ type: 'click' }));
});

// --- the block: once per episode --------------------------------------------

// canPlayAudio false + connected + no attempt + no audio modal => shouldOpen(),
// and a failing silent retry is what drives the container to log the block.
const blockedEnvironment = (modal) => resetEnvironment({
  startAudio: startAudioFails,
  canPlayAudio: false,
  isAudioConnected: true,
  audioModalIsOpen: false,
  modal,
});

const renderContainer = async () => {
  const rendered = await renderComponent(LKAutoplayModalContainer, {});
  // The block is logged from the .then continuation of the silent retry.
  await rendered.flush();
  return rendered;
};

test('a blocked start logs livekit_audio_autoplay_blocked with the shouldOpen conditions', async () => {
  blockedEnvironment(makeModalRegistration({ isOpen: false, queuedPosition: null }));

  await renderContainer();

  assert.equal(logsFor('livekit_audio_play_failed')[0].extraInfo.source, 'indirect');

  const blocked = logsFor('livekit_audio_autoplay_blocked');
  assert.equal(blocked.length, 1);
  assert.deepEqual(blocked[0].extraInfo, {
    canPlayAudio: false,
    isConnected: true,
    hasAttempted: false,
    audioModalIsOpen: false,
    showable: true,
  });
  assert.equal(environment.modal.calls.open, 1);
});

test('a block queued behind another modal is not logged a second time', async () => {
  // queuedPosition 0 is the edge: the request is pending, and 0 is falsy. The
  // guard has to test against null, not truthiness.
  blockedEnvironment(makeModalRegistration({ isOpen: false, queuedPosition: 0 }));

  await renderContainer();

  assert.equal(
    logsFor('livekit_audio_play_failed').length,
    1,
    'the start was still attempted',
  );
  assert.equal(
    logsFor('livekit_audio_autoplay_blocked').length,
    0,
    'the same episode is already queued, so it does not count again',
  );
  assert.equal(environment.modal.calls.open, 0);
});

test('a granted slot draws the prompt, and that display is counted', async () => {
  blockedEnvironment(makeModalRegistration({ isOpen: true, queuedPosition: null }));

  await renderContainer();

  assert.equal(logsFor('livekit_audio_autoplay_blocked').length, 1);
  assert.equal(logsFor('livekit_audio_autoplay_prompt_shown').length, 1);
});

test('a block whose slot is not granted draws no prompt, so no display is counted', async () => {
  blockedEnvironment(makeModalRegistration({ isOpen: false, queuedPosition: null }));

  await renderContainer();

  assert.equal(logsFor('livekit_audio_autoplay_blocked').length, 1);
  assert.equal(
    logsFor('livekit_audio_autoplay_prompt_shown').length,
    0,
    'showable is a prediction; it does not claim the render committed',
  );
});
