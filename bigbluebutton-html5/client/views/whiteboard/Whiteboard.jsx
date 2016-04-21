import classNames from 'classnames';

Whiteboard = React.createClass({
  mixins: [ReactMeteorData],
  getMeteorData() {
    let poll_started, is_presenter, is_mobile, whiteboard_size;
    if(BBB.isPollGoing(getInSession('userId'))) {
      poll_started = true;
    } else {
      poll_started = false;
    }

    if(BBB.isUserPresenter(getInSession('userId'))) {
      is_presenter = true;
    } else {
      is_presenter = false;
    }

    is_mobile = isMobile();
    if(BBB.isUserPresenter(getInSession('userId'))) {
      whiteboard_size = 'presenter-whiteboard';
    } else {
    if(BBB.isPollGoing(getInSession('userId'))) {
      whiteboard_size = 'poll-whiteboard';
    } else {
      whiteboard_size = 'viewer-whiteboard';
    }
  }
    return {
      whiteboard_size: whiteboard_size,
      is_mobile: is_mobile,
      is_presenter: is_presenter,
      poll_started: poll_started,
    };
  },

  isPollStarted() {
    if(BBB.isPollGoing(getInSession('userId'))) {
      return true;
    } else {
      return false;
    }
  },

  componentDidMount() {
    $('#whiteboard').resizable({
      handles: 'e',
      minWidth: 150,
      resize() {
        return adjustChatInputHeight();
      },
      start() {
        if($('#chat').width() / $('#panels').width() > 0.2) { // chat shrinking can't make it smaller than one fifth of the whiteboard-chat area
          return $('#whiteboard').resizable('option', 'maxWidth', $('#panels').width() - 200); // gives the chat enough space (200px)
        } else {
          return $('#whiteboard').resizable('option', 'maxWidth', $('#whiteboard').width());
        }
      },
      stop() {
        $('#whiteboard').css('width', `${100 * $('#whiteboard').width() / $('#panels').width()}%`); // transforms width to %
        return $('#whiteboard').resizable('option', 'maxWidth', null);
      }
    });

    // whiteboard element needs to be available
    Meteor.NotificationControl = new NotificationControl('notificationArea');

    return $(document).foundation(); // initialize foundation javascript
  },
  
  handleWhiteboardFullScreen() {
    return enterWhiteboardFullscreen();
  },

  handleExitFullScreen() {
    if(document.exitFullscreen) {
      return document.exitFullscreen();
    } else if(document.mozCancelFullScreen) {
      return document.mozCancelFullScreen();
    } else if(document.webkitExitFullscreen) {
      return document.webkitExitFullscreen();
    }
  },

  isFullScreen() {
    if($( ".fullscreenButton" ).hasClass( "exitFullscreenButton" )) {
      return true;
    } else {
      return false;
    }
  },

  render() {
    return (
      <div id="whiteboard" className="component">
        <div id="whiteboard-container" className={ classNames(this.data.whiteboard_size) }>
          <Slide />
          <EmojiContainer />
          {this.data.is_mobile ?
            <Button onClick={this.isFullScreen() ? this.handleExitFullScreen : this.handleWhiteboardFullScreen} btn_class=" soaringButton fullscreenButton whiteboardFullscreenButton" i_class="ion-arrow-expand" />
          : null }
        </div>
        <div>
          {this.data.is_presenter ?
            <WhiteboardControls />
          : null }
          {this.data.poll_started ?
            <Polling/>
            : null }
        </div>
      </div>
    );
  }
});
