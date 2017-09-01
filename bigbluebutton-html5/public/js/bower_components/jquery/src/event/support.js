define([
  '../var/support',
], (support) => {
  support.focusin = 'onfocusin' in window;

  return support;
});
