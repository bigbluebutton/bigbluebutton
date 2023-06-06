import React, { useRef } from 'react';
import { toast } from 'react-toastify';
import Icon from '/imports/ui/components/common/icon/component';
import { canOpenDropbox } from 'react-cloud-chooser';
import { CircularProgress } from '@material-ui/core';
import { Meteor } from 'meteor/meteor';

const DropboxBtn = ({ openDropbox, isDropboxLoading }) => {
  const BASE_NAME = Meteor.settings.public.app.basename;
  const ICONS_PATH = `${BASE_NAME}/resources/images/icons`;
  return (
    <div
      onClick={openDropbox}
      style={{
        borderRadius: 5,
        backgroundColor: '#f1f1f1',
        cursor: 'pointer',
      }}
    >
      <img src={`${ICONS_PATH}/dropbox.jpg`} alt="Dropbox" width={100} height={100} style={{ objectFit: 'contain' }} />
    </div>
  );
};

const DropboxOpenBtn = canOpenDropbox(DropboxBtn);

const DropboxUploader = ({ onSelectFiles }) => {
  const DROPBOX_APP_KEY = Meteor.settings.public.app.dropboxAppKey;

  const toastId = useRef(null);
  const handleChooseFiles = async (files) => {
    const choosenFiles = files.map((file) => ({ url: file.link.replace('?dl=0', '?dl=1'), name: file.name }));
    toastId.current = toast.info(
      <div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <CircularProgress size={14} />
          <h3 style={{ marginLeft: 10 }}>Downloading files...</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {choosenFiles.map((file) => (
            <div
              style={{
                padding: '5px 0',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <Icon iconName="file" />
              <span>{file.name}</span>
            </div>
          ))}
        </div>
      </div>,
      {
        autoClose: false,
      },
    );
    const res = await onSelectFiles(choosenFiles);
    toast.info(res?.message, { autoClose: 3000 });
    toast.dismiss(toastId.current);
  };

  return <DropboxOpenBtn appKey={DROPBOX_APP_KEY} success={handleChooseFiles} extensions=".pdf,.docs,.doc,.ppt,.pptx" multiselect />;
};

export default DropboxUploader;
