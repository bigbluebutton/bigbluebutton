import { PresPresentation } from '/imports/ui/Types/presentation';

function checkSamePresentation(pres1: PresPresentation, pres2: PresPresentation) {
  return pres1.presentationId === pres2.presentationId
    || (pres1.uploadTemporaryId
      && pres2.uploadTemporaryId
      && pres1.uploadTemporaryId === pres2.uploadTemporaryId);
}

export default checkSamePresentation;
