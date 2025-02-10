// import Paginator from './paginator.js'
import Transporter from './transporter.js'
import Band from './band.js'
import { dm } from './utility.js'

export default class Sequencer {
    // Class variables
    static #configUrlKey = 'config'

    // Child objects
    // paginator = new Paginator()
    transporter = new Transporter()
    band = new Band()

    // Properties
    showChartSource = false

    // Starts the sequencer
    async start() {
        // Try to start from the URL, otherwise wait for the user to submit a form
        this.canStartFromUrl() || await this.startFromUser()
    }

    // Returns a bool indicating if the sequencer was able to start from the URL
    canStartFromUrl() {
        // Try to use the config from the URL
        const urlParams = new URLSearchParams(window.location.search)
        const encodedConfig = urlParams.get(Sequencer.#configUrlKey)

        try {
            if (!encodedConfig) {
                throw new Error('No configuration found in URL')
            }

            const base64String = decodeURIComponent(encodedConfig)
            const jsonString = atob(base64String)
            const config = JSON.parse(jsonString)

            // This will throw an error if the config is invalid
            this.tryConfig(config)

            // Yes, we can start from the URL
            return true
        } catch (error) {
            console.error(error)

            urlParams.delete(Sequencer.#configUrlKey)
            const newUrl = `${window.location.origin}${window.location.pathname}?${urlParams.toString()}`
            window.history.replaceState(null, '', newUrl)
        }

        // No, we cannot start from the URL
        return false
    }

    tryConfig(config) {
        // Check if there even is a config
        if (!config) {
            throw new Error('"config" is required')
        }

        // We use a problems variable to collect all the problems because we want
        // to be able to evaluate transporter and band even if the other one fails
        const problems = []

        const { showChartSource, transporter, band } = config

        if (showChartSource === undefined) {
            problems.push('"showChartSource" is required')
        } else if (typeof showChartSource !== 'boolean') {
            problems.push('"showChartSource" must be a boolean')
        } else {
            // Set the showChartSource property so that it may be used in the startFromForm method
            this.showChartSource = showChartSource
        }

        if (transporter === undefined) {
            problems.push('"transporter" is required')
        } else if (typeof transporter !== 'object') {
            problems.push('"transporter" must be an object')
        } else {
            try {
                this.transporter.tryConfig(transporter)
            } catch (e) {
                problems.push(e.message)
            }
        }

        if (band === undefined) {
            problems.push('"band" is required')
        } else if (typeof band !== 'object') {
            problems.push('"band" must be an object')
        } else {
            try {
                this.band.tryConfig(band)
            } catch (e) {
                problems.push(e.message)
            }
        }

        if (problems.length > 0) {
            throw new Error(problems.join('\n'))
        }
    }

    // Returns a promise that resolves when the user has successfully submitted the form
    startFromUser() {
        // Show Chart Source
        const showChartSourceCheckbox = dm('input', { type: 'checkbox', name: 'show-chart-source' })
        showChartSourceCheckbox.checked = this.showChartSource
        const showChartSourceLabel = dm('label', {}, 'Show Chart Source', showChartSourceCheckbox)

        const hr = dm('hr', { class: 'wide' })

        // Transporter and Band
        const transporterConfig = this.transporter.getConfigElement()
        const bandConfigs = this.band.getConfigElements()  // An array of divs

        // Miscellaneous Div
        const refreshMidiButton = dm('button', {}, 'Refresh MIDI Ports')
        const rememberConfigCheckbox = dm('input', { type: 'checkbox', name: 'remember-config', checked: true })
        const rememberConfigLabel = dm('label', {}, 'Remember Config', rememberConfigCheckbox)
        const submitButton = dm('button', { type: 'submit' }, 'Submit')
        const miscellaneousDiv = dm('div', { class: 'wide' }, refreshMidiButton, rememberConfigLabel, submitButton)

        // Config Form
        const configForm = dm('form', { id: 'config' },
            showChartSourceLabel,
            hr,
            transporterConfig,
            ...bandConfigs,
            miscellaneousDiv
        )

        // A function that returns the config
        const getConfigValues = () => ({
            showChartSource: showChartSourceCheckbox.checked,
            transporter: this.transporter.getConfigValues(),
            band: this.band.getConfigValues()
        })

        document.body.append(configForm)

        // Return a promise that resolves when the form is submitted
        return new Promise((resolve) => {
            configForm.addEventListener('submit', event => {
                // Prevent the form from submitting
                event.preventDefault()

                // Get the config from the form and try it
                const config = getConfigValues()
                this.tryConfig(config)

                // If we reach this point, the config is valid and we can wrap it up
                document.body.removeChild(configForm)

                resolve()
            })
        })
    }
}