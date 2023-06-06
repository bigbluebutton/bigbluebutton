import changeLayout from '../modifiers/changeLayout';

export default async function broadcastLayout({ body }, meetingId) {
  const {
    layout,
    presentationIsOpen,
    isResizing,
    cameraPosition,
    focusedCamera,
    presentationVideoRate,
    pushLayout,
    setByUserId,
  } = body;

  const result = await changeLayout(
    meetingId,
    layout,
    presentationIsOpen,
    isResizing,
    cameraPosition,
    focusedCamera,
    presentationVideoRate,
    pushLayout,
    setByUserId,
  );
  return result;
}
