export const messageToMarkdown = (message: string) => {
  const parsedMessage = message || '';

  // this function is mostly used to convert links to markdown, so it can skip if it doesn't contain http
  if (parsedMessage.toLowerCase().indexOf('http') === -1) {
    return parsedMessage;
  }

  const newLineRegex = /\r?\n/g;

  // Regex definitions
  const MULTI_LINE_CODE_BLOCK_REGEX = /```([\s\S]*?)```/g;
  const INLINE_CODE_REGEX = /`([^`]+)`/g;
  const EMPTY_LINK_REGEX = /\[\]\((https?:\/\/[^)]+)\)/gi;
  const IMAGE_REGEX = /!\[([^\]]*)\]\(([^)]*)\)/g;
  const URL_REGEX = /(http(s)?:\/\/)[-a-zA-Z0-9@:%._+~#=,ß]{2,256}\.[a-z0-9]{2,6}\b([-a-zA-Z0-9@:%_+.~#!?&//=,ß]*)?/gi;
  const MARKDOWN_LINK_REGEX = /\[([^\]]+)\]\(([^)]+)\)/g;

  // First pass: extract multi-line code blocks.
  const segments: { type: 'text' | 'code'; content: string }[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  // eslint-disable-next-line no-cond-assign
  while ((match = MULTI_LINE_CODE_BLOCK_REGEX.exec(parsedMessage)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        content: parsedMessage.substring(lastIndex, match.index),
      });
    }
    segments.push({
      type: 'code',
      content: match[0],
    });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < parsedMessage.length) {
    segments.push({
      type: 'text',
      content: parsedMessage.substring(lastIndex),
    });
  }
  if (segments.length === 0) {
    segments.push({
      type: 'text',
      content: parsedMessage,
    });
  }

  // Second pass: process inline code in text segments.
  const processedSegments: { type: 'text' | 'code' | 'inline-code'; content: string }[] = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const segment of segments) {
    if (segment.type === 'code') {
      processedSegments.push(segment);
    } else {
      const { content } = segment;
      let textLastIndex = 0;
      let inlineMatch: RegExpExecArray | null;
      // eslint-disable-next-line no-cond-assign
      while ((inlineMatch = INLINE_CODE_REGEX.exec(content)) !== null) {
        if (inlineMatch.index > textLastIndex) {
          processedSegments.push({
            type: 'text',
            content: content.substring(textLastIndex, inlineMatch.index),
          });
        }
        processedSegments.push({
          type: 'inline-code',
          content: inlineMatch[0],
        });
        textLastIndex = inlineMatch.index + inlineMatch[0].length;
      }
      if (textLastIndex < content.length) {
        processedSegments.push({
          type: 'text',
          content: content.substring(textLastIndex),
        });
      }
    }
  }

  // Helper function: process text for URLs inside markdown links.
  function processTextForLinks(text: string): string {
    // If the text already contains markdown links, process the gaps.
    if (MARKDOWN_LINK_REGEX.test(text)) {
      let result = '';
      let lastIdx = 0;
      MARKDOWN_LINK_REGEX.lastIndex = 0;
      let linkMatch: RegExpExecArray | null;
      // eslint-disable-next-line no-cond-assign
      while ((linkMatch = MARKDOWN_LINK_REGEX.exec(text)) !== null) {
        if (linkMatch.index > lastIdx) {
          result += text
            .substring(lastIdx, linkMatch.index)
            .replace(URL_REGEX, '[$&]($&)');
        }
        result += linkMatch[0];
        lastIdx = linkMatch.index + linkMatch[0].length;
      }
      if (lastIdx < text.length) {
        result += text.substring(lastIdx).replace(URL_REGEX, '[$&]($&)');
      }
      return result;
    }
    // Otherwise, simply convert URLs.
    return text.replace(URL_REGEX, '[$&]($&)');
  }

  // Helper function: process images and then links.
  function processTextForImagesAndLinks(text: string): string {
    // Fix markdown links with empty descriptions.
    const fixedText = text.replace(EMPTY_LINK_REGEX, (_, url) => `[${url}](${url})`);
    if (IMAGE_REGEX.test(fixedText)) {
      let result = '';
      let lastIdx = 0;
      IMAGE_REGEX.lastIndex = 0;
      let imgMatch: RegExpExecArray | null;
      // eslint-disable-next-line no-cond-assign
      while ((imgMatch = IMAGE_REGEX.exec(fixedText)) !== null) {
        if (imgMatch.index > lastIdx) {
          result += processTextForLinks(fixedText.substring(lastIdx, imgMatch.index));
        }
        result += imgMatch[0];
        lastIdx = imgMatch.index + imgMatch[0].length;
      }
      if (lastIdx < fixedText.length) {
        result += processTextForLinks(fixedText.substring(lastIdx));
      }
      return result;
    }
    return processTextForLinks(fixedText);
  }

  // Third pass: process each segment for images and links.
  let finalResult = '';
  // eslint-disable-next-line no-restricted-syntax
  for (const segment of processedSegments) {
    if (segment.type === 'code' || segment.type === 'inline-code') {
      finalResult += segment.content;
    } else {
      finalResult += processTextForImagesAndLinks(segment.content);
    }
  }

  // Replace newlines with markdown newlines and trim.
  return finalResult.trim().replace(newLineRegex, '  \n');
};

export const messageToQuoteMarkdown = (message: string | undefined): string => {
  // this function will try to find the next line that doesn't begin with ``` or image, and is not empty
  if (!message) return '';

  const codeBlockRegExp = /^```/;
  const imageRegExp = /^!\[.*\]\(.*\)/;
  const messageChunks = messageToMarkdown(message).split('\n');

  for (let i = 0; i < messageChunks.length; i += 1) {
    let candidate = messageChunks[i].trim();

    if (codeBlockRegExp.test(candidate)) {
      if (i + 1 < messageChunks.length && !codeBlockRegExp.test(messageChunks[i + 1].trim())) {
        candidate = `\`${messageChunks[i + 1]}\``;
      }
    }

    if (!codeBlockRegExp.test(candidate) && !imageRegExp.test(candidate) && candidate !== '') {
      return candidate;
    }
  }

  return '';
};
