// Test: Sending a chat message

const Page = require('./page');
const helper = require('./helper');
const e = require('./elements');

class ChatTestPage extends Page
{
  async test()
  {
    await this.createBBBMeeting();
    await this.joinWithoutAudio();

    await this.page.waitFor(e.chatButton);
    await this.page.click(e.chatButton);
    await this.page.waitFor(e.chatBox);
    await this.page.waitFor(e.chatMessages);

    var messages0 = await this.getTestElements();

    await this.page.type(e.chatBox, "Hello world!");
    await this.page.click(e.sendButton);
    await helper.sleep(500);
    
    await this.page.screenshot({path: "screenshots/test-chat.png"});

    var messages1 = await this.getTestElements();

    console.log("\nChat messages before posting:");
    console.log(JSON.stringify(messages0, null, 2));
    console.log("\nChat messages after posting:");
    console.log(JSON.stringify(messages1, null, 2));
  }

  async getTestElements()
  {
    var messages = await this.page.evaluate((chat) => 
    {
      var messages = [];
      var children = document.querySelector(chat).childNodes;
      for(var i = 0; i < children.length; i++)
      {
        var content = children[i].childNodes[0].childNodes[1];
        if(content)
        {
          content = content.childNodes;
          messages.push({name: content[0].innerText, message: content[1].innerText});
        }
      }
      console.log(messages);
      return messages;
    }, e.chatMessages);

    return messages;
  }
};

var test = new ChatTestPage();
(async() =>
{
  try
  {
    await test.init(Page.getArgs());
    await test.test();
    await test.close();
  }
  catch(e)
  {
    console.log(e);
    process.exit(1);
  }
})();