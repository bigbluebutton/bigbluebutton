export const textToMarkdown = (message: string) => {
  const parsedMessage = message || '';

  const CODE_BLOCK_REGEX = /```([\s\S]*?)```/g;
  const isCode = parsedMessage.search(CODE_BLOCK_REGEX);

  // regular expression to match urls
  const urlRegex = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g;

  // regular expression to match URLs with IP addresses
  const ipUrlRegex = /\b(?:https?:\/\/)?(?:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::\d{1,5})?(?:\/\S*)?\b/g;

  // regular expression to match Markdown links
  const mdRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

  // regular expression to match new lines
  const newLineRegex = /\n\r?/g;

  // append https:// to URLs that don't have it
  const appendHttps = (match: string, text: string, url: string) => {
    if (!/^https?:\/\//.test(url)) {
      return `[${text}](https://${url})`;
    }
    return match;
  };
  if (isCode !== -1) {
    return parsedMessage.trim();
  }
  return parsedMessage
    .trim()
    .replace(urlRegex, '[$&]($&)')
    .replace(ipUrlRegex, '[$&]($&)')
    .replace(mdRegex, appendHttps)
    .replace(newLineRegex, '  \n');
};

export default {
  textToMarkdown,
};
