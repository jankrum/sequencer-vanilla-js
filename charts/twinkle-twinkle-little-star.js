const title = 'Twinkle x2 Little Star'

function* compose({ lead, EVENT, TIMING, PITCH, DYNAMICS }) {
    const octaveJumpControl = lead.controller.createRangeControl('8va chance: ', 0, 100, '%')

    const tempoBpm = 120
    const notes = [
        ['C4', 0, 0.9],
        ['C4', 1, 0.9],
        ['G4', 2, 0.9],
        ['G4', 3, 0.9],
        ['A4', 4, 0.9],
        ['A4', 5, 0.9],
        ['G4', 6, 1.9],
        ['F4', 8, 0.9],
        ['F4', 9, 0.9],
        ['E4', 10, 0.9],
        ['E4', 11, 0.9],
        ['D4', 12, 0.9],
        ['D4', 13, 0.9],
        ['C4', 14, 1.9],
        ['G4', 16, 0.9],
        ['G4', 17, 0.9],
        ['F4', 18, 0.9],
        ['F4', 19, 0.9],
        ['E4', 20, 0.9],
        ['E4', 21, 0.9],
        ['D4', 22, 1.9],
        ['G4', 24, 0.9],
        ['G4', 25, 0.9],
        ['F4', 26, 0.9],
        ['F4', 27, 0.9],
        ['E4', 28, 0.9],
        ['E4', 29, 0.9],
        ['D4', 30, 1.9],
        ['C4', 32, 0.9],
        ['C4', 33, 0.9],
        ['G4', 34, 0.9],
        ['G4', 35, 0.9],
        ['A4', 36, 0.9],
        ['A4', 37, 0.9],
        ['G4', 38, 1.9],
        ['F4', 40, 0.9],
        ['F4', 41, 0.9],
        ['E4', 42, 0.9],
        ['E4', 43, 0.9],
        ['D4', 44, 0.9],
        ['D4', 45, 0.9],
        ['C4', 46, 2],
    ]
    const velocity = DYNAMICS.MF

    const tempoMpb = TIMING.convertBeatsToMs(tempoBpm)

    for (const [note, startTimeBeats, durationBeats] of notes) {
        const startTimeMs = startTimeBeats * tempoMpb
        const durationMs = TIMING.shorten(durationBeats * tempoMpb)
        const endTimeMs = startTimeMs + durationMs

        yield { time: startTimeMs - TIMING.COMPUTE_AHEAD_MS }

        const shouldJump = Math.random() * 100 < octaveJumpControl.value
        const pitch = PITCH[note] + (shouldJump ? 12 : 0)

        yield {
            time: startTimeMs,
            type: EVENT.NOTE_ON,
            part: lead,
            pitch,
            velocity,
        }

        yield {
            time: endTimeMs,
            type: EVENT.NOTE_OFF,
            part: lead,
            pitch,
        }
    }
}


export default { title, compose }