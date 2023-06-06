import React from 'react';
import GoogleDriveUploader from './GoogleDriveUploader';
import DropboxUploader from './DropboxUploader';

function CloudUploader({ onSelectFiles }) {
  return (
    <div
      style={{
        padding: '20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      <h2>Or choose files from</h2>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 30,
      }}
      >
        <GoogleDriveUploader onSelectFiles={onSelectFiles} />
        <DropboxUploader onSelectFiles={onSelectFiles} />
      </div>
    </div>
  );
}

export default CloudUploader;
