import React from 'react';
import { useSubscription } from '@apollo/client';
import SettingsService from '/imports/ui/services/settings';
import Cursors from './component';
import Service from './service';
import { CURSOR_SUBSCRIPTION } from './queries';
import { omit } from 'radash';

const CursorsContainer = (props) => {
  const { data: cursorData } = useSubscription(CURSOR_SUBSCRIPTION);
  const { pres_page_cursor: cursorArray } = (cursorData || []);

  if (!cursorData) return null;

  return (
    <Cursors 
      {...{
        application: SettingsService?.application,
        publishCursorUpdate: Service.publishCursorUpdate,
        otherCursors: cursorArray,
        currentPoint: props.tldrawAPI?.currentPoint,
        tldrawCamera: props.tldrawAPI?.getPageState().camera,
      }}
      {...omit(props, ['tldrawAPI'])}
    />
  )
};

export default CursorsContainer;
