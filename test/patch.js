/** @jsx h */
import test from 'tape'
import patch from '../src/patch'
import trigger from 'trigger-event'
import * as actions from '../src/actions'
import h, {createTextElement} from '../src/element'

test('patching elements', t => {
  let {setAttribute, removeAttribute} = actions
  let DOMElement = document.createElement('div')

  patch(DOMElement, setAttribute('color', 'red'))
  t.equal(DOMElement.getAttribute('color'), 'red', 'add attribute')

  patch(DOMElement, setAttribute('color', 'blue'))
  t.equal(DOMElement.getAttribute('color'), 'blue', 'update attribute')

  patch(DOMElement, setAttribute('color', false))
  t.equal(DOMElement.hasAttribute('color'), false, 'remove attribute with false')

  patch(DOMElement, setAttribute('color', 'red'))
  patch(DOMElement, setAttribute('color', null, 'red'))
  t.equal(DOMElement.hasAttribute('color'), false, 'remove attribute with null')

  patch(DOMElement, setAttribute('color', 'red'))
  patch(DOMElement, setAttribute('color', undefined, 'red'))
  t.equal(DOMElement.hasAttribute('color'), false, 'remove attribute with undefined')

  patch(DOMElement, removeAttribute('color'))
  t.equal(DOMElement.getAttribute('color'), null, 'remove attribute')

  t.end()
})

test('patching children', t => {
  let {insertChild, updateChild, removeChild, insertBefore, setAttribute} = actions
  let DOMElement = document.createElement('div')

  patch(DOMElement, insertChild(createTextElement('Hello'), 0))
  t.equal(DOMElement.innerHTML, 'Hello', 'text child inserted')

  patch(DOMElement, updateChild(0, [setAttribute('nodeValue', 'Goodbye')]))
  t.equal(DOMElement.innerHTML, 'Goodbye', 'text child updated')

  patch(DOMElement, removeChild(createTextElement('Goodbye'), 0))
  t.equal(DOMElement.innerHTML, '', 'text child removed')

  patch(DOMElement, insertChild(<span>Hello</span>, 0))
  t.equal(DOMElement.innerHTML, '<span>Hello</span>', 'element child inserted')

  patch(DOMElement, updateChild(0, [setAttribute('color', 'blue')]))
  t.equal(DOMElement.innerHTML, '<span color="blue">Hello</span>', 'element child updated')

  patch(DOMElement, removeChild(<span>Hello</span>, 0))
  t.equal(DOMElement.innerHTML, '', 'element child removed')

  patch(DOMElement, insertChild(<span>0</span>, 0))
  patch(DOMElement, insertChild(<span>1</span>, 1))
  patch(DOMElement, insertChild(<span>2</span>, 2))
  t.equal(DOMElement.childNodes.length, 3, 'multiple children added')

  patch(DOMElement, removeChild(<span>0</span>, 0))
  patch(DOMElement.children[0], insertBefore(2))
  t.equal(DOMElement.innerHTML, '<span>2</span><span>1</span>', 'element moved')

  t.end()
})

test('patching event handlers', t => {
  let {setAttribute, removeAttribute} = actions
  let count = 0
  let handler = e => count++
  let DOMElement = document.createElement('div')
  document.body.appendChild(DOMElement)

  patch(DOMElement, setAttribute('onClick', handler))
  trigger(DOMElement, 'click')
  t.equal(count, 1, 'event added')

  patch(DOMElement, removeAttribute('onClick', handler))
  trigger(DOMElement, 'click')
  t.equal(count, 1, 'event removed')

  document.body.removeChild(DOMElement)
  t.end()
})

test('patching inputs', t => {
  let {setAttribute, removeAttribute} = actions
  let input = document.createElement('input')
  patch(input, setAttribute('value', 'Bob'))
  t.equal(input.value, 'Bob', 'value property set')
  patch(input, setAttribute('value', 'Tom'))
  t.equal(input.value, 'Tom', 'value property updated')
  patch(input, removeAttribute('value', 'Tom'))
  t.equal(input.value, '', 'value property removed')
  t.end()
})
