import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { defineMessages, useIntl } from 'react-intl';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import Auth from '/imports/ui/services/auth';
import TooltipContainer from '/imports/ui/components/common/tooltip/container';
import KEYS from '/imports/utils/keys';
import {
  SLIDE_THUMBNAILS_SUBSCRIPTION,
  SlideThumbnailsSubscriptionResponse,
} from './queries';
import Styled from './styles';

const intlMessages = defineMessages({
  goToSlide: {
    id: 'app.presentation.presentationToolbar.goToSlide',
    description: 'Label of a single slide in the slide picker',
  },
  selectLabel: {
    id: 'app.presentation.presentationToolbar.selectLabel',
    description: 'Slide picker tooltip and title',
  },
  skipSlideLabel: {
    id: 'app.presentation.presentationToolbar.skipSlideLabel',
    description: 'Aria label of the slide picker trigger',
  },
  slideCount: {
    id: 'app.presentation.presentationToolbar.slideCount',
    description: 'Number of slides in the presentation, shown in the slide picker',
  },
});

const VIEWPORT_MARGIN = 8;
const POPOVER_GAP = 8;
const POPOVER_MAX_WIDTH = 620;
const POPOVER_MAX_HEIGHT = 440;
const MIN_ROOM_ABOVE = 220;

interface PopoverPosition {
  left: number;
  width: number;
  maxHeight: number;
  top?: number;
  bottom?: number;
}

interface SlidePickerProps {
  presentationId: string;
  currentSlideNum: number;
  numberOfSlides: number;
  disabled: boolean;
  onSelectSlide: (slideNum: number) => void;
  className?: string;
}

const computePosition = (trigger: HTMLElement): PopoverPosition => {
  const rect = trigger.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const width = Math.min(POPOVER_MAX_WIDTH, viewportWidth - (VIEWPORT_MARGIN * 2));
  const centeredLeft = rect.left + (rect.width / 2) - (width / 2);
  const left = Math.max(
    VIEWPORT_MARGIN,
    Math.min(centeredLeft, viewportWidth - width - VIEWPORT_MARGIN),
  );

  const roomAbove = rect.top - POPOVER_GAP - VIEWPORT_MARGIN;
  const roomBelow = viewportHeight - rect.bottom - POPOVER_GAP - VIEWPORT_MARGIN;

  // The toolbar sits under the slide, so open upwards over the slide unless
  // there is clearly more room below.
  if (roomAbove >= MIN_ROOM_ABOVE || roomAbove >= roomBelow) {
    return {
      left,
      width,
      bottom: viewportHeight - rect.top + POPOVER_GAP,
      maxHeight: Math.min(POPOVER_MAX_HEIGHT, roomAbove),
    };
  }

  return {
    left,
    width,
    top: rect.bottom + POPOVER_GAP,
    maxHeight: Math.min(POPOVER_MAX_HEIGHT, roomBelow),
  };
};

// Number of tiles in the first row of the grid, used for up/down navigation.
const getColumnCount = (tiles: HTMLElement[]) => {
  if (tiles.length === 0) return 1;
  const firstTop = tiles[0].offsetTop;
  const columns = tiles.findIndex((tile) => tile.offsetTop !== firstTop);
  return columns === -1 ? tiles.length : columns;
};

interface SlidePickerPanelProps {
  presentationId: string;
  currentSlideNum: number;
  numberOfSlides: number;
  position: PopoverPosition;
  panelId: string;
  onSelect: (slideNum: number) => void;
  onClose: (restoreFocus: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
}

const SlidePickerPanel: React.FC<SlidePickerPanelProps> = ({
  presentationId,
  currentSlideNum,
  numberOfSlides,
  position,
  panelId,
  onSelect,
  onClose,
  triggerRef,
}) => {
  const intl = useIntl();
  const panelRef = useRef<HTMLDivElement>(null);
  const tileRefs = useRef<HTMLButtonElement[]>([]);

  const { data } = useDeduplicatedSubscription<SlideThumbnailsSubscriptionResponse>(
    SLIDE_THUMBNAILS_SUBSCRIPTION,
    { variables: { presentationId } },
  );

  const thumbnailsByNum = useMemo(() => {
    const map = new Map<number, string>();
    data?.pres_page?.forEach((page) => {
      if (page.thumbUrl) map.set(page.num, Auth.authenticateURL(page.thumbUrl));
    });
    return map;
  }, [data]);

  const slideNumbers = useMemo(
    () => Array.from({ length: numberOfSlides }, (_, i) => i + 1),
    [numberOfSlides],
  );

  // Bring the current slide into view and give it focus when opening.
  useLayoutEffect(() => {
    const currentTile = tileRefs.current[currentSlideNum - 1];
    if (currentTile) {
      currentTile.scrollIntoView({ block: 'center' });
      currentTile.focus({ preventScroll: true });
    }
    // Only on open: later slide changes must not steal focus.
  }, []);

  // Close on outside pointer down.
  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      onClose(false);
    };
    document.addEventListener('pointerdown', handlePointerDown, true);
    return () => document.removeEventListener('pointerdown', handlePointerDown, true);
  }, [onClose, triggerRef]);

  const focusTile = (index: number) => {
    const tiles = tileRefs.current;
    const clamped = Math.max(0, Math.min(index, tiles.length - 1));
    tiles[clamped]?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const tiles = tileRefs.current.filter(Boolean);
    const activeIndex = tiles.findIndex((tile) => tile === document.activeElement);
    const isRtl = document.documentElement.dir === 'rtl';
    let next: number | null = null;

    switch (event.key) {
      case KEYS.ESCAPE:
        event.preventDefault();
        event.stopPropagation();
        onClose(true);
        return;
      case KEYS.TAB:
        // Keep it simple: the panel is a single composite widget.
        onClose(false);
        return;
      case KEYS.ARROW_RIGHT:
        next = activeIndex + (isRtl ? -1 : 1);
        break;
      case KEYS.ARROW_LEFT:
        next = activeIndex + (isRtl ? 1 : -1);
        break;
      case KEYS.ARROW_DOWN:
        next = activeIndex + getColumnCount(tiles);
        break;
      case KEYS.ARROW_UP:
        next = activeIndex - getColumnCount(tiles);
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = tiles.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    event.stopPropagation();
    focusTile(activeIndex === -1 ? currentSlideNum - 1 : next);
  };

  const portalTarget = (document.fullscreenElement as HTMLElement | null) ?? document.body;

  return createPortal(
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <Styled.Popover
      ref={panelRef}
      className="bbb-presentation-toolbar__slide-picker"
      id={panelId}
      role="dialog"
      aria-label={intl.formatMessage(intlMessages.selectLabel)}
      data-test="slidePicker"
      onKeyDown={handleKeyDown}
      style={{
        left: position.left,
        width: position.width,
        maxHeight: position.maxHeight,
        top: position.top,
        bottom: position.bottom,
      }}
    >
      <Styled.Header>
        <Styled.HeaderTitle>{intl.formatMessage(intlMessages.selectLabel)}</Styled.HeaderTitle>
        <Styled.HeaderCount>
          {intl.formatMessage(intlMessages.slideCount, { numberOfSlides })}
        </Styled.HeaderCount>
      </Styled.Header>
      <Styled.Grid>
        {slideNumbers.map((num) => {
          const isCurrent = num === currentSlideNum;
          const label = intl.formatMessage(intlMessages.goToSlide, { slideNumber: num });
          const thumbUrl = thumbnailsByNum.get(num);
          return (
            <li key={num}>
              <Styled.Tile
                className="bbb-presentation-toolbar__slide-picker-item"
                type="button"
                ref={(el: HTMLButtonElement | null) => {
                  if (el) tileRefs.current[num - 1] = el;
                }}
                $current={isCurrent}
                aria-current={isCurrent ? 'true' : undefined}
                aria-label={label}
                tabIndex={isCurrent ? 0 : -1}
                data-test="slideThumbnail"
                data-slide={num}
                onClick={() => onSelect(num)}
              >
                <Styled.ThumbFrame>
                  {thumbUrl ? (
                    <img src={thumbUrl} alt="" loading="lazy" draggable={false} />
                  ) : (
                    <Styled.ThumbPlaceholder aria-hidden>{num}</Styled.ThumbPlaceholder>
                  )}
                </Styled.ThumbFrame>
                <Styled.TileLabel aria-hidden>{label}</Styled.TileLabel>
              </Styled.Tile>
            </li>
          );
        })}
      </Styled.Grid>
    </Styled.Popover>,
    portalTarget,
  );
};

const SlidePicker: React.FC<SlidePickerProps> = ({
  presentationId,
  currentSlideNum,
  numberOfSlides,
  disabled,
  onSelectSlide,
  className,
}) => {
  const intl = useIntl();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<PopoverPosition | null>(null);
  const panelId = 'slidePickerPanel';

  const updatePosition = useCallback(() => {
    if (triggerRef.current) setPosition(computePosition(triggerRef.current));
  }, []);

  const close = useCallback((restoreFocus: boolean) => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  useLayoutEffect(() => {
    if (!open) return undefined;
    updatePosition();
    window.addEventListener('resize', updatePosition);
    document.addEventListener('fullscreenchange', updatePosition);
    return () => {
      window.removeEventListener('resize', updatePosition);
      document.removeEventListener('fullscreenchange', updatePosition);
    };
  }, [open, updatePosition]);

  // A new presentation, or losing the connection, closes the picker.
  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);
  useEffect(() => {
    setOpen(false);
  }, [presentationId]);

  const handleSelect = (slideNum: number) => {
    setOpen(false);
    triggerRef.current?.blur();
    if (slideNum !== currentSlideNum) onSelectSlide(slideNum);
  };

  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === KEYS.ARROW_UP || event.key === KEYS.ARROW_DOWN) {
      event.preventDefault();
      setOpen(true);
    }
  };

  const currentLabel = intl.formatMessage(intlMessages.goToSlide, { slideNumber: currentSlideNum });

  return (
    <>
      <TooltipContainer title={intl.formatMessage(intlMessages.selectLabel)}>
        <Styled.Trigger
          ref={triggerRef}
          className={className}
          type="button"
          id="skipSlide"
          aria-label={`${intl.formatMessage(intlMessages.skipSlideLabel)}: ${currentLabel} / ${numberOfSlides}`}
          aria-describedby="skipSlideDesc"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? panelId : undefined}
          disabled={disabled}
          data-test="skipSlide"
          data-current-slide={currentSlideNum}
          onClick={() => setOpen((value) => !value)}
          onKeyDown={handleTriggerKeyDown}
        >
          <span aria-live="polite">{currentLabel}</span>
          <Styled.TriggerTotal aria-hidden>{`/ ${numberOfSlides}`}</Styled.TriggerTotal>
          <Styled.Caret $open={open} aria-hidden />
        </Styled.Trigger>
      </TooltipContainer>
      {open && position ? (
        <SlidePickerPanel
          presentationId={presentationId}
          currentSlideNum={currentSlideNum}
          numberOfSlides={numberOfSlides}
          position={position}
          panelId={panelId}
          onSelect={handleSelect}
          onClose={close}
          triggerRef={triggerRef}
        />
      ) : null}
    </>
  );
};

export default SlidePicker;
