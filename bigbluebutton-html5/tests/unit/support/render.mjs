// Thin wrappers over react-test-renderer. No DOM is involved: these units are
// hooks and a modal whose host elements come from the ./doubles/styles.mjs
// double, so a full jsdom would buy nothing.
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Renders a component solely to run a hook, exposing its latest return value.
export async function renderHook(useHook) {
  const result = { current: undefined };
  const Probe = () => {
    result.current = useHook();
    return null;
  };

  await act(async () => {
    TestRenderer.create(React.createElement(Probe));
  });

  return { result };
}

export async function renderComponent(Component, props) {
  let renderer;
  await act(async () => {
    renderer = TestRenderer.create(React.createElement(Component, props));
  });

  return {
    renderer,
    async rerender(nextProps) {
      await act(async () => {
        renderer.update(React.createElement(Component, nextProps));
      });
    },
    // Lets a pending promise chain settle and its state updates commit.
    async flush() {
      await act(async () => {});
    },
  };
}
