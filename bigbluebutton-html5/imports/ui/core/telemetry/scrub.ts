// Every URL goes through here before it is stored. The join URL carries the sessionToken in
// its query string and resource paths carry meeting and presentation ids, so the query string
// is always dropped and long id-like path segments become ":id". Other hosts keep only the host:
// their paths can carry user content (a shared video id, an embedded page).

const ID_SEGMENT = /^(?=.*\d)[0-9A-Za-z_-]{20,}$/;
const MAX_LENGTH = 120;

const scrubUrl = (raw: string): string => {
  if (raw.startsWith('data:')) return 'data:';
  if (raw.startsWith('blob:')) return 'blob:';

  let url: URL;
  try {
    url = new URL(raw, window.location.href);
  } catch {
    return '(invalid-url)';
  }
  if (url.origin !== window.location.origin) return url.host;

  const scrubbed = url.pathname
    .split('/')
    .map((segment) => (ID_SEGMENT.test(segment) ? ':id' : segment))
    .join('/');

  return scrubbed.length > MAX_LENGTH ? `${scrubbed.slice(0, MAX_LENGTH)}…` : scrubbed;
};

// data-test ids name controls, but a few are built from user content (breakout room names).
// Those elements carry data-telemetry-redact; anything that is not shaped like an id is skipped too,
// so the nearest safe ancestor names the control instead.
const DATA_TEST_ID = /^[A-Za-z][A-Za-z0-9_-]{0,63}$/;

const isSafeDataTest = (element: Element): boolean => (
  !element.hasAttribute('data-telemetry-redact')
  && DATA_TEST_ID.test(element.getAttribute('data-test') ?? '')
);

export const annotatedAncestor = (target: Element): Element | null => {
  let node = target.closest('[data-test]');
  while (node && !isSafeDataTest(node)) {
    node = node.parentElement?.closest('[data-test]') ?? null;
  }
  return node;
};

export default scrubUrl;
