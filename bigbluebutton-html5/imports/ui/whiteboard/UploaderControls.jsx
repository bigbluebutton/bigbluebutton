import React from 'react';
import classNames from 'classnames';
import { Button } from '../shared/Button.jsx';
import { PresentationList } from './PresentationList.jsx';

export let UploaderControls = React.createClass({
  getDefaultProps: function () {
    return {
      isOpen: new ReactiveVar(false),
      files: new ReactiveList({
        sort(a, b) {
          // Put the ones who still uploading first
          let ref, ref1;
          return (ref = a.isUploading === b.isUploading) != null ? ref : {
            0: (ref1 = a.isUploading) != null ? ref1 : -{
              1: 1,
            },
          };
        },
      }),
    };
  },

  mixins: [ReactMeteorData],
  getMeteorData() {
    let presentations;
    presentations = Meteor.Presentations.find({}, {
      sort: {
        'presentation.current': -1,
        'presentation.name': 1,
      },
      fields: {
        presentation: 1,
      },
    }).fetch();

    return {
      presentations: presentations,
    };
  },

  fakeUpload(file, list) {
    return setTimeout((() => {
      file.uploadedSize = file.uploadedSize + (Math.floor(Math.random() * file.size + file.uploadedSize) / 10);
      file.percUploaded = Math.round((file.uploadedSize / file.size) * 100) + '%';
      if (!(file.size > file.uploadedSize)) {
        file.uploadedSize = file.size;
        file.isUploading = false;
      }

      list.update(file.name, file);
      this.forceUpdate();
      if (file.isUploading === true) {
        return this.fakeUpload(file, list);
      } else {
        list.remove(file.name); // TODO: Here we should remove and update te presentation on mongo
        this.forceUpdate();
        return;
      }
    }), 200);
  },

  isOpen() {
    return this.props.isOpen.get() ? 'is-open' : '';
  },

  files() {
    return this.props.files ? this.props.files.fetch() : null;
  },

  presentations() {
    return this.data.presentations.map(x => {
      return x.presentation;
    });
  },

  handleInput(event) {
    let files;
    event.preventDefault();
    files = (event.dataTransfer || event.target).files;
    return _.each(files, file => {
      file.isUploading = true;
      file.uploadedSize = 0;
      file.percUploaded = '0';
      this.props.files.insert(file.name, file);
      return this.fakeUpload(file, this.props.files);
    });
  },

  handleDragLeave(event) {
    event.preventDefault();
    return $(event.currentTarget).removeClass('hover');
  },

  handleDragOver(event) {
    event.preventDefault();
    $(event.currentTarget).addClass('hover');
  },

  handleClose() {
    this.props.isOpen.set(false);
    this.forceUpdate();
  },

  handleOpen() {
    this.props.isOpen.set(true);
    this.forceUpdate();
  },

  render() {
    return (
      <div className={classNames('presenter-uploader-control', this.isOpen() ? 'is-open' : '')} >
        <div className="presenter-uploader-container">
          <PresentationList files={this.files()} presentations={this.presentations()} />
          <div onDrop={this.handleInput} onDragOver={this.handleDragOver} onDragLeave={this.handleDragLeave} className="presenter-uploader-dropzone" data-dropzone>
            <input onChange={this.handleInput} type="file" className="presenter-uploader-dropzone-fileinput" multiple />
            <i className="presenter-uploader-dropzone-icon ion-archive"></i>
            <span className="presenter-uploader-dropzone-label">Drop files here <br/>or click to upload</span>
          </div>
          <Button onClick={this.handleClose} btn_class=" presenter-uploader-control-btn js-close" i_class="ion-ios-close-outline"/>
          <div className="presenter-uploader-tip">
            UPLOAD ANY OFFICE DOCUMENT OR PORTABLE DOCUMENT FORMAT (PDF) FILE.
            <br/>
            FOR BEST RESULTS UPLOAD PDF.
          </div>
        </div>
        <Button onClick={this.handleOpen} btn_class=" presenter-uploader-control-btn js-open" i_class="ion-ios-upload-outline"/>
      </div>
    );
  },
});
