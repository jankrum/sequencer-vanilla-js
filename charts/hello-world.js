const title = 'Hello World'

function* compose({ lead, EVENT, PITCH, DYNAMICS }) {
    const pitch = PITCH.C4

    // Start playing a note on the lead part
    yield {
        time: 0,
        type: EVENT.NOTE_ON,
        part: lead,
        pitch,
        velocity: DYNAMICS.MF,
    }

    // Four seconds later, stop playing the note
    yield {
        time: 4000,
        type: EVENT.NOTE_OFF,
        part: lead,
        pitch,
    }
}


export default { title, compose }