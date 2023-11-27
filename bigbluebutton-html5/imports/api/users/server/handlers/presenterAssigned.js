import changePresenter from '/imports/api/users/server/modifiers/changePresenter';

export default async function handlePresenterAssigned({ body }, meetingId) {
  const { presenterId, assignedBy } = body;

  await changePresenter(true, presenterId, meetingId, assignedBy);
}
