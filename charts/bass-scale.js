const title = 'Bass Scale'

function* compose({ bass, EVENT, TIMING, PITCH, DYNAMICS }) {
    // Easy to change
    const tempo = 120
    const majorScale = ['C2', 'D2', 'E2', 'F2', 'G2', 'A2', 'B2', 'C3']
    const velocity = DYNAMICS.MF
    const lastNoteDurationBeats = 2

    // Fast to work with
    const tempoMpb = TIMING.convertBeatsToMs(1, tempo)
    const pitchNumbers = majorScale.map(note => PITCH[note])

    for (const [index, pitch] of Object.entries(pitchNumbers)) {
        const startTimeMs = index * tempoMpb
        const isLastNote = index === pitchNumbers.length - 1
        const durationBeats = isLastNote ? lastNoteDurationBeats : 1
        const durationMs = TIMING.shorten(durationBeats * tempoMpb)
        const endTimeMs = startTimeMs + durationMs

        yield {
            time: startTimeMs,
            type: EVENT.NOTE_ON,
            part: bass,
            pitch,
            velocity,
        }

        yield {
            time: endTimeMs,
            type: EVENT.NOTE_OFF,
            part: bass,
            pitch,
        }
    }
}

export default { title, compose }