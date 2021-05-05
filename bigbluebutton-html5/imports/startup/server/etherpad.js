const INSTANCE_ID_REGEX = /\d+/;

const isPadMessage = (message) => {
 const { name } = message.core.header;

  const isPadCreate = name === 'PadCreateSysMsg';
  const isPadUpdate = name === 'PadUpdateSysMsg';

  return isPadCreate || isPadUpdate;
};

const getInstanceIdFromPadMessage = (message) => {
  let instanceId;
  const { id } = message.core.body.pad;

  // Pad id is composed by the instance id between brackets
  const match = id.match(INSTANCE_ID_REGEX);
  if (match) instanceId = parseInt(match[0]);

  return instanceId;
};

export {
  isPadMessage,
  getInstanceIdFromPadMessage,
};
