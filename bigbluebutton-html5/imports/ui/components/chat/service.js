import Chats from '/imports/api/chat';
import Users from '/imports/api/users';

const SYSTEM_CHAT_TYPE = 'SYSTEM_MESSAGE';
const PUBLIC_CHAT_TYPE = 'PUBLIC_CHAT';
const PRIVATE_CHAT_TYPE = 'PRIVATE_CHAT';

/*
Message payload
{
  "_id": "ZFrNuy7B7NHFHYsLj",
  "meetingId": "183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1464098422087",
  "message": {
    "chat_type": "PUBLIC_CHAT",
    "message": "asdasdasd",
    "to_username": "public_chat_username",
    "from_tz_offset": "180",
    "from_color": "0",
    "to_userid": "public_chat_userid",
    "from_userid": "zdnypeqfydjl_2",
    "from_time": "1464098638588",
    "from_username": "Hi!",.
    "from_lang": null
  }
}
*/

const getPublicMessages = () => {
  let messages = Chats.find({
    chat_type: PUBLIC_CHAT_TYPE,
  });

  return [
    {
      content: 'Lorem ipsum dolor.',
      time: 1464098638588,
      sender: {
        id: '123',
        name: 'João da Silva Perreira Roberto Sauro',
      },
    },  {
        content: 'Lorem ipsum dolor.',
        time: 1464098638588,
        sender: {
          id: '123',
          name: 'João da Silva Perreira Roberto Sauro',
        },
      },  {
          content: 'Lorem ipsum dolor.',
          time: 1464098638588,
          sender: {
            id: '123',
            name: 'João da Silva Perreira Roberto Sauro',
          },
        },  {
            content: 'Lorem ipsum dolor.',
            time: 1464098638588,
            sender: {
              id: '123',
              name: 'João da Silva Perreira Roberto Sauro',
            },
          },  {
              content: 'Lorem ipsum dolor.',
              time: 1464098638588,
              sender: {
                id: '123',
                name: 'João da Silva Perreira Roberto Sauro',
              },
            },  {
                content: 'Lorem ipsum dolor.',
                time: 1464098638588,
                sender: {
                  id: '123',
                  name: 'João da Silva Perreira Roberto Sauro',
                },
              },  {
                  content: 'Lorem ipsum dolor.',
                  time: 1464098638588,
                  sender: {
                    id: '123',
                    name: 'João da Silva Perreira Roberto Sauro',
                  },
                },  {
                    content: 'Lorem ipsum dolor.',
                    time: 1464098638588,
                    sender: {
                      id: '123',
                      name: 'João da Silva Perreira Roberto Sauro',
                    },
                  },
    {
      content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem ex, ullam debitis aperiam, voluptate sunt?',
      time: 1464098638588,
      sender: {
        id: '123',
        name: 'Marcio Perinha',
      },
    },
    {
      content: [
        'Lorem ipsum dolor sit amet, consectetur adipisicing elit.',
        'Nam adipisci sed ut reiciendis soluta, dicta quam nulla tenetur impedit obcaecati ex.',
        'Iure totam incidunt placeat earum nisi pariatur velit id quis sint provident perspiciatis facere iste unde exercitationem nihil debitis, mollitia, perferendis, nostrum consectetur eos ea! Quidem, illo, consequuntur. Quos enim nobis, necessitatibus dolorem et dolorum sit earum ipsam dicta eius? Velit eos nihil, dolores fuga enim quia maiores architecto vitae illum nostrum corrupti quod adipisci, nesciunt neque accusantium ex soluta corporis iste sunt doloribus perferendis minus, a ut?',
        'Maxime repudiandae dolor id itaque explicabo sit deleniti error laudantium voluptatem.',
      ],
      time: 1464098638588,
      sender: {
        id: '123',
        name: 'João da Silva',
      },
    },
  ];
};

const getPrivateMessages = (userID) => {
  let messages = Chats.find({
    chat_type: PRIVATE_CHAT_TYPE,
    from_userid: userID,
  });

  return messages.fetch();
};

const sendMessage = (toUserID, message) => {
  let messages = Chats.find({
    chat_type: PRIVATE_CHAT_TYPE,
    from_userid: userID,
  });

  return messages;
};

export default {
  getPublicMessages,
  getPrivateMessages,
  sendMessage,
};
