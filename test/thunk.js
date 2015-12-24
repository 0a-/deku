/** @jsx h */
import createDOMRenderer from '../src/dom'
import h from '../src/element'
import test from 'tape'
import trigger from 'trigger-event'

test('rendering and updating thunks', t => {
  let el = document.createElement('div')
  let render = createDOMRenderer(el)

  let Component = {
    render: (model) => (
      <div name={model.props.name} />
    )
  }

  render(<Component name='Tom' />)
  render(<Component name='Bob' />)
  t.equal(el.innerHTML, `<div name="Bob"></div>`, 'thunk updated')

  t.end()
})

test('calling dispatch', t => {
  let Component = {
    render: ({ dispatch }) => (
      <button onClick={() => dispatch({ type: 'CLICK' })}>Click</button>
    )
  }

  let el = document.createElement('div')
  document.body.appendChild(el)

  let render = createDOMRenderer(el, action => {
    t.equal(action.type, 'CLICK', 'Action received')
  })

  t.plan(1)
  render(<Component />)
  trigger(el.querySelector('button'), 'click')
  document.body.removeChild(el)
  t.end()
})

test('accessing context', t => {
  let state = {
    name: 'Tom'
  }
  let Component = {
    render: ({ context }) => {
      t.equal(context, state, 'same object is used')
      return <div>{context.name}</div>
    }
  }
  let el = document.createElement('div')
  let render = createDOMRenderer(el)
  render(<Component />, state)
  t.equal(el.innerHTML, '<div>Tom</div>')
  t.end()
})

test('swapping a thunks root element', t => {
  let el = document.createElement('div')
  let render = createDOMRenderer(el)

  let Component = {
    render: (model) => (
      model.props.swap
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
    render: (model) => <button>{model.props.text}</button>
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
