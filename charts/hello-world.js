const title = 'Hello World'

function* compose({ lead, EVENT, PITCH, DYNAMICS }) {
    const pitch = PITCH.C4

    yield {
        time: 0,
        type: EVENT.NOTE_ON,
        part: lead,
        pitch,
        velocity: DYNAMICS.MF,
    }

    yield {
        time: 4000,
        type: EVENT.NOTE_OFF,
        part: lead,
        pitch,
    }
}


export default { title, compose }