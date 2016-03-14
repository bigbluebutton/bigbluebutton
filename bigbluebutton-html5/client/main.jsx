import {UserListContainer} from './imports/react/components/UserList/UserListContainer.jsx';

let loadLib;

// Helper to load javascript libraries from the BBB server
loadLib = function (libname) {
  let retryMessageCallback, successCallback;
  successCallback = function () {};

  retryMessageCallback = function (param) {
    return console.log('Failed to load library', param);
  };

  return Meteor.Loader.loadJs(`${window.location.origin}/client/lib/${libname}`, successCallback, 10000).fail(retryMessageCallback);
};

// These settings can just be stored locally in session, created at start up
Meteor.startup(() => {
  // Load SIP libraries before the application starts
  loadLib('sip.js');
  loadLib('bbb_webrtc_bridge_sip.js');
  loadLib('bbblogger.js');
  return this.SessionAmplify = _.extend({}, Session, {
    keys: _.object(_.map(amplify.store.sessionStorage(), (value, key) => {
      return [key, JSON.stringify(value)];
    })),
    set(key, value) {
      Session.set.apply(this, arguments);
      amplify.store.sessionStorage(key, value);
    },
  });
});

//
Template.header.events({
  'click .chatBarIcon'(event) {
    $('.tooltip').hide();
    return toggleChatbar();
  },

  'click .hideNavbarIcon'(event) {
    $('.tooltip').hide();
    return toggleNavbar();
  },

  'click .leaveAudioButton'(event) {
    return exitVoiceCall(event);
  },

  'click .muteIcon'(event) {
    $('.tooltip').hide();
    return toggleMic(this);
  },

  'click .hideNavbarIcon'(event) {
    $('.tooltip').hide();
    return toggleNavbar();
  },

  'click .videoFeedIcon'(event) {
    $('.tooltip').hide();
    return toggleCam(this);
  },

  'click .toggleUserlistButton'(event) {
    if (isLandscape() || isLandscapeMobile()) {
      return toggleUsersList();
    } else {
      if ($('.settingsMenu').hasClass('menuOut')) {
        toggleSettingsMenu();
      } else {
        toggleShield();
      }

      return toggleUserlistMenu();
    }
  },

  'click .toggleMenuButton'(event) {
    if ($('.userlistMenu').hasClass('menuOut')) {
      toggleUserlistMenu();
    } else {
      toggleShield();
    }

    $('.toggleMenuButton').blur();
    return toggleSettingsMenu();
  },

  'click .btn'(event) {
    return $('.ui-tooltip').hide();
  },
});

Template.menu.events({
  'click .slideButton'(event) {
    toggleShield();
    toggleSettingsMenu();
    return $('.slideButton').blur();
  },

  'click .toggleChatButton'(event) {
    return toggleChatbar();
  },
});

Template.main.rendered = function () {
  ReactDOM.render(<UserListContainer />, document.getElementById('user-contents'));

  let lastOrientationWasLandscape;
  $('#dialog').dialog({
    modal: true,
    draggable: false,
    resizable: false,
    autoOpen: false,
    dialogClass: 'no-close logout-dialog',
    buttons: [
      {
        text: 'Yes',
        click: function () {
          userLogout(BBB.getMeetingId(), getInSession('userId'), true);
          return $(this).dialog('close');
        },

        class: 'btn btn-xs btn-primary active',
      }, {
        text: 'No',
        click: function () {
          $(this).dialog('close');
          return $('.tooltip').hide();
        },

        class: 'btn btn-xs btn-default',
      },
    ],
    open(event, ui) {
      return $('.ui-widget-overlay').bind('click', () => {
        if (isMobile()) {
          return $('#dialog').dialog('close');
        }
      });
    },

    position: {
      my: 'right top',
      at: 'right bottom',
      of: '.signOutIcon',
    },
  });
  lastOrientationWasLandscape = isLandscape();
  $(window).resize(() => {
    $('#dialog').dialog('close');

    // when the orientation switches call the handler
    if (isLandscape() && !lastOrientationWasLandscape) {
      orientationBecameLandscape();
      return lastOrientationWasLandscape = true;
    } else if (isPortrait() && lastOrientationWasLandscape) {
      orientationBecamePortrait();
      return lastOrientationWasLandscape = false;
    }
  });
  $('#shield').click(() => {
    return toggleSlidingMenu();
  });
  if (Meteor.config.app.autoJoinAudio) {
    if (Meteor.config.app.skipCheck) {
      return joinVoiceCall(this, {
        isListenOnly: Meteor.config.app.listenOnly,
      });
    } else {
      $('#settingsModal').foundation('reveal', 'open');
      if (Meteor.config.app.listenOnly) {
        return $('#joinMicrophone').prop('disabled', true);
      }
    }
  }
};

Template.main.events({
  'click .shield'(event) {
    $('.tooltip').hide();
    toggleShield();
    return closeMenus();
  },

  'click .settingsIcon'(event) {
    return $('#settingsModal').foundation('reveal', 'open');
  },

  'click .signOutIcon'(event) {
    $('.signOutIcon').blur();
    return $('#logoutModal').foundation('reveal', 'open');
  },
});

Template.main.gestures({
  'panstart #container'(event, template) {
    let initTransformValue, menuPanned, panIsValid, screenWidth;
    if (isPortraitMobile() && isPanHorizontal(event)) {
      panIsValid = getInSession('panIsValid');
      initTransformValue = getInSession('initTransform');
      menuPanned = getInSession('menuPanned');
      screenWidth = $('#container').width();
      setInSession('panStarted', true);
      if (panIsValid && menuPanned === 'left' && initTransformValue + event.deltaX >= 0 && initTransformValue + event.deltaX <= $('.left-drawer').width()) {
        return $('.left-drawer').css('transform', `translateX(${initTransformValue + event.deltaX}px)`);
      } else if (panIsValid && menuPanned === 'right' && initTransformValue + event.deltaX >= screenWidth - $('.right-drawer').width() && initTransformValue + event.deltaX <= screenWidth) {
        return $('.right-drawer').css('transform', `translateX(${initTransformValue + event.deltaX}px)`);
      }
    }
  },

  'panend #container'(event, template) {
    let leftDrawerWidth, menuPanned, panIsValid, screenWidth;
    if (isPortraitMobile()) {
      panIsValid = getInSession('panIsValid');
      menuPanned = getInSession('menuPanned');
      leftDrawerWidth = $('.left-drawer').width();
      screenWidth = $('#container').width();
      setInSession('panStarted', false);
      if (panIsValid && menuPanned === 'left' && $('.left-drawer').css('transform') !== 'none') {
        if (parseInt($('.left-drawer').css('transform').split(',')[4]) < leftDrawerWidth / 2) {
          $('.shield').removeClass('animatedShield');
          $('.shield').css('opacity', '');
          $('.left-drawer').removeClass('menuOut');
          $('.left-drawer').css('transform', '');
          $('.toggleUserlistButton').removeClass('menuToggledOn');
          $('.shield').removeClass('darken');
        } else {
          $('.left-drawer').css('transform', `translateX(${leftDrawerWidth}px)`);
          $('.shield').css('opacity', 0.5);
          $('.left-drawer').addClass('menuOut');
          $('.left-drawer').css('transform', '');
          $('.toggleUserlistButton').addClass('menuToggledOn');
        }
      }

      if (panIsValid && menuPanned === 'right' && parseInt($('.right-drawer').css('transform').split(',')[4]) !== leftDrawerWidth) {
        if (parseInt($('.right-drawer').css('transform').split(',')[4]) > screenWidth - $('.right-drawer').width() / 2) {
          $('.shield').removeClass('animatedShield');
          $('.shield').css('opacity', '');
          $('.right-drawer').css('transform', `translateX(${screenWidth}px)`);
          $('.right-drawer').removeClass('menuOut');
          $('.right-drawer').css('transform', '');
          $('.toggleMenuButton').removeClass('menuToggledOn');
          $('.shield').removeClass('darken'); // in case it was opened by clicking a button
        } else {
          $('.shield').css('opacity', 0.5);
          $('.right-drawer').css('transform', `translateX(${screenWidth - $('.right-drawer').width()}px)`);
          $('.right-drawer').addClass('menuOut');
          $('.right-drawer').css('transform', '');
          $('.toggleMenuButton').addClass('menuToggledOn');
        }
      }

      $('.left-drawer').addClass('userlistMenu');
      $('.userlistMenu').removeClass('left-drawer');
      $('.right-drawer').addClass('settingsMenu');
      return $('.settingsMenu').removeClass('right-drawer');
    }
  },

  'panright #container, panleft #container'(event, template) {
    let initTransformValue, leftDrawerWidth, menuPanned, panIsValid, rightDrawerWidth, screenWidth;
    if (isPortraitMobile() && isPanHorizontal(event)) {

      // panright/panleft is always triggered once right before panstart
      if (!getInSession('panStarted')) {

        // opening the left-hand menu
        if (event.type === 'panright' && event.center.x <= $('#container').width() * 0.1) {
          setInSession('panIsValid', true);
          setInSession('menuPanned', 'left');

        // closing the left-hand menu
        } else if (event.type === 'panleft' && event.center.x < $('#container').width() * 0.9) {
          setInSession('panIsValid', true);
          setInSession('menuPanned', 'left');

        // opening the right-hand menu
        } else if (event.type === 'panleft' && event.center.x >= $('#container').width() * 0.9) {
          setInSession('panIsValid', true);
          setInSession('menuPanned', 'right');

        // closing the right-hand menu
        } else if (event.type === 'panright' && event.center.x > $('#container').width() * 0.1) {
          setInSession('panIsValid', true);
          setInSession('menuPanned', 'right');
        } else {
          setInSession('panIsValid', false);
        }

        setInSession('eventType', event.type);
        if (getInSession('menuPanned') === 'left') {
          if ($('.userlistMenu').css('transform') !== 'none') { // menu is already transformed
            setInSession(
              'initTransform',
              parseInt($('.userlistMenu').css('transform').split(',')[4])
            ); // translateX value
          } else if ($('.userlistMenu').hasClass('menuOut')) {
            setInSession('initTransform', $('.userlistMenu').width());
          } else {
            setInSession('initTransform', 0);
          }

          $('.userlistMenu').addClass('left-drawer');
          $('.left-drawer').removeClass('userlistMenu');
        } else if (getInSession('menuPanned') === 'right') {
          if ($('.settingsMenu').css('transform') !== 'none') { // menu is already transformed
            setInSession(
              'initTransform',
              parseInt($('.settingsMenu').css('transform').split(',')[4])
            ); // translateX value
          } else if ($('.settingsMenu').hasClass('menuOut')) {
            setInSession('initTransform', $('.settingsMenu').width());
          } else {
            setInSession('initTransform', 0);
          }

          $('.settingsMenu').addClass('right-drawer');
          $('.right-drawer').removeClass('settingsMenu');
        }
      }

      initTransformValue = getInSession('initTransform');
      panIsValid = getInSession('panIsValid');
      menuPanned = getInSession('menuPanned');
      leftDrawerWidth = $('.left-drawer').width();
      rightDrawerWidth = $('.right-drawer').width();
      screenWidth = $('#container').width();

      // moving the left-hand menu
      if (panIsValid &&
        menuPanned === 'left' &&
        initTransformValue + event.deltaX >= 0 &&
        initTransformValue + event.deltaX <= leftDrawerWidth) {
        if ($('.settingsMenu').hasClass('menuOut')) {
          toggleSettingsMenu();
        }

        $('.left-drawer').css('transform', `translateX(${initTransformValue + event.deltaX}px)`);
        if (!getInSession('panStarted')) {
          $('.shield').addClass('animatedShield');
        }

        return $('.shield').css('opacity', 0.5 * (initTransformValue + event.deltaX) / leftDrawerWidth);
      } else if (panIsValid &&
        menuPanned === 'right' &&
        initTransformValue + event.deltaX >= screenWidth - rightDrawerWidth &&
        initTransformValue + event.deltaX <= screenWidth) { // moving the right-hand menu
        if ($('.userlistMenu').hasClass('menuOut')) {
          toggleUserlistMenu();
        }

        $('.right-drawer').css('transform', `translateX(${initTransformValue + event.deltaX}px)`);
        if (!getInSession('panStarted')) {
          $('.shield').addClass('animatedShield');
        }

        return $('.shield').css('opacity', 0.5 * (screenWidth - initTransformValue - event.deltaX) / rightDrawerWidth);
      }
    }
  },
});

Template.makeButton.rendered = function () {
  return $('button[rel=tooltip]').tooltip();
};
