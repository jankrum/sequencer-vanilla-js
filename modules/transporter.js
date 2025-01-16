import { makeEnum } from './utility.js'

const TRANSPORTER_TYPES = ['dom', 'midi']
export const TRANSPORTER_TYPE_ENUM = makeEnum(TRANSPORTER_TYPES)

export default class Transporter { }