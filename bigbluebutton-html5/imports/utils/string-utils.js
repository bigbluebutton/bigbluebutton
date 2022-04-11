import SanitizeHTML from 'sanitize-html';

export const capitalizeFirstLetter = (s = '') => s.charAt(0).toUpperCase() + s.slice(1);

export const sanitizeHTML = (msgHtml) => SanitizeHTML(msgHtml, {
  allowedTags: ['a', 'b', 'br', 'i', 'img', 'li', 'small', 'span', 'strong', 'u', 'ul'],
  allowedAttributes: {
    a: ['href', 'name', 'target'],
    img: ['src', 'width', 'height'],
  },
  allowedSchemes: ['https'],
});

export default { capitalizeFirstLetter, sanitizeHTML };
