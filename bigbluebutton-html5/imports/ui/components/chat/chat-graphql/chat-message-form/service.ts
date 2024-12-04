import BBBWeb from '/imports/api/bbb-web-api';

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

export const uploadImage = async (fileUrl: string): Promise<string> => {
  const controller = new AbortController();
  const urlParams = new URLSearchParams(window.location.search);
  const sessionToken = urlParams.get('sessionToken');

  try {
    const { data } = await BBBWeb.index(controller.signal);
    const url = new URL(`${data.graphqlApiUrl}/chatImageUpload`);
    const response = await fetch(url, {
      method: 'post',
      credentials: 'include',
      body: JSON.stringify({file: fileUrl}),
      headers: {
        'x-session-token': sessionToken ?? '',
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    const result = await response.json();
    if (result.imageUrl) {
      console.log(`image uploaded successfully: ${result.imageUrl}`);
      return `${url.href}?${result.imageUrl}`;
    }
    console.log(`error on image upload: ${result.message}`);
    return '';
  } catch (error) {
    console.log({ error });
    return '';
  }
};

export const replaceImageLinks = async (message: string) => {
  let newMessage = message;

  const IMAGE_REGEX = /!\[([^\]]*)\]\(([^)]*)\)/g;

  const images: string[] = [];
  newMessage.replace(IMAGE_REGEX, (_, __, p2) => {
    images.push(p2);
  });

  const uploadPromises = images.map(async (image) => {
    const uploaded = await uploadImage(image);
    newMessage = newMessage.replace(image, uploaded);
  });

  await Promise.all(uploadPromises);

  return newMessage;
};

export default {
  textToMarkdown,
  uploadImage,
  replaceImageLinks,
};
