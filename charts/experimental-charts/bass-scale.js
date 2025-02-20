const EVENT = Object.freeze({
    NOTE_ON: 0,
    NOTE_OFF: 1,
})

const MS_PER_BEAT = 1000
const NOTE_DURATION_BEATS = 0.8
const ROOT = 36
const PITCHES = [2, 4, 5, 7, 9, 11, 12].map(step => step + ROOT)
const VELOCITY = 63

class Chart {
    title = 'Bass Scale'
    bass
    done = true

    constructor(parts) {
        this.bass = parts.bass
    }

    compose() {
        const { part } = this

        return PITCHES.map((pitch, index) => [{
            time: index * MS_PER_BEAT,
            event: EVENT.NOTE_ON,
            part,
            velocity: VELOCITY,
        }, {
            time: (index + NOTE_DURATION_BEATS) * MS_PER_BEAT,
            event: EVENT.NOTE_OFF,
            part,
            pitch,
        }]).flat()
    }
}