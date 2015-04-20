# Deku

[![version](https://img.shields.io/npm/v/deku.svg?style=flat-square)](https://www.npmjs.com/package/deku) [![Circle CI](https://img.shields.io/circleci/project/BrightFlair/PHP.Gt.svg?style=flat-square)](https://circleci.com/gh/segmentio/deku) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)

> A simple library for creating UI components using virtual DOM.

```
npm install deku
``` 

[Read the documentation](https://github.com/segmentio/deku/wiki) on the wiki &rarr;

## Features

* It's small at roughly 8kb. 
* Supports npm, Duo, and Bower. [Learn More &rarr;](https://github.com/segmentio/deku/wiki/Installing)
* It only supports IE10+ and better browsers. [Learn More &rarr;](https://github.com/segmentio/deku/wiki#browser-support)
* Server-side rendering.
* Easily test components.
* Handles all event delegation for you without virtual events.
* Batched and optimized updates using `requestAnimationFrame`.
* Pooling of DOM elements.

## Example

First we create a new component. This represents a single UI element on the page that needs to manage some state. Components are just plain objects, there are no classes or DSL to learn, just use modules.

```js
// button.js
export function render(props) {
  return <button>{props.text}</button>
}
```

Then we create an app, mount the component and render it to the DOM.

```js
// app.js
import * as Button from './button';
import {tree,render} from 'deku';

// Create an app
var app = tree()
app.mount(<Button text="Click me!" />)

// Render the app to the DOM
render(app, document.body)
```
