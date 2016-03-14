UploadingFileListItem = React.createClass ({
  percUploaded() {
    return Math.round((this.uploadedSize / this.size) * 100);
  },

  render() {
    <li class="presenter-uploader-file-item is-uploading">
      <span class="presenter-uploader-file-item-name">
        {this.props.name}
      </span>
      <span class="presenter-uploader-file-item-progress">
        {percUploaded}%
      </span>
    </li>
  }
});