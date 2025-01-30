import { makeEnum } from './utility.js'

const SYNTHESIZER_TYPES = ['DOM', 'MIDI']
export const SYNTHESIZER_TYPE_ENUM = makeEnum(SYNTHESIZER_TYPES)

export default class Synthesizer { }