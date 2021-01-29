# React Autosize Textarea
A light replacement for built-in `<textarea />` component which automatically adjusts its height to match the content.

**NB: It does not require any polyfill**

```jsx
import ReactDOM from 'react-dom';
import TextareaAutosize from 'react-autosize-textarea';

ReactDOM.renderComponent(
  <TextareaAutosize {...textareaProps} onResize={(e) => {}} />,
  document.body
);
```

## Install
```
npm install --save react-autosize-textarea
```

## Demo
[Live Examples](http://react-components.buildo.io/#textareaautosize)

## Usage
`TextareaAutosize` is perfectly compatible with ReactJS default one, so to get started you can simply replace any `<textarea></textarea>` with `<TextareaAutosize></TextareaAutosize>`. It's that easy :)

### Props
You can pass any prop you're allowed to use with the default React `textarea` (`valueLink` too).

In addition to them, `TextareaAutosize` comes with some optional custom `props` to facilitate its usage:

|Name|Type|Default|Description|
|----|----|-------|-----------|
| **onResize** | <code>Function</code> |  | *optional*. Called whenever the textarea resizes |
| **rows** | <code>Number</code> |  | *optional*. Minimum number of visible rows |
| **maxRows** | <code>Number</code> |  | *optional*. Maximum number of visible rows |
| **async** | <code>Boolean</code> | <code>false</code> | *optional*. Initialize `autosize` asynchronously. Enable it if you are using StyledComponents. This is forced to true when `maxRows` is set. Async initialization will make your page "jump" when the component appears, as it will first be rendered with the normal size, then resized to content.


#### `onResize`

Sometimes you may need to react any time `TextareaAutosize` resizes itself. To do so, you should use the optional callback **onResize** which will be triggered at any resize with the `autosize:resized` event object:

```jsx
function onResize(event) {
  console.log(event.type); // -> "autosize:resized"
}

<TextareaAutosize onResize={onResize} />
```

#### Set min/max height
You can set `minHeight` and `maxHeight` through CSS or inline-style as usual:

```jsx
<TextareaAutosize style={{ minHeight: 20, maxHeight: 80 }} /> // min-height: 20px; max-height: 80px;
```

**NB:** you may need to take into account borders and/or padding.


In addition to `minHeight`, you can force `TextareaAutosize` to have a minimum number of rows by passing the prop `rows`:

```jsx
<TextareaAutosize rows={3} /> // minimun height is three rows
```

In addition to `maxHeight`, you can force `TextareaAutosize` to have a maximum number of rows by passing the prop `maxRows`:

```jsx
<TextareaAutosize maxRows={3} /> // maximum height is three rows
```

#### Refs to DOM nodes
In order to manually call `textarea`'s DOM element functions like `focus()` or `blur()`, you need a ref to the DOM node.

You get one by using the prop `innerRef` as shown in the example below:

```jsx
class Form extends React.Component {
  componentDidMount() {
    this.textarea.focus();
  }

  render() {
    return (
      <TextareaAutosize innerRef={ref => this.textarea = ref} />
    );
  }
}
```

## Browser Compatibility
| Chrome        | Firefox       | IE    | Safari | Android |
| ------------- | ------------- | ----- | ------ | ------- |
| Yes           | Yes           | 9+    | Yes    | 4+      |


## Credits
This module is based on the very popular autosize script written by [Jack Moore](https://github.com/jackmoore).

Check out his [repo](https://github.com/jackmoore/autosize) or [website](http://www.jacklmoore.com/autosize/) for more documentation.
