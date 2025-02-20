const EVENT = Object.freeze({
    NOTE_ON: 0,
    NOTE_OFF: 1,
})

const MS_PER_BEAT = 1000
const NOTES = [
    [60, 0, 0.9],
    [60, 1, 0.9],
    [67, 2, 0.9],
    [67, 3, 0.9],
    [69, 4, 0.9],
    [69, 5, 0.9],
    [67, 6, 1.9],
    [65, 8, 0.9],
    [65, 9, 0.9],
    [64, 10, 0.9],
    [64, 11, 0.9],
    [62, 12, 0.9],
    [62, 13, 0.9],
    [60, 14, 1.9],
    [67, 16, 0.9],
    [67, 17, 0.9],
    [65, 18, 0.9],
    [65, 19, 0.9],
    [64, 20, 0.9],
    [64, 21, 0.9],
    [62, 22, 1.9],
    [67, 24, 0.9],
    [67, 25, 0.9],
    [65, 26, 0.9],
    [65, 27, 0.9],
    [64, 28, 0.9],
    [64, 29, 0.9],
    [62, 30, 1.9],
    [60, 32, 0.9],
    [60, 33, 0.9],
    [67, 34, 0.9],
    [67, 35, 0.9],
    [69, 36, 0.9],
    [69, 37, 0.9],
    [67, 38, 1.9],
    [65, 40, 0.9],
    [65, 41, 0.9],
    [64, 42, 0.9],
    [64, 43, 0.9],
    [62, 44, 0.9],
    [62, 45, 0.9],
    [60, 46, 2],
].map(([pitch, startTimeBeats, durationBeats]) => [
    pitch,
    startTimeBeats * MS_PER_BEAT,
    (startTimeBeats + durationBeats) * MS_PER_BEAT,
])
const VELOCITY = 63

class Chart {
    lead
    octaveJumpControl
    noteIndex = 0
    done = false

    constructor(lead) {
        this.lead = lead
        this.octaveJumpControl = lead.controller.getRangeControl('8va chance: ', 0, 100, '%')
    }

    compose() {
        const part = this.lead

        if (this.noteIndex >= NOTES.length) {
            this.done = true
            return
        }

        const [pitch, startTimeMs, endTimeMs] = NOTES[this.noteIndex]

        this.noteIndex++

        return [
            {
                time: startTimeMs,
                type: EVENT.NOTE_ON,
                part,
                pitch,
                velocity: VELOCITY,
            },
            {
                time: endTimeMs,
                type: EVENT.NOTE_OFF,
                part,
                pitch,
            },
        ]

    }
}