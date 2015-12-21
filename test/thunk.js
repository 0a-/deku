/** @jsx h */
import {createDOMRenderer} from '../src/createDOMRenderer'
import h from '../src/element'
import test from 'tape'

test('rendering and updating thunks', t => {
  let el = document.createElement('div')
  let render = createDOMRenderer(el)

  let Component = {
    render: ({ props }) => (
      <div name={props.name} />
    )
  }

  render(<Component name='Tom' />)
  render(<Component name='Bob' />)
  t.equal(el.innerHTML, `<div name="Bob"></div>`, 'thunk updated')

  t.end()
})

test('swapping a thunks root element', t => {
  let el = document.createElement('div')
  let render = createDOMRenderer(el)

  let Component = {
    render: ({ props }) => (
      props.swap
        ? <a />
        : <b />
    )
  }

  render(<Component />)
  render(<Component swap />)
  t.equal(el.innerHTML, `<a></a>`, 'thunk root element swapped')

  t.end()
})

test('rendering a thunk with props', t => {
  let el = document.createElement('div')
  let render = createDOMRenderer(el)

  let Component = {
    render: ({ props }) => <button>{props.text}</button>
  }

  render(<div><Component text='Reset' /></div>)
  t.equal(el.innerHTML, '<div><button>Reset</button></div>', 'thunk rendered')

  render(<div><Component text='Submit' /></div>)
  t.equal(el.innerHTML, '<div><button>Submit</button></div>', 'thunk updated')

  t.end()
})

test('rendering a thunk with children', t => {
  let el = document.createElement('div')
  let render = createDOMRenderer(el)

  let Component = {
    render: ({ children }) => children[0]
  }

  render(
    <Component>
      <div>Hello World</div>
    </Component>
  )
  t.equal(el.innerHTML, '<div>Hello World</div>', 'thunk rendered with children')

  t.end()
})

test('rendering a thunk with a path', t => {
  let el = document.createElement('div')
  let render = createDOMRenderer(el)

  let Component = {
    render: ({ path }) => {
      t.assert(path, 'path is correct')
      return <div />
    }
  }

  t.plan(1)
  render(
    <div>
      <ul>
        <li key='one'></li>
        <li key='two'><Component /></li>
        <li key='three'></li>
      </ul>
    </div>
  )
  t.end()
})

test.skip('calling thunks onCreate hook', t => {
  let el = document.createElement('div')
  let render = createDOMRenderer(el)

  let Component = {
    onCreate: () => t.pass(),
    render: m => <div />
  }

  t.plan(1)
  render(<Component text='Reset' />)
  t.end()
})
