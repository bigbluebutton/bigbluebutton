"use strict";

// PLUGIN: Timeline
(function(Popcorn) {
  let i = 1;

  function formatTimestamp(seconds) {
    seconds = Math.round(seconds);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    minutes = minutes % 60;
    seconds = seconds % 60;
    let timestamp = `${minutes}:${("00"+seconds).slice(-2)}`;
    if (hours > 0) {
      timestamp = `${hours}:${("00"+timestamp).slice(-5)}`;
    }
    return timestamp;
  }

  function renderChatContent(options) {
    const target = document.getElementById(options.target);
    const contentDiv = document.createElement("div");

    contentDiv.style.display = "none";
    contentDiv.classList.add("chat-message");
    contentDiv.setAttribute("aria-hidden", "true");
    contentDiv.id = options.id || "timelineDiv" + i++;
    contentDiv.dataset.senderId = options.senderId;

    let showHeader = true;
    const prevChat = target.lastElementChild;
    if (prevChat && prevChat.dataset.senderId === options.senderId) {
      showHeader = false;
    }

    if (showHeader) {
      const headerDiv = document.createElement("div");
      headerDiv.classList.add("chat-header");

      const userDiv = document.createElement("div");
      userDiv.classList.add("chat-user");
      userDiv.textContent = options.name;
      headerDiv.appendChild(userDiv);

      const timeDiv = document.createElement("div");
      timeDiv.classList.add("chat-timestamp");
      timeDiv.textContent = formatTimestamp(options.start);
      headerDiv.appendChild(timeDiv);

      contentDiv.appendChild(headerDiv);
    }

    if (options.replyToMessageId && options.replyToMessageId !== "") {
      const replyToContent = document.getElementById(options.replyToMessageId);
      if (replyToContent) {
        const replyTextDiv = replyToContent.querySelector(".chat-text");
        const replyDiv = document.createElement("div");
        replyDiv.classList.add("chat-reply");
        for (const childNode of replyTextDiv.childNodes) {
          replyDiv.appendChild(childNode.cloneNode(true));
        }
        if (replyTextDiv.classList.contains("chat-emphasized-text")) {
          replyDiv.classList.add("chat-emphasized-text");
        }
        contentDiv.appendChild(replyDiv);
      }
    }

    const messageDiv = document.createElement("div");
    messageDiv.classList.add("chat-text");
    if (options.chatEmphasizedText === "true") { messageDiv.classList.add("chat-emphasized-text"); }
    messageDiv.innerHTML = options.message;
    for (const link of messageDiv.querySelectorAll("a")) {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "nofollow noreferrer");
    }
    contentDiv.appendChild(messageDiv);

    if (options.reactions) {
      const reactionsDiv = document.createElement("div");
      reactionsDiv.classList.add("chat-reactions");
      contentDiv.appendChild(reactionsDiv);

      const reactions = JSON.parse(options.reactions);
      for (const [emoji, count] of Object.entries(reactions)) {
        const reactionDiv = document.createElement("div");
        reactionDiv.classList.add("chat-reaction");
        reactionDiv.textContent = emoji + " " + count;
        reactionsDiv.appendChild(reactionDiv);
      }
    }

    target.appendChild(contentDiv);
    return contentDiv;
  }

  Popcorn.plugin("chattimeline", function(options) {
    const target = document.getElementById(options.target);
    const contentDiv = renderChatContent(options);

    return {
      start: function(_event, _options) {
        contentDiv.style.display = "block";
        if (document.getElementById("exposechat").checked) {
          contentDiv.setAttribute('aria-hidden', false);
        }
        contentDiv.scrollIntoView({ behavior: "smooth", block: "end" })
      },
      end: function(_event, _options) {
        contentDiv.style.display = "none";
        contentDiv.setAttribute('aria-hidden', true);
      },
    };
  },
  {
    options: {
      start: {
        elem: "input",
        type: "number",
        label: "Start"
      },
      end: {
        elem: "input",
        type: "number",
        label: "End"
      },
      target: "feed-container",
      name: {
        elem: "input",
        type: "text",
        label: "Name"
      },
      message: {
        elem: "input",
        type: "text",
        label: "Message"
      },
      direction: {
        elem: "select",
        options: [ "DOWN", "UP" ],
        label: "Direction",
        optional: true
      }
    }
  });
})(Popcorn);
