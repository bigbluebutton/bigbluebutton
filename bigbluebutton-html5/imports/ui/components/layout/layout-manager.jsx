import React, { useEffect, Fragment } from 'react';
import { withLayoutContext } from './context';
import Storage from '/imports/ui/services/storage/session';

const windowWidth = () => window.innerWidth;
const min = (value1, value2) => (value1 <= value2 ? value1 : value2);
const max = (value1, value2) => (value1 >= value2 ? value1 : value2);

const USERLIST_MIN_WIDTH = 150;
const USERLIST_MAX_WIDTH = 250;
const CHAT_MIN_WIDTH = 150;
const CHAT_MAX_WIDTH = 350;

const storageLayoutData = () => Storage.getItem('layoutData');

const calculaLayout = () => {
  const userListSize = {
    width: min(max((windowWidth() * 0.1), USERLIST_MIN_WIDTH), USERLIST_MAX_WIDTH),
  };
  const chatSize = {
    width: min(max((windowWidth() * 0.2), CHAT_MIN_WIDTH), CHAT_MAX_WIDTH),
  };
  const webcamsAreaSize = {
    width: windowWidth() - (userListSize.width + chatSize.width),
  };
  const presentationAreaSize = {
    width: windowWidth() - (userListSize.width + chatSize.width),
  };
  return {
    userListSize,
    chatSize,
    webcamsAreaSize,
    presentationAreaSize,
  };
};

const setInitialValues = (props) => {
  const { layoutContextDispatch } = props;
  const layoutSizes = calculaLayout();

  let userListWidth;
  let chatWidth;
  let webcamsAreaWidth;
  let presentationAreaWidth;
  let storageWindowWidth;

  if (storageLayoutData()) {
    storageWindowWidth = storageLayoutData().windowSize.width;
    userListWidth = storageLayoutData().userListSize.width;
    chatWidth = storageLayoutData().chatSize.width;
    webcamsAreaWidth = storageLayoutData().webcamsAreaSize.width;
    presentationAreaWidth = storageLayoutData().presentationAreaSize.width;
  }

  userListWidth = !userListWidth || userListWidth === 0 || windowWidth() !== storageWindowWidth
    ? layoutSizes.userListSize.width
    : userListWidth;

  chatWidth = !chatWidth || chatWidth === 0 || windowWidth() !== storageWindowWidth
    ? layoutSizes.chatSize.width
    : chatWidth;

  webcamsAreaWidth = !webcamsAreaWidth
    || webcamsAreaWidth === 0
    || windowWidth() !== storageWindowWidth
    ? windowWidth() - (userListWidth + chatWidth)
    : webcamsAreaWidth;

  presentationAreaWidth = !presentationAreaWidth
    || presentationAreaWidth === 0
    || windowWidth() !== storageWindowWidth
    ? windowWidth() - (userListWidth + chatWidth)
    : presentationAreaWidth;

  layoutContextDispatch(
    {
      type: 'setUserListSize',
      value: {
        width: userListWidth,
      },
    },
  );

  layoutContextDispatch(
    {
      type: 'setChatSize',
      value: {
        width: chatWidth,
      },
    },
  );
  layoutContextDispatch(
    {
      type: 'setWebcamsAreaSize',
      value: {
        width: webcamsAreaWidth,
      },
    },
  );
  layoutContextDispatch(
    {
      type: 'setPresentationAreaSize',
      value: {
        width: presentationAreaWidth,
      },
    },
  );

  const newLayoutData = () => (
    {
      windowSize: {
        width: windowWidth(),
      },
      userListSize: {
        width: userListWidth,
      },
      chatSize: {
        width: chatWidth,
      },
      webcamsAreaSize: {
        width: webcamsAreaWidth,
        height: 0,
      },
      presentationAreaSize: {
        width: presentationAreaWidth,
        height: 0,
      },
    }
  );

  Storage.setItem('layoutData', newLayoutData());
};

const LayoutManager = (props) => {
  useEffect(() => {
    setInitialValues(props);
  }, []);

  return (<Fragment />);
};

export default withLayoutContext(LayoutManager);
