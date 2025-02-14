import { test, expect } from './test/test.js'
import UrlMap from '../modules/url-map.js'
import Sequencer from '../modules/sequencer.js'
import Transporter from '../modules/transporter.js'
import Band from '../modules/band.js'
import Controller from '../modules/controller.js'
import Synthesizer from '../modules/synthesizer.js'

//#region Constants
const EXISTING_PORT_NAME = 'loopMIDI Port'
const NONEXISTENT_PORT_NAME = '%%NON-EXISTENT%%'

const MINIMALIST_CONFIG = Object.freeze({
    showChartSource: false,
    transporter: {
        isMidi: false,
    },
    band: {
        bass: {
            controller: {
                isMidi: false,
            },
            synthesizer: {
                isMidi: false,
            },
        },
        drum: {
            controller: {
                isMidi: false,
            },
            synthesizer: {
                isMidi: false,
            },
        },
        keys: {
            controller: {
                isMidi: false,
            },
            synthesizer: {
                isMidi: false,
            },
        },
        lead: {
            controller: {
                isMidi: false,
            },
            synthesizer: {
                isMidi: false,
            },
        },
    },
})

const MAXIMALIST_CONFIG = Object.freeze({
    showChartSource: true,
    transporter: {
        isMidi: true,
        ports: {
            input: EXISTING_PORT_NAME,
            output: EXISTING_PORT_NAME,
        },
    },
    band: {
        bass: {
            controller: {
                isMidi: true,
                ports: {
                    input: EXISTING_PORT_NAME,
                    output: EXISTING_PORT_NAME,
                },
            },
            synthesizer: {
                isMidi: true,
                output: {
                    port: EXISTING_PORT_NAME,
                    channel: 1,
                },
            },
        },
        drum: {
            controller: {
                isMidi: true,
                ports: {
                    input: EXISTING_PORT_NAME,
                    output: EXISTING_PORT_NAME,
                },
            },
            synthesizer: {
                isMidi: true,
                output: {
                    port: EXISTING_PORT_NAME,
                    channel: 10,
                },
            },
        },
        keys: {
            controller: {
                isMidi: true,
                ports: {
                    input: EXISTING_PORT_NAME,
                    output: EXISTING_PORT_NAME,
                },
            },
            synthesizer: {
                isMidi: true,
                output: {
                    port: EXISTING_PORT_NAME,
                    channel: 2,
                },
            },
        },
        lead: {
            controller: {
                isMidi: true,
                ports: {
                    input: EXISTING_PORT_NAME,
                    output: EXISTING_PORT_NAME,
                },
            },
            synthesizer: {
                isMidi: true,
                output: {
                    port: EXISTING_PORT_NAME,
                    channel: 3,
                },
            },
        },
    },
})
//#endregion

//#region UrlMap
test('Storing string in URL', () => {
    const key = 'test-string'
    const value = 'Hello World!'

    UrlMap.set(key, value)
    expect(UrlMap.get(key)).toBe(value)
    UrlMap.delete(key)
})

test('Storing object in URL', () => {
    const key = 'test-object'
    const value = { foo: 'bar' }

    UrlMap.setJson(key, value)
    expect(UrlMap.getJson(key)).toStrictEqual(value)
    UrlMap.delete(key)
})

test('Storing array in URL', () => {
    const key = 'test-array'
    const value = [{ foo: 'bar' }]

    UrlMap.setJson(key, value)
    expect(UrlMap.getJson(key)).toStrictEqual(value)
    UrlMap.delete(key)
})

test('Clearing URL', () => {
    UrlMap.set('test', 'test')
    UrlMap.clear()
    expect(UrlMap.get('test')).toBe(null)
    expect(UrlMap.getJson('test')).toBe(null)
})
//#endregion UrlMap

//#region Sequencer
test('Not configuring sequencer using empty config', () => {
    const sequencer = new Sequencer()
    expect(() => {
        sequencer.tryConfig()
    }).toThrow()
})

test('Not configuring sequencer using wrong config type', () => {
    const sequencer = new Sequencer()
    expect(() => {
        sequencer.tryConfig(123)
    }).toThrow()
})

test('Not configuring sequencer using config without showChartSource', () => {
    const config = Object.assign({}, MINIMALIST_CONFIG)
    delete config.showChartSource

    const sequencer = new Sequencer()
    expect(() => {
        sequencer.tryConfig(config)
    }).toThrow()
})

test('Not configuring sequencer using config with wrong showChartSource type', () => {
    const config = Object.assign({}, MINIMALIST_CONFIG, {
        showChartSource: 123,
    })

    const sequencer = new Sequencer()
    expect(() => {
        sequencer.tryConfig(config)
    }).toThrow()
})

test('Not configuring sequencer using config without transporter', () => {
    const config = Object.assign({}, MINIMALIST_CONFIG)
    delete config.transporter

    const sequencer = new Sequencer()
    expect(() => {
        sequencer.tryConfig(config)
    }).toThrow()
})

test('Not configuring sequencer using config with wrong transporter type', () => {
    const config = Object.assign({}, MINIMALIST_CONFIG, {
        transporter: 'foo',
    })

    const sequencer = new Sequencer()
    expect(() => {
        sequencer.tryConfig(config)
    }).toThrow()
})

test('Not configuring sequencer using config without band', () => {
    const config = Object.assign({}, MINIMALIST_CONFIG)
    delete config.band

    const sequencer = new Sequencer()
    expect(() => {
        sequencer.tryConfig(config)
    }).toThrow()
})

test('Not configuring sequencer using config with wrong band type', () => {
    const config = Object.assign({}, MINIMALIST_CONFIG, {
        band: 'foo',
    })

    const sequencer = new Sequencer()
    expect(() => {
        sequencer.tryConfig(config)
    }).toThrow()
})

test('Configuring sequencer using minimalist config', () => {
    const sequencer = new Sequencer()
    expect(() => {
        sequencer.tryConfig(MINIMALIST_CONFIG)
    }).not.toThrow()
})

test(`Configuring sequencer using maximalist config (must have port called "${EXISTING_PORT_NAME}")`, () => {
    const sequencer = new Sequencer()
    expect(() => {
        sequencer.tryConfig(MAXIMALIST_CONFIG)
    }).not.toThrow()
})

test('Not starting sequencer using empty URL', () => {
    UrlMap.clear()

    const sequencer = new Sequencer()
    expect(sequencer.canStartFromUrl()).toBe(false)
})

test('Not starting sequencer using corrupted URL', () => {
    UrlMap.set(Sequencer.configUrlKey, JSON.stringify(MINIMALIST_CONFIG).slice(6))

    const sequencer = new Sequencer()
    expect(sequencer.canStartFromUrl()).toBe(false)
})

test('Starting sequencer using minimalist URL', () => {
    UrlMap.setJson(Sequencer.configUrlKey, MINIMALIST_CONFIG)

    const sequencer = new Sequencer()
    expect(sequencer.canStartFromUrl()).toBe(true)

    UrlMap.delete(Sequencer.configUrlKey)
})

test('Starting sequencer using maximalist URL', () => {
    UrlMap.setJson(Sequencer.configUrlKey, MAXIMALIST_CONFIG)

    const sequencer = new Sequencer()
    expect(sequencer.canStartFromUrl()).toBe(true)

    UrlMap.delete(Sequencer.configUrlKey)
})
//#endregion

//#region Transporter
test('Not configuring transporter using empty config', () => {
    const transporter = new Transporter()
    expect(() => {
        transporter.tryConfig()
    }).toThrow()
})

test('Not configuring transporter using wrong config type', () => {
    const transporter = new Transporter()
    expect(() => {
        transporter.tryConfig(123)
    }).toThrow()
})

test('Not configuring transporter using config without isMidi', () => {
    const config = Object.assign({}, MINIMALIST_CONFIG.transporter)
    delete config.isMidi

    const transporter = new Transporter()
    expect(() => {
        transporter.tryConfig(config)
    }).toThrow()
})

test('Not configuring transporter using wrong isMidi type', () => {
    const config = Object.assign({}, MINIMALIST_CONFIG.transporter, {
        isMidi: 'foo',
    })

    const transporter = new Transporter()
    expect(() => {
        transporter.tryConfig(config)
    }).toThrow()
})

test('Not configuring MIDI transporter using config without ports', () => {
    const config = Object.assign({}, MAXIMALIST_CONFIG.transporter)
    delete config.ports

    const transporter = new Transporter()
    expect(() => {
        transporter.tryConfig(config)
    }).toThrow()
})

test('Not configuring MIDI transporter using config with wrong ports type', () => {
    const config = Object.assign({}, MAXIMALIST_CONFIG.transporter, {
        ports: 'foo',
    })

    const transporter = new Transporter()
    expect(() => {
        transporter.tryConfig(config)
    }).toThrow()
})

test('Not configuring MIDI transporter using config without ports.input', () => {
    const config = Object.assign({}, MAXIMALIST_CONFIG.transporter, {
        ports: { output: EXISTING_PORT_NAME },
    })

    const transporter = new Transporter()
    expect(() => {
        transporter.tryConfig(config)
    }).toThrow()
})

test('Not configuring MIDI transporter using config with wrong ports.input type', () => {
    const config = Object.assign({}, MAXIMALIST_CONFIG.transporter, {
        ports: { input: 123, output: EXISTING_PORT_NAME },
    })

    const transporter = new Transporter()
    expect(() => {
        transporter.tryConfig(config)
    }).toThrow()
})

test('Not configuring MIDI transporter using config without non-existent ports.input', () => {
    const config = Object.assign({}, MAXIMALIST_CONFIG.transporter, {
        ports: { input: NONEXISTENT_PORT_NAME, output: EXISTING_PORT_NAME },
    })

    const transporter = new Transporter()
    expect(() => {
        transporter.tryConfig(config)
    }).toThrow()
})

test('Not configuring MIDI transporter using config without ports.output', () => {
    const config = Object.assign({}, MAXIMALIST_CONFIG.transporter, {
        ports: { input: EXISTING_PORT_NAME },
    })

    const transporter = new Transporter()
    expect(() => {
        transporter.tryConfig(config)
    }).toThrow()
})

test('Not configuring MIDI transporter using config with wrong ports.output type', () => {
    const config = Object.assign({}, MAXIMALIST_CONFIG.transporter, {
        ports: { input: EXISTING_PORT_NAME, output: 123 },
    })

    const transporter = new Transporter()
    expect(() => {
        transporter.tryConfig(config)
    }).toThrow()
})

test('Not configuring MIDI transporter using config without non-existent ports.output', () => {
    const config = Object.assign({}, MAXIMALIST_CONFIG.transporter, {
        ports: { input: EXISTING_PORT_NAME, output: NONEXISTENT_PORT_NAME },
    })

    const transporter = new Transporter()
    expect(() => {
        transporter.tryConfig(config)
    }).toThrow()
})

test('Configuring MIDI transporter using minimalist config', () => {
    const transporter = new Transporter()
    expect(() => {
        transporter.tryConfig(MINIMALIST_CONFIG.transporter)
    }).not.toThrow()
})

test(`Configuring MIDI transporter using maximalist config (must have port called "${EXISTING_PORT_NAME}")`, () => {
    const transporter = new Transporter()
    expect(() => {
        transporter.tryConfig(MAXIMALIST_CONFIG.transporter)
    }).not.toThrow()
})
//#endregion

//#region Band
test('Not configuring band using empty config', () => {
    const band = new Band()
    expect(() => {
        band.tryConfig()
    }).toThrow()
})

test('Not configuring band using wrong config type', () => {
    const band = new Band()
    expect(() => {
        band.tryConfig(123)
    }).toThrow()
})

test('Not configuring band using config without bass part', () => {
    const config = Object.assign({}, MINIMALIST_CONFIG.band)
    delete config.bass

    const band = new Band()
    expect(() => {
        band.tryConfig(config)
    }).toThrow()
})

test('Not configuring band using config with wrong bass part type', () => {
    const config = Object.assign({}, MINIMALIST_CONFIG.band, {
        bass: 'foo',
    })

    const band = new Band()
    expect(() => {
        band.tryConfig(config)
    }).toThrow()
})

test('Not configuring band using config without drum part', () => {
    const config = Object.assign({}, MINIMALIST_CONFIG.band)
    delete config.drum

    const band = new Band()
    expect(() => {
        band.tryConfig(config)
    }).toThrow()
})

test('Not configuring band using config with wrong drum part type', () => {
    const config = Object.assign({}, MINIMALIST_CONFIG.band, {
        drum: 'foo',
    })

    const band = new Band()
    expect(() => {
        band.tryConfig(config)
    }).toThrow()
})

test('Not configuring band using config without keys part', () => {
    const config = Object.assign({}, MINIMALIST_CONFIG.band)
    delete config.keys

    const band = new Band()
    expect(() => {
        band.tryConfig(config)
    }).toThrow()
})

test('Not configuring band using config with wrong keys part type', () => {
    const config = Object.assign({}, MINIMALIST_CONFIG.band, {
        keys: 'foo',
    })

    const band = new Band()
    expect(() => {
        band.tryConfig(config)
    }).toThrow()
})

test('Not configuring band using config without lead part', () => {
    const config = Object.assign({}, MINIMALIST_CONFIG.band)
    delete config.lead

    const band = new Band()
    expect(() => {
        band.tryConfig(config)
    }).toThrow()
})

test('Not configuring band using config with wrong lead part type', () => {
    const config = Object.assign({}, MINIMALIST_CONFIG.band, {
        lead: 'foo',
    })

    const band = new Band()
    expect(() => {
        band.tryConfig(config)
    }).toThrow()
})

test('Configuring band using minimalist config', () => {
    const band = new Band()
    expect(() => {
        band.tryConfig(MINIMALIST_CONFIG.band)
    }).not.toThrow()
})

test(`Configuring band using maximalist config (must have port called "${EXISTING_PORT_NAME}")`, () => {
    const band = new Band()
    expect(() => {
        band.tryConfig(MAXIMALIST_CONFIG.band)
    }).not.toThrow()
})
//#endregion

//#region Controller
test('Not configuring controller using empty config', () => {
    const controller = new Controller()
    expect(() => {
        controller.tryConfig()
    }).toThrow()
})

test('Not configuring controller using wrong config type', () => {
    const controller = new Controller()
    expect(() => {
        controller.tryConfig(123)
    }).toThrow()
})

test('Not configuring controller using config without isMidi', () => {
    const config = Object.assign({}, MINIMALIST_CONFIG.band.bass.controller)
    delete config.isMidi

    const controller = new Controller()
    expect(() => {
        controller.tryConfig(config)
    }).toThrow()
})

test('Not configuring controller using wrong isMidi type', () => {
    const config = Object.assign({}, MINIMALIST_CONFIG.band.bass.controller, {
        isMidi: 'foo',
    })

    const controller = new Controller()
    expect(() => {
        controller.tryConfig(config)
    }).toThrow()
})

test('Not configuring MIDI controller using config without ports', () => {
    const config = Object.assign({}, MAXIMALIST_CONFIG.band.bass.controller)
    delete config.ports

    const controller = new Controller()
    expect(() => {
        controller.tryConfig(config)
    }).toThrow()
})

test('Not configuring MIDI controller using config with wrong ports type', () => {
    const config = Object.assign({}, MAXIMALIST_CONFIG.band.bass.controller, {
        ports: 'foo',
    })

    const controller = new Controller()
    expect(() => {
        controller.tryConfig(config)
    }).toThrow()
})

test('Not configuring MIDI controller using config without ports.input', () => {
    const config = Object.assign({}, MAXIMALIST_CONFIG.band.bass.controller, {
        ports: { output: EXISTING_PORT_NAME },
    })

    const controller = new Controller()
    expect(() => {
        controller.tryConfig(config)
    }).toThrow()
})

test('Not configuring MIDI controller using config with wrong ports.input type', () => {
    const config = Object.assign({}, MAXIMALIST_CONFIG.band.bass.controller, {
        ports: { input: 123, output: EXISTING_PORT_NAME },
    })

    const controller = new Controller()
    expect(() => {
        controller.tryConfig(config)
    }).toThrow()
})

test('Not configuring MIDI controller using config without non-existent ports.input', () => {
    const config = Object.assign({}, MAXIMALIST_CONFIG.band.bass.controller, {
        ports: { input: NONEXISTENT_PORT_NAME, output: EXISTING_PORT_NAME },
    })

    const controller = new Controller()
    expect(() => {
        controller.tryConfig(config)
    }).toThrow()
})

test('Not configuring MIDI controller using config without ports.output', () => {
    const config = Object.assign({}, MAXIMALIST_CONFIG.band.bass.controller, {
        ports: { input: EXISTING_PORT_NAME },
    })

    const controller = new Controller()
    expect(() => {
        controller.tryConfig(config)
    }).toThrow()
})

test('Not configuring MIDI controller using config with wrong ports.output type', () => {
    const config = Object.assign({}, MAXIMALIST_CONFIG.band.bass.controller, {
        ports: { input: EXISTING_PORT_NAME, output: 123 },
    })

    const controller = new Controller()
    expect(() => {
        controller.tryConfig(config)
    }).toThrow()
})

test('Not configuring MIDI controller using config without non-existent ports.output', () => {
    const config = Object.assign({}, MAXIMALIST_CONFIG.band.bass.controller, {
        ports: { input: EXISTING_PORT_NAME, output: NONEXISTENT_PORT_NAME },
    })

    const controller = new Controller()
    expect(() => {
        controller.tryConfig(config)
    }).toThrow()
})

test('Configuring MIDI controller using minimalist config', () => {
    const controller = new Controller()
    expect(() => {
        controller.tryConfig(MINIMALIST_CONFIG.band.bass.controller)
    }).not.toThrow()
})

test(`Configuring MIDI controller using maximalist config (must have port called "${EXISTING_PORT_NAME}")`, () => {
    const controller = new Controller()
    expect(() => {
        controller.tryConfig(MAXIMALIST_CONFIG.band.bass.controller)
    }).not.toThrow()
})
//#endregion

//#region Synthesizer
test('Not configuring synthesizer using empty config', () => {
    const synthesizer = new Synthesizer()
    expect(() => {
        synthesizer.tryConfig()
    }).toThrow()
})

test('Not configuring synthesizer using wrong config type', () => {
    const synthesizer = new Synthesizer()
    expect(() => {
        synthesizer.tryConfig(123)
    }).toThrow()
})

test('Not configuring synthesizer using config without isMidi', () => {
    const config = Object.assign({}, MINIMALIST_CONFIG.band.bass.synthesizer)
    delete config.isMidi

    const synthesizer = new Synthesizer()
    expect(() => {
        synthesizer.tryConfig(config)
    }).toThrow()
})

test('Not configuring synthesizer using wrong isMidi type', () => {
    const config = Object.assign({}, MINIMALIST_CONFIG.band.bass.synthesizer, {
        isMidi: 'foo',
    })

    const synthesizer = new Synthesizer()
    expect(() => {
        synthesizer.tryConfig(config)
    }).toThrow()
})

test('Not configuring MIDI synthesizer using config without output', () => {
    const config = Object.assign({}, MAXIMALIST_CONFIG.band.bass.synthesizer)
    delete config.output

    const synthesizer = new Synthesizer()
    expect(() => {
        synthesizer.tryConfig(config)
    }).toThrow()
})

test('Not configuring MIDI synthesizer using config with wrong output type', () => {
    const config = Object.assign({}, MAXIMALIST_CONFIG.band.bass.synthesizer, {
        output: 123,
    })

    const synthesizer = new Synthesizer()
    expect(() => {
        synthesizer.tryConfig(config)
    }).toThrow()
})

test('Not configuring MIDI synthesizer using config without output.port', () => {
    const config = Object.assign({}, MAXIMALIST_CONFIG.band.bass.synthesizer, {
        output: { channel: 1 },
    })

    const synthesizer = new Synthesizer()
    expect(() => {
        synthesizer.tryConfig(config)
    }).toThrow()
})

test('Not configuring MIDI synthesizer using config with wrong output.port type', () => {
    const config = Object.assign({}, MAXIMALIST_CONFIG.band.bass.synthesizer, {
        output: { port: 123, channel: 1 },
    })

    const synthesizer = new Synthesizer()
    expect(() => {
        synthesizer.tryConfig(config)
    }).toThrow()
})

test('Not configuring MIDI synthesizer using config without non-existent output.port', () => {
    const config = Object.assign({}, MAXIMALIST_CONFIG.band.bass.synthesizer, {
        output: { port: NONEXISTENT_PORT_NAME, channel: 1 },
    })

    const synthesizer = new Synthesizer()
    expect(() => {
        synthesizer.tryConfig(config)
    }).toThrow()
})

test('Not configuring MIDI synthesizer using config without output.channel', () => {
    const config = Object.assign({}, MAXIMALIST_CONFIG.band.bass.synthesizer, {
        output: { port: EXISTING_PORT_NAME },
    })

    const synthesizer = new Synthesizer()
    expect(() => {
        synthesizer.tryConfig(config)
    }).toThrow()
})

test('Not configuring MIDI synthesizer using config with wrong output.channel type', () => {
    const config = Object.assign({}, MAXIMALIST_CONFIG.band.bass.synthesizer, {
        output: { port: EXISTING_PORT_NAME, channel: 'foo' },
    })

    const synthesizer = new Synthesizer()
    expect(() => {
        synthesizer.tryConfig(config)
    }).toThrow()
})

test('Not configuring MIDI synthesizer using config with too low out of range output.channel value', () => {
    const config = Object.assign({}, MAXIMALIST_CONFIG.band.bass.synthesizer, {
        output: { port: EXISTING_PORT_NAME, channel: 0 },
    })

    const synthesizer = new Synthesizer()
    expect(() => {
        synthesizer.tryConfig(config)
    }).toThrow()
})

test('Not configuring MIDI synthesizer using config with too high out of range output.channel value', () => {
    const config = Object.assign({}, MAXIMALIST_CONFIG.band.bass.synthesizer, {
        output: { port: EXISTING_PORT_NAME, channel: 17 },
    })

    const synthesizer = new Synthesizer()
    expect(() => {
        synthesizer.tryConfig(config)
    }).toThrow()
})

test('Configuring MIDI synthesizer using minimalist config', () => {
    const synthesizer = new Synthesizer()
    expect(() => {
        synthesizer.tryConfig(MINIMALIST_CONFIG.band.bass.synthesizer)
    }).not.toThrow()
})

test(`Configuring MIDI synthesizer using maximalist config (must have port called "${EXISTING_PORT_NAME}")`, () => {
    const synthesizer = new Synthesizer()
    expect(() => {
        synthesizer.tryConfig(MAXIMALIST_CONFIG.band.bass.synthesizer)
    }).not.toThrow()
})
//#endregion