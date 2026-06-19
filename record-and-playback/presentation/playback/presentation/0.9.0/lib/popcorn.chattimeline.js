// Sanitize HTML to allow only safe tags and attributes, preventing XSS
function sanitizeChatHTML(html) {
  var temp = document.createElement('div');
  temp.innerHTML = html;
  var allowedTags = ['a', 'br'];
  var allowedAttrs = { 'a': ['href', 'target', 'rel'] };
  function sanitize(node) {
    var children = Array.from(node.childNodes);
    for (var c = 0; c < children.length; c++) {
      var child = children[c];
      if (child.nodeType === 1) {
        if (allowedTags.indexOf(child.tagName.toLowerCase()) === -1) {
          node.replaceChild(document.createTextNode(child.textContent), child);
        } else {
          var tagAttrs = allowedAttrs[child.tagName.toLowerCase()] || [];
          var attrs = Array.from(child.attributes);
          for (var a = 0; a < attrs.length; a++) {
            if (tagAttrs.indexOf(attrs[a].name.toLowerCase()) === -1) {
              child.removeAttribute(attrs[a].name);
            }
          }
          if (child.hasAttribute('href')) {
            var href = child.getAttribute('href').replace(/\s/g, '').toLowerCase();
            if (href.startsWith('javascript:') || href.startsWith('data:')) {
              child.removeAttribute('href');
            }
          }
          sanitize(child);
        }
      }
    }
  }
  sanitize(temp);
  return temp.innerHTML;
}

// PLUGIN: Timeline
(function ( Popcorn ) {

  /**
     * chat-timeline popcorn plug-in
     * Adds data associated with a certain time in the video, which creates a scrolling view of each item as the video progresses
     * Options parameter will need a start, target, title, and text
     * -Start is the time that you want this plug-in to execute
     * -End is the time that you want this plug-in to stop executing, tho for this plugin an end time may not be needed ( optional )
     * -Target is the id of the DOM element that you want the timeline to appear in. This element must be in the DOM
     * -Name is the name of the current chat message sender
     * -Text is text is simply related text that will be displayed
     * -direction specifies whether the timeline will grow from the top or the bottom, receives input as "UP" or "DOWN"
     * @param {Object} options
     *
     * Example:
      var p = Popcorn("#video")
        .timeline( {
         start: 5, // seconds
         target: "timeline",
         name: "Seneca",
         text: "Welcome to seneca",
      } )
    *
  */

  var i = 1;

  Popcorn.plugin( "chattimeline" , function( options ) {

    var target = document.getElementById( options.target ),
        contentDiv = document.createElement( "div" ),
        goingUp = true;

    contentDiv.style.display = "none";
    contentDiv.setAttribute('aria-hidden', true);
    contentDiv.id = "timelineDiv" + i;

    //  Default to up if options.direction is non-existant or not up or down
    options.direction = options.direction || "up";
    if ( options.direction.toLowerCase() === "down" ) {

      goingUp = false;
    }

    if ( target ) {
      // if this isnt the first div added to the target div
      if( goingUp ){
        // insert the current div before the previous div inserted
        target.insertBefore( contentDiv, target.firstChild );
      }
      else {

        target.appendChild( contentDiv );
      }

    }

    i++;

    var nameEl = document.createElement('strong');
    nameEl.textContent = options.name + ':';
    contentDiv.appendChild(nameEl);
    var msgEl = document.createElement('span');
    msgEl.innerHTML = sanitizeChatHTML(options.message);
    //If chat message contains a link, we add to it a target attribute
    //So when the user clicks on it, it opens in a new tab
    $(msgEl).find('a').attr('target', '_blank');
    contentDiv.appendChild(msgEl);

    return {

      start: function( event, options ) {
        contentDiv.style.display = "block";
        if ($("#exposechat").is(':checked')) {
          contentDiv.setAttribute('aria-hidden', false);
        }
        if( options.direction === "down" ) {
          target.scrollTop = target.scrollHeight;
        }
	
        if ($("#accEnabled").is(':checked'))
          addTime(7);
      },

      end: function( event, options ) {
        contentDiv.style.display = "none";
        contentDiv.setAttribute('aria-hidden', true);
      },

      _teardown: function( options ) {

        ( target && contentDiv ) && target.removeChild( contentDiv ) && !target.firstChild
      }
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

})( Popcorn );
