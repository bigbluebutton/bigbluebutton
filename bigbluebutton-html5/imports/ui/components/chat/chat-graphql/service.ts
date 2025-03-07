export const textToMarkdown = (message: string) => {
  const parsedMessage = message || '';

  const newLineRegex = /\r?\n/g;

  // Process the message by separating code blocks from regular text
  const segments = [];
  const CODE_BLOCK_REGEX = /```([\s\S]*?)```/g;

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

    let { content } = segment;

    // First, handle image markdown similar to how we handle links
    const IMAGE_REGEX = /!\[([^\]]*)\]\(([^)]*)\)/g;
    const containsImages = IMAGE_REGEX.test(content);
    IMAGE_REGEX.lastIndex = 0;

    if (containsImages) {
      // Create a placeholder for each part of the text
      const imageParts = [];
      let lastIdx = 0;
      let imageMatch;

      // Extract image markdown
      // eslint-disable-next-line no-cond-assign
      while ((imageMatch = IMAGE_REGEX.exec(content)) !== null) {
        // Add text before this image (if any)
        if (imageMatch.index > lastIdx) {
          const textBefore = content.substring(lastIdx, imageMatch.index);
          imageParts.push({
            type: 'text',
            content: textBefore,
          });
        }

        // Add the image markdown
        imageParts.push({
          type: 'image',
          content: imageMatch[0],
        });

        lastIdx = imageMatch.index + imageMatch[0].length;
      }

      // Add remaining text after last image (if any)
      if (lastIdx < content.length) {
        imageParts.push({
          type: 'text',
          content: content.substring(lastIdx),
        });
      }

      // Now process each part for links
      const processedImageParts = imageParts.map((part) => {
        if (part.type === 'image') {
          return part.content; // Keep image markdown as-is
        }

        // Process text parts for links
        const textContent = part.content;

        // URL regex without lookbehind
        const urlRegex = /(http(s)?:\/\/)[-a-zA-Z0-9@:%._+~#=,ß]{2,256}\.[a-z0-9]{2,6}\b([-a-zA-Z0-9@:%_+.~#!?&//=,ß]*)?/g;

        // Handle URLs without using lookbehind
        const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

        // Check if content already contains markdown links
        const hasMarkdownLinks = markdownLinkRegex.test(textContent);
        markdownLinkRegex.lastIndex = 0;

        if (hasMarkdownLinks) {
          // Handle links in a way similar to how we handled images
          const linkParts = [];
          let linkLastIdx = 0;
          let linkMatch;

          // Extract existing markdown links
          // eslint-disable-next-line no-cond-assign
          while ((linkMatch = markdownLinkRegex.exec(textContent)) !== null) {
            // Add text before this link (if any)
            if (linkMatch.index > linkLastIdx) {
              const textBefore = textContent.substring(linkLastIdx, linkMatch.index);
              linkParts.push({
                type: 'text',
                content: textBefore,
              });
            }

            // Add the existing markdown link
            linkParts.push({
              type: 'link',
              content: linkMatch[0],
            });

            linkLastIdx = linkMatch.index + linkMatch[0].length;
          }

          // Add remaining text after last link (if any)
          if (linkLastIdx < textContent.length) {
            linkParts.push({
              type: 'text',
              content: textContent.substring(linkLastIdx),
            });
          }

          // Process each part appropriately
          const processedLinkParts = linkParts.map((linkPart) => {
            if (linkPart.type === 'link') {
              return linkPart.content; // Keep existing markdown links as-is
            }
            // Convert URLs to markdown links in text parts only
            return linkPart.content.replace(urlRegex, '[$&]($&)');
          });

          // Join all parts back together
          return processedLinkParts.join('');
        }

        // If no existing markdown links, simply convert all URLs
        return textContent.replace(urlRegex, '[$&]($&)');
      });

      // Join all image parts back together
      return processedImageParts.join('');
    }

    // If no images, proceed with link processing as before
    // URL regex without lookbehind
    const urlRegex = /(http(s)?:\/\/)[-a-zA-Z0-9@:%._+~#=,ß]{2,256}\.[a-z0-9]{2,6}\b([-a-zA-Z0-9@:%_+.~#!?&//=,ß]*)?/g;

    // Handle URLs without using lookbehind
    const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

    // Check if content already contains markdown links
    const hasMarkdownLinks = markdownLinkRegex.test(content);
    markdownLinkRegex.lastIndex = 0;

    // If content already has markdown links, use a different approach
    if (hasMarkdownLinks) {
      // Create a placeholder for each part of the text
      const parts = [];
      let lastIdx = 0;
      let linkMatch;

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
