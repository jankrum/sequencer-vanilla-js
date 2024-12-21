export const PARTS = ['bass', 'drum', 'keys', 'lead']

export const PARTS_ENUM = Object.freeze(Object.fromEntries(PARTS.map((part, index) => [part.toUpperCase(), index])))

export const TRANSPORTER_TYPE = Object.freeze({
    DOM: 0,
    MIDI: 1,
})

export const CONTROLLER_TYPE = Object.freeze({
    DOM: 0,
    MIDI: 1,
})

export const SYNTHESIZER_TYPE = Object.freeze({
    DOM: 0,
    MIDI: 1,
})