const EVENT = Object.freeze({
    NOTE_ON: 0,
    NOTE_OFF: 1,
})

const PITCH = 60
const VELOCITY = 100
const DURATION_MS = 4000

class Chart {
    title = 'Hello, World!'
    lead
    done = true

    constructor(parts) {
        this.lead = parts.lead
    }

    compose() {
        const part = this.lead

        return [
            {
                time: 0,
                type: EVENT.NOTE_ON,
                part,
                pitch: PITCH,
                velocity: VELOCITY,
            },
            {
                time: DURATION_MS,
                type: EVENT.NOTE_OFF,
                part,
                pitch: PITCH,
            },
        ]
    }
}