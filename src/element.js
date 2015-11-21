/**
 * This function lets us create virtual nodes using a simple
 * syntax. It is compatible with JSX transforms so you can use
 * JSX to write nodes that will compile to this function.
 *
 * let node = element('div', { id: 'foo' }, [
 *   element('a', { href: 'http://google.com' },
 *     element('span', {}, 'Google'),
 *     element('b', {}, 'Link')
 *   )
 * ])
 */

export default function element (type, attributes, ...children) {
  if (!type) throw new TypeError('element() needs a type.')

  attributes = attributes || {}
  children = (children || []).reduce(reduceChildren, [])

  let key = typeof attributes.key === 'string' || typeof attributes.key === 'number'
    ? attributes.key :
    undefined

  if (typeof type === 'function') {
    return createThunkElement(type, key, attributes, children)
  }

  return {
    attributes,
    children,
    type,
    key
  }
}

function reduceChildren (children, vnode) {
  if (typeof vnode === 'string') {
    children.push(createTextElement(vnode))
  } else if (Array.isArray(vnode)) {
    children = [...children, ...vnode]
  } else if (typeof vnode !== 'undefined') {
    children.push(vnode)
  }
  return children
}

export function createTextElement (text) {
  return {
    type: '#text',
    nodeValue: text
  }
}

export function createThunkElement (render, key, attributes, children) {
  return {
    type: '#thunk',
    data: null,
    attributes,
    children,
    render,
    key
  }
}
