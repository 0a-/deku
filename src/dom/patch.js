import {setAttribute, removeAttribute} from './setAttribute'
import {insertAtIndex, createPath} from '../shared/utils'
import createElement from './createElement'
import {Actions, diffNode} from '../diff'
import {isThunk} from '../element'

/**
 * Modify a DOM element given an array of actions. A context can be set
 * that will be used to render any custom elements.
 */

export default function patch (dispatch, context) {
  return (DOMElement, action) => {
    Actions.case({
      setAttribute: (name, value, previousValue) => {
        setAttribute(DOMElement, name, value, previousValue)
      },
      removeAttribute: (name, previousValue) => {
        removeAttribute(DOMElement, name, previousValue)
      },
      insertBefore: (index) => {
        insertAtIndex(DOMElement.parentNode, index, DOMElement)
      },
      sameNode: () => {},
      updateChildren: (changes) => {
        // Create a clone of the children so we can reference them later
        // using their original position even if they move around
        let childNodes = Array.prototype.slice.apply(DOMElement.childNodes)

        changes.forEach(change => {
          Actions.case({
            insertChild: (vnode, index, path) => {
              insertAtIndex(
                DOMElement,
                index,
                createElement(vnode, path, dispatch, context)
              )
            },
            removeChild: (index) => {
              DOMElement.removeChild(childNodes[index])
            },
            updateChild: (index, actions) => {
              let update = patch(dispatch, context)
              actions.forEach(action => update(childNodes[index], action))
            }
          }, change)
        })
      },
      updateThunk: (prev, next, path) => {
        let { props, children, component } = next
        let { render, onUpdate } = component
        let prevNode = prev.state.vnode
        let model = {
          children,
          props,
          path,
          dispatch,
          context
        }
        let nextNode = render(model)
        let changes = diffNode(prevNode, nextNode, createPath(path, '0'))
        DOMElement = changes.reduce(patch(dispatch, context), DOMElement)
        if (onUpdate) onUpdate(model)
        next.state = {
          vnode: nextNode,
          model: model
        }
      },
      replaceNode: (prev, next, path) => {
        let newEl = createElement(next, path, dispatch, context)
        let parentEl = DOMElement.parentNode
        if (parentEl) parentEl.replaceChild(newEl, DOMElement)
        DOMElement = newEl
        removeThunks(prev)
      },
      removeNode: (prev) => {
        removeThunks(prev)
        DOMElement.parentNode.removeChild(DOMElement)
        DOMElement = null
      }
    }, action)

    return DOMElement
  }
}

/**
 * Recursively remove all thunks
 */

function removeThunks (vnode) {
  while (isThunk(vnode)) {
    let { component, state } = vnode
    let { onRemove } = component
    let { model } = state
    if (onRemove) onRemove(model)
    vnode = state.vnode
  }

  if (vnode.children) {
    for (var i = 0; i < vnode.children.length; i++) {
      removeThunks(vnode.children[i])
    }
  }
}
