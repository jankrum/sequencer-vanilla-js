class Part {
    name
    constructor(name) {
        this.name = name
    }
}

export default class Band {
    static partNames = ['bass', 'drum', 'keys', 'lead']
    parts = Band.partNames.map(name => new Part(name))
    showSourceCode = false

    tryConfig(config) {
        // Check if there even is a config
        if (!config) {
            throw new Error('config is required')
        }

        const { parts, showSourceCode } = config

        // We use a problems variable to collect all the problems because we want
        // to be able to evaluate transporter and band even if the other one fails
        const problems = []

        if (!parts) {
            problems.push('parts is required')
        } else { }

        if (showSourceCode === undefined) {
            problems.push('showSourceCode is required')
        } else {
            this.showSourceCode = showSourceCode
        }

        if (problems.length > 0) {
            throw new Error(problems.join(''))
        }
    }
}