export default class UrlMap {
    // Store a value in the URL
    static set(key, value) {
        const urlParams = new URLSearchParams(window.location.search)
        urlParams.set(key, value)
        const newUrl = `${window.location.origin}${window.location.pathname}?${urlParams.toString()}`
        window.history.replaceState(null, '', newUrl)
    }

    // Store a JSON value in the URL
    static setJson(key, value) {
        const jsonString = JSON.stringify(value)
        const base64String = btoa(jsonString)
        const encodedConfig = encodeURIComponent(base64String)
        UrlMap.set(key, encodedConfig)
    }

    // Get a value from the URL
    static get(key) {
        const urlParams = new URLSearchParams(window.location.search)
        return urlParams.get(key)
    }

    // Get a JSON value from the URL
    static getJson(key) {
        try {
            const encodedConfig = UrlMap.get(key)
            if (!encodedConfig) {
                return null
            }

            const base64String = decodeURIComponent(encodedConfig)
            const jsonString = atob(base64String)
            return JSON.parse(jsonString)
        } catch (error) {
            UrlMap.delete(key)
            return null
        }
    }

    // Delete a value from the URL
    static delete(key) {
        const urlParams = new URLSearchParams(window.location.search)
        urlParams.delete(key)
        const urlParamsString = urlParams.toString()
        const hasParams = urlParamsString.length > 0
        const newUrl = `${window.location.origin}${window.location.pathname}${hasParams ? '?' : ''}${urlParamsString}`
        window.history.replaceState(null, '', newUrl)
    }

    // Clear all values from the URL
    static clear() {
        window.history.replaceState(null, '', window.location.pathname)
    }
}