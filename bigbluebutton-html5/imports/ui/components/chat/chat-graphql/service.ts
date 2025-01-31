export const textToMarkdown = (message: string) => {
  const parsedMessage = message || '';

  const CODE_BLOCK_REGEX = /```([\s\S]*?)```/g;
  const isCode = parsedMessage.search(CODE_BLOCK_REGEX);

  const IMAGE_REGEX = /!\[([^\]]*)\]\(([^)]*)\)/g;
  const isImage = parsedMessage.search(IMAGE_REGEX);

  // regular expression to match urls
  const urlRegex = /(http(s)?:\/\/)[-a-zA-Z0-9@:%._+~#=,ß]{2,256}\.[a-z0-9]{2,6}\b([-a-zA-Z0-9@:%_+.~#!?&//=,ß]*)?/g;

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

export default {
  textToMarkdown,
};
