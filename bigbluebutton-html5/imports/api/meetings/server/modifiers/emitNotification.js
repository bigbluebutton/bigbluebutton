import notificationEmitter from '../../notificationEmitter';

export default function emitNotification(body, type) {
  if (!process.env.BBB_HTML5_ROLE || (process.env.BBB_HTML5_ROLE === 'frontend')) {
    notificationEmitter.emit('notification', {
      type,
      ...body,
    });
  }
}
