export const textToMarkdown = (message: string) => {
  const parsedMessage = message || '';

  const newLineRegex = /\n\r?/g;

  // Process the message by separating code blocks from regular text
  const segments = [];
  const CODE_BLOCK_REGEX = /```([\s\S]*?)```/g;
  const IMAGE_REGEX = /!\[([^\]]*)\]\(([^)]*)\)/g;

  let lastIndex = 0;
  let match = CODE_BLOCK_REGEX.exec(parsedMessage);

  // Extract code blocks
  while (match !== null) {
    // Add text before this code block (if any)
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        content: parsedMessage.substring(lastIndex, match.index),
      });
    }

    // Add the code block
    segments.push({
      type: 'code',
      content: match[0],
    });

    lastIndex = match.index + match[0].length;
    match = CODE_BLOCK_REGEX.exec(parsedMessage);
  }

  // Add remaining text after last code block (if any)
  if (lastIndex < parsedMessage.length) {
    segments.push({
      type: 'text',
      content: parsedMessage.substring(lastIndex),
    });
  }

  // If there were no code blocks, just add the whole message as a text segment
  if (segments.length === 0) {
    segments.push({
      type: 'text',
      content: parsedMessage,
    });
  }

  // Process each segment appropriately
  const processedSegments = segments.map((segment) => {
    if (segment.type === 'code') {
      return segment.content;
    }
    const { content } = segment;

    // Check if there are any image markdown
    const hasImageMarkdown = IMAGE_REGEX.test(content);
    // Reset the regex lastIndex
    IMAGE_REGEX.lastIndex = 0;

    if (hasImageMarkdown) {
      return content;
    }

    // URL regex without lookbehind (as it doesn't work on Safari older than 16.4
    const urlRegex = /(http(s)?:\/\/)[-a-zA-Z0-9@:%._+~#=,ß]{2,256}\.[a-z0-9]{2,6}\b([-a-zA-Z0-9@:%_+.~#!?&//=,ß]*)?/g;

    // Handle URLs without using lookbehind
    const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

    // Check if content already contains markdown links
    const hasMarkdownLinks = markdownLinkRegex.test(content);

    // If content already has markdown links, use a different approach
    if (hasMarkdownLinks) {
      // Create a placeholder for each part of the text
      const parts = [];
      let lastIdx = 0;
      let linkMatch;

      // Reset regex lastIndex
      markdownLinkRegex.lastIndex = 0;

      // Extract existing markdown links
      // eslint-disable-next-line no-cond-assign
      while ((linkMatch = markdownLinkRegex.exec(content)) !== null) {
        // Add text before this link (if any)
        if (linkMatch.index > lastIdx) {
          const textBefore = content.substring(lastIdx, linkMatch.index);
          parts.push({
            type: 'text',
            content: textBefore,
          });
        }

        // Add the existing markdown link
        parts.push({
          type: 'link',
          content: linkMatch[0],
        });

        lastIdx = linkMatch.index + linkMatch[0].length;
      }

      // Add remaining text after last link (if any)
      if (lastIdx < content.length) {
        parts.push({
          type: 'text',
          content: content.substring(lastIdx),
        });
      }

      // Process each part appropriately
      const processedParts = parts.map((part) => {
        if (part.type === 'link') {
          return part.content; // Keep existing markdown links as-is
        }
        // Convert URLs to markdown links in text parts only
        return part.content.replace(urlRegex, '[$&]($&)');
      });

      // Join all parts back together
      return processedParts.join('');
    }

    // If no existing markdown links, simply convert all URLs
    return content.replace(urlRegex, '[$&]($&)');
  });

  // Join all segments back together
  const result = processedSegments.join('');

  // Handle newlines and trim the result
  return result.trim().replace(newLineRegex, '  \n');
};

export default {
  textToMarkdown,
};
