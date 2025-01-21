import { timesDo, makeEnum } from './utility.js'

//#region EVENT
export const EVENT = makeEnum([
    'NOTE_ON',
    'NOTE_OFF',
])
//#endregion

//#region PITCH
export function midiNoteToPitch(midiNote) {
    if (midiNote < 0 || midiNote > 127) {
        throw new Error('Out of bound MIDI note value')
    }

    const noteNames = [
        ['C', 'B#'],
        ['C#', 'Db'],
        ['D'],
        ['D#', 'Eb'],
        ['E', 'Fb'],
        ['F', 'E#'],
        ['F#', 'Gb'],
        ['G'],
        ['G#', 'Ab'],
        ['A'],
        ['A#', 'Bb'],
        ['B', 'Cb'],
    ]

    const octave = Math.floor(midiNote / 12) - 1
    const noteIndex = midiNote % 12

    // Get possible enharmonic equivalents
    const possibleNotes = noteNames[noteIndex].map(noteName => {
        // Adjust octave calculation for notes like B#
        if (noteName === 'B#' && noteIndex === 0) {
            return `${noteName}${octave - 1}`
        } else {
            return `${noteName}${octave}`
        }
    })

    return possibleNotes
}

export const PITCH = Object.freeze(Object.fromEntries([...timesDo(128, i => midiNoteToPitch(i).map(n => [n, i]))].flat()))
//#endregion

//#region DYNAMICS
export const DYNAMICS = Object.freeze({
    PPPP: 8,
    PPP: 16,
    PP: 32,
    P: 48,
    MP: 64,
    MF: 80,
    F: 96,
    FF: 112,
    FFF: 120,
    FFFF: 127,
})
//#endregion

// Default
export default Object.freeze({ EVENT, PITCH, DYNAMICS })