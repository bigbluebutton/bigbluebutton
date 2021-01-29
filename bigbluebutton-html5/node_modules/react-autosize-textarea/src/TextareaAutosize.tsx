import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as autosize from 'autosize';
import * as _getLineHeight from 'line-height';

const getLineHeight = _getLineHeight as (element: HTMLElement) => number | null;

export namespace TextareaAutosize {
  export type RequiredProps = Pick<
    React.HTMLProps<HTMLTextAreaElement>,
    Exclude<keyof React.HTMLProps<HTMLTextAreaElement>, 'ref'>
  > & {
    /** Called whenever the textarea resizes */
    onResize?: (e: React.SyntheticEvent<Event>) => void,
    /** Minimum number of visible rows */
    rows?: React.HTMLProps<HTMLTextAreaElement>['rows']
    /** Maximum number of visible rows */
    maxRows?: number,
    /** Called with the ref to the DOM node */
    innerRef?: (textarea: HTMLTextAreaElement) => void
    /** Initialize `autosize` asynchronously.
     * Enable it if you are using StyledComponents
     * This is forced to true when `maxRows` is set.
     */
    async?: boolean
  }
  export type DefaultProps = {
    rows: number
    async: boolean
  }
  export type Props = RequiredProps & Partial<DefaultProps>;
  export type State = {
    lineHeight: number | null
  }
}

type EventType = 'autosize:update' | 'autosize:destroy' | 'autosize:resized';

const UPDATE: EventType = 'autosize:update';
const DESTROY: EventType = 'autosize:destroy';
const RESIZED: EventType = 'autosize:resized';

/**
 * A light replacement for built-in textarea component
 * which automaticaly adjusts its height to match the content
 */
export class TextareaAutosize extends React.Component<TextareaAutosize.Props, TextareaAutosize.State> {

  static defaultProps: TextareaAutosize.DefaultProps = {
    rows: 1,
    async: false
  };

  static propTypes: { [key in keyof TextareaAutosize.Props]: PropTypes.Requireable<any> } = {
    rows: PropTypes.number,
    maxRows: PropTypes.number,
    onResize: PropTypes.func,
    innerRef: PropTypes.func,
    async: PropTypes.bool
  }

  state = {
    lineHeight: null
  }

  textarea: HTMLTextAreaElement
  currentValue: TextareaAutosize.Props['value']

  componentDidMount() {
    const { onResize, maxRows, async } = this.props;

    if (typeof maxRows === 'number') {
      this.updateLineHeight();
    }

    if(typeof maxRows === "number" || async) {
      /*
        the defer is needed to:
          - force "autosize" to activate the scrollbar when this.props.maxRows is passed
          - support StyledComponents (see #71)
      */
      setTimeout(() => autosize(this.textarea));
    } else {
      autosize(this.textarea)
    }

    if (onResize) {
      this.textarea.addEventListener(RESIZED, onResize as any);
    }
  }

  componentWillUnmount() {
    const { onResize } = this.props;
    if (onResize) {
      this.textarea.removeEventListener(RESIZED, onResize as any);
    }
    this.dispatchEvent(DESTROY);
  }

  dispatchEvent = (EVENT_TYPE: EventType) => {
    switch (EVENT_TYPE) {
        case UPDATE:
            autosize.update(this.textarea);
            break;
        case DESTROY:
            autosize.destroy(this.textarea);
            break;
        case RESIZED:
            const event = document.createEvent('Event');
            event.initEvent(RESIZED, true, false);

            this.textarea.dispatchEvent(event);
        default:
            break;
    }
  };

  updateLineHeight = () => {
    this.setState({
      lineHeight: getLineHeight(this.textarea)
    });
  }

  onChange = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const { onChange } = this.props;
    this.currentValue = e.currentTarget.value;
    onChange && onChange(e);
  }

  saveDOMNodeRef = (ref: HTMLTextAreaElement) => {
    const { innerRef } = this.props;

    if (innerRef) {
      innerRef(ref);
    }

    this.textarea = ref;
  }

  getLocals = () => {
    const {
      props: { onResize, maxRows, onChange, style, innerRef, ...props },
      state: { lineHeight },
      saveDOMNodeRef
    } = this;

    const maxHeight = maxRows && lineHeight ? lineHeight * maxRows : null;

    return {
      ...props,
      saveDOMNodeRef,
      style: maxHeight ? { ...style, maxHeight } : style,
      onChange: this.onChange
    };
  }

  render() {
    const { children, saveDOMNodeRef, ...locals } = this.getLocals();
    return (
      <textarea {...locals} ref={saveDOMNodeRef}>
        {children}
      </textarea>
    );
  }

  componentDidUpdate(prevProps: TextareaAutosize.Props) {
    if (this.props.value !== this.currentValue || this.props.rows !== prevProps.rows) {
      this.dispatchEvent(UPDATE);
    }
  }

}
