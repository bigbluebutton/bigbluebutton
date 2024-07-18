import { User } from '../../video-provider/types';

const windowParams = [
  'scrollbars=no',
  'resizable=no',
  'status=no',
  'location=no',
  'toolbar=no',
  'menubar=no',
  'width=640',
  'height=480',
  'left=100',
  'top=100',
];

const bodyStyle = [
  'margin:0',
  'background:#000',
];

const mediaStyle = [
  'width:100%',
  'height:100%',
  'background:#000',
];

const getMediaStream = (element: Element) => {
  if (!element) return null;

  const videos = element.getElementsByTagName('video');
  const video = videos.length > 0 ? videos.item(0) : null;

  if (!video) return null;

  return video.srcObject;
};

const togglePopout = (ref: HTMLDivElement | null, windowName: string, elementName: string) => {
  if (!ref) return null;

  const mediaStream = getMediaStream(ref) as MediaStream;
  if (!mediaStream) return null;

  const popout = window.open('', windowName, windowParams.join(','));
  if (!popout) return null;

  popout.document.title = elementName;
  popout.document.body.style.cssText = bodyStyle.join(';');

  const video = document.createElement('video');
  video.style.cssText = mediaStyle.join(';');
  video.muted = true;
  video.playsInline = true;
  video.autoplay = true;
  const clonedMediaStream = mediaStream.clone();
  // Audio streams are still active in the parent window - no need to use
  // them. Also: trying to play them on Chrome was triggering
  // a SIGSEGV on both child and parent tabs :)
  const videoTracksOnlyStream = new MediaStream(clonedMediaStream.getVideoTracks());
  video.srcObject = videoTracksOnlyStream;

  // [HACK] Unmaximized parent window issue
  // Confirmed in Linux Firefox 83.0
  // If the main window (client) is not maximized, the media's play won't
  // resolve it's Promise call and the video just gets stuck at the new window
  setTimeout(() => {
    if (popout) {
      popout.document.body.appendChild(video);
      popout.focus();
    }
  }, 250);
  // TODO: Check if there is some sort of event that can be listened
  // and replace the timeout method above

  return popout;
};

const isEnabled = (currentUser: Partial<User> | null) => {
  const ENABLED = window.meetingClientSettings.public.app.allowPopout;

  return ENABLED && (currentUser && !currentUser.mobile);
};

export default {
  isEnabled,
  togglePopout,
};
