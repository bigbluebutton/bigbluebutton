import { OVERFLOWED_ATTRIBUTE } from '/imports/ui/components/common/bar-overflow/service';
import { ACTIONS_BAR_OVERFLOW_BUTTON_ID } from '/imports/ui/components/actions-bar/service';

const getInteractionsButtonCoordinates = () => {
  const el = document.getElementById('interactionsButton');

  if (!el) return null;

  // A collapsed reactions button stays mounted out of sight; the rain starts from the overflow
  // button that holds it instead.
  const origin = el.closest(`[${OVERFLOWED_ATTRIBUTE}]`)
    ? document.querySelector(`[data-overflow-item="${ACTIONS_BAR_OVERFLOW_BUTTON_ID}"]`) ?? el
    : el;

  const coordinate = origin.getBoundingClientRect();

  return coordinate;
};

export default {
  getInteractionsButtonCoordinates,
};
