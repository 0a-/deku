# Deku

[![Join the chat at https://gitter.im/segmentio/deku](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/segmentio/deku?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![version](https://img.shields.io/npm/v/deku.svg?style=flat-square)](https://www.npmjs.com/package/deku) [![Circle CI](https://img.shields.io/circleci/project/BrightFlair/PHP.Gt.svg?style=flat-square)](https://circleci.com/gh/segmentio/deku)

> A simple library for creating UI components using virtual DOM.

```
npm install deku
``` 

Read the [documentation](https://github.com/segmentio/deku/wiki) on the wiki.

## Features

* It's small at roughly 8kb. 
* Supports [npm](https://www.npmjs.com/package/deku), [Duo](https://github.com/duojs/duo), and Bower.
* It only supports IE10+ and better browsers.
* Server-side rendering.
* Easily test components.
* Handles all event delegation for you without virtual events.
* Batched and optimized updates using `requestAnimationFrame`.

## Example

```js
var {component,dom} = require('deku');

var Button = component({
  onClick() {
    this.setState({ clicked: true });
  },
  render(props, state) {
    return dom('button', { onClick: this.onClick }, [props.text]);
  }
});

var scene = Button.render(document.body, {
  text: 'Click Me!'
});
```

## Browser Support

[![Sauce Test Status](https://saucelabs.com/browser-matrix/deku.svg)](https://saucelabs.com/u/deku)

## Learn More

* [Documentation](https://github.com/segmentio/deku/wiki)
* [Installing](https://github.com/segmentio/deku/wiki/Installing)
* [Quick Start](https://github.com/segmentio/deku/wiki/Quick-Start)
* [Using JSX](https://github.com/segmentio/deku/wiki/Using-JSX)
* [Deku vs React](https://github.com/segmentio/deku/wiki/Deku-vs-React)
