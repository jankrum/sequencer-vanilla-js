import { makeEnum } from './utility.js'

const CONTROLLER_TYPES = ['DOM', 'MIDI']
export const CONTROLLER_TYPE_ENUM = makeEnum(CONTROLLER_TYPES)

export default class Controller { }