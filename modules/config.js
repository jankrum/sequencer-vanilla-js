import UrlMap from './url-map.js'
import Transporter from './transporter.js'
import Band from './band.js'
import dm from './dm.js'

const CONFIG_URL_KEY = 'config'

function validateConfig(config) {
    if (config === null) {
        throw new Error('Config is null')
    }

    if (typeof config !== 'object') {
        throw new Error('Config is not an object')
    }

    const problems = []

    try {
        Transporter.validateConfig(config)
    } catch (error) {
        problems.push(error.message)
    }

    try {
        Band.validateConfig(config)
    } catch (error) {
        problems.push(error.message)
    }

    if (problems.length > 0) {
        throw new Error(['Config has problems:', ...problems].join('\n'))
    }
}

function getConfigFromUser(configFromUrl) {
    const transporterConfig = Transporter.getConfig(configFromUrl)
    const bandConfig = Band.getConfig(configFromUrl)

    const form = dm('form', { id: 'config' },
        ...transporterConfig.elements,
        ...bandConfig.elements,
        dm('button', { type: 'submit' }, 'Submit'),
    )

    document.body.append(form)

    return new Promise(resolve => {
        form.addEventListener('submit', event => {
            event.preventDefault()

            const config = {
                ...transporterConfig.values,
                ...bandConfig.values,
            }

            try {
                validateConfig(config)
                UrlMap.setJson(CONFIG_URL_KEY, config)

                form.remove()
                resolve(config)
            }
            catch (e) {
                console.error(e)
            }
        })
    })
}

export async function getConfig() {
    const configFromUrl = UrlMap.getJson(CONFIG_URL_KEY)

    try {
        validateConfig(configFromUrl)
        return configFromUrl
    }
    catch (error) {
        console.warn(error)
        UrlMap.delete(CONFIG_URL_KEY)
    }

    return await getConfigFromUser(configFromUrl)
}