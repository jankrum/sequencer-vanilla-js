export default function dm(tag, attributes = {}, ...children) {
    const element = document.createElement(tag)

    for (const [key, value] of Object.entries(attributes)) {
        element.setAttribute(key, value)
    }

    for (const child of children) {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child))
        } else if (child) {
            element.appendChild(child)
        }
    }

    return element
}

export function makeToggleBox(on = false, disabled = false) {
    return dm('input', Object.assign(
        on ? { checked: true } : {},
        disabled ? { disabled: true } : {},
        { class: 'hidden', type: 'checkbox' }
    ))
}