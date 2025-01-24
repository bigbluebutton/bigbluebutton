export const textToMarkdown = (message: string) => {
  const parsedMessage = message || '';

  const CODE_BLOCK_REGEX = /```([\s\S]*?)```/g;
  const isCode = parsedMessage.search(CODE_BLOCK_REGEX);

  const IMAGE_REGEX = /!\[([^\]]*)\]\(([^)]*)\)/g;
  const isImage = parsedMessage.search(IMAGE_REGEX);

  // regular expression to match urls which are not part of a markdown link
  // eslint-disable-next-line max-len
  const urlRegex = /(?<!\]\(|\[)(http(s)?:\/\/)[-a-zA-Z0-9@:%._+~#=,ß]{2,256}\.[a-z0-9]{2,6}\b([-a-zA-Z0-9@:%_+.~#!?&//=,ß]*)?(?!\)|\])/g;

  // regular expression to match new lines
  const newLineRegex = /\n\r?/g;

  if (isCode !== -1 || isImage !== -1) {
    return parsedMessage.trim();
  }
  return parsedMessage
    .trim()
    .replace(urlRegex, '[$&]($&)')
    .replace(newLineRegex, '  \n');
};

export const markdownToText = (message?: string | null) => {
  const parsedMessage = message || '';

  const CODE_BLOCK_REGEX = /```([\s\S]*?)```/g;
  const isCode = parsedMessage.search(CODE_BLOCK_REGEX);

  const IMAGE_REGEX = /!\[([^\]]*)\]\(([^)]*)\)/g;
  const isImage = parsedMessage.search(IMAGE_REGEX);

  // eslint-disable-next-line max-len
  const markdownLinkRegex = /\[([^[]+)\]\((http(s)?:\/\/[-a-zA-Z0-9@:%._+~#=,ß]{2,256}\.[a-z0-9]{2,6}\b([-a-zA-Z0-9@:%_+.~#!?&//=,ß]*)?)\)/g;

  if (isCode !== -1 || isImage !== -1) {
    return parsedMessage;
  }

  const isString = (obj: unknown): obj is string => {
    return typeof obj === 'string';
  };

  return parsedMessage.replace(markdownLinkRegex, (...args) => {
    const [match, label, url] = args;

    if (isString(label) && isString(url) && label === url) {
      return label;
    }

    return match;
  });
};

export default {
  textToMarkdown,
};
