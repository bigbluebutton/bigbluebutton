export const textToMarkdown = (message: string) => {
  let parsedMessage = message || '';
  parsedMessage = parsedMessage.trim();

  // replace url with markdown links
  const urlRegex = /(?<!\]\()https?:\/\/([\w-]+\.)+\w{1,6}([/?=&#.]?[\w-]+)*/gm;
  parsedMessage = parsedMessage.replace(urlRegex, '[$&]($&)');

  // replace new lines with markdown new lines
  parsedMessage = parsedMessage.replace(/\n\r?/g, '  \n');

  return parsedMessage;
};

export default {
  textToMarkdown,
};
