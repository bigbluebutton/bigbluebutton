const e = require('./elements');

async function openChat(test) {
  await test.click(e.chatButton);
  await test.waitForSelector(e.chatBox);
  await test.waitForSelector(e.chatMessages);
}

async function getTestElements(test) {
  const messages = await test.page.evaluate((chat) => {
    const messages = [];
    const children = document.querySelector(chat).childNodes;
    for (let i = 0; i < children.length; i++) {
      let content = children[i].childNodes[0].childNodes[1];
      if (content) {
        content = content.childNodes;
        messages.push({ name: content[0].innerText, message: content[1].innerText });
      }
    }
    console.log(messages);
    return messages;
  }, e.chatMessages);

  return messages;
}

exports.openChat = openChat;
exports.getTestElements = getTestElements;
