import { makeEnum } from './utility.js'

const CONTROLLER_TYPES = ['dom', 'midi']
export const CONTROLLER_TYPE_ENUM = makeEnum(CONTROLLER_TYPES)

export default class Controller { }