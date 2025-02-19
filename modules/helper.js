import timesDo from './times-do.js'

const EVENT = Object.freeze({
    NOTE_ON: 144,
    NOTE_OFF: 128,
})

const TIMING = Object.freeze({
    convertBpmToMpb(bpm) {
        return 60000 / bpm
    },
    shorten(durationMs) {
        return Math.max(durationMs - 0.1, durationMs * 0.9)
    },
    COMPUTE_AHEAD_MS: 100,
})

function midiNoteToPitch(midiNote) {
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

const PITCH = Object.freeze(Object.assign(
    { midiNoteToPitch },
    Object.fromEntries([...timesDo(128, midiNoteToPitch)].flat())
))

const DYNAMICS = Object.freeze({
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

const HELPER = Object.freeze({
    EVENT,
    TIMING,
    PITCH,
    DYNAMICS,
})

export default HELPER