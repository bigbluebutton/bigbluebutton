import RedisPubSub from '/imports/startup/server/redis';
import handleUserSharedHtml5Webcam from './handlers/userSharedHtml5Webcam';
import handleUserUnsharedHtml5Webcam from './handlers/userUnsharedHtml5Webcam';

RedisPubSub.on('user_shared_html5_webcam_message', handleUserSharedHtml5Webcam);
RedisPubSub.on('user_unshared_html5_webcam_message', handleUserUnsharedHtml5Webcam);
