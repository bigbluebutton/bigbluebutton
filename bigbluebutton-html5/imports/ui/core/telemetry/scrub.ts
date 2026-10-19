// Every URL goes through here before it is stored. The join URL carries the sessionToken in
// its query string and resource paths carry meeting and presentation ids, so the query string
// is always dropped and long id-like path segments become ":id".

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

  const path = url.pathname
    .split('/')
    .map((segment) => (ID_SEGMENT.test(segment) ? ':id' : segment))
    .join('/');
  const host = url.origin === window.location.origin ? '' : url.host;
  const scrubbed = `${host}${path}`;

  return scrubbed.length > MAX_LENGTH ? `${scrubbed.slice(0, MAX_LENGTH)}…` : scrubbed;
};

export default scrubUrl;
