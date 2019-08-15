responses = {};
responses.failure = (key, msg) =>
  `<response> \
<returncode>FAILED</returncode> \
<messageKey>${key}</messageKey> \
<message>${msg}</message> \
</response>`
;
responses.checksumError =
  responses.failure("checksumError", "You did not pass the checksum security check.");

responses.createSuccess = (id, permanent, getRaw) =>
  `<response> \
<returncode>SUCCESS</returncode> \
<hookID>${id}</hookID> \
<permanentHook>${permanent}</permanentHook> \
<rawData>${getRaw}</rawData> \
</response>`
;
responses.createFailure =
  responses.failure("createHookError", "An error happened while creating your hook. Check the logs.");
responses.createDuplicated = id =>
  `<response> \
<returncode>SUCCESS</returncode> \
<hookID>${id}</hookID> \
<messageKey>duplicateWarning</messageKey> \
<message>There is already a hook for this callback URL.</message> \
</response>`
;

responses.destroySuccess =
  `<response> \
<returncode>SUCCESS</returncode> \
<removed>true</removed> \
</response>`;
responses.destroyFailure =
  responses.failure("destroyHookError", "An error happened while removing your hook. Check the logs.");
responses.destroyNoHook =
  responses.failure("destroyMissingHook", "The hook informed was not found.");

responses.missingParamCallbackURL =
  responses.failure("missingParamCallbackURL", "You must specify a callbackURL in the parameters.");
responses.missingParamHookID =
  responses.failure("missingParamHookID", "You must specify a hookID in the parameters.");

module.exports = responses;
