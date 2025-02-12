export default class UrlMap {
    static set(key, value) {
        const urlParams = new URLSearchParams(window.location.search)
        urlParams.set(key, value)
        const newUrl = `${window.location.origin}${window.location.pathname}?${urlParams.toString()}`
        window.history.replaceState(null, '', newUrl)
    }

    static setJson(key, value) {
        const jsonString = JSON.stringify(value)
        const base64String = btoa(jsonString)
        const encodedConfig = encodeURIComponent(base64String)
        UrlMap.set(key, encodedConfig)
    }

    static get(key) {
        const urlParams = new URLSearchParams(window.location.search)
        return urlParams.get(key)
    }

    static getJson(key) {
        const encodedConfig = UrlMap.get(key)
        if (!encodedConfig) {
            return null
        }

        const base64String = decodeURIComponent(encodedConfig)
        const jsonString = atob(base64String)
        return JSON.parse(jsonString)
    }

    static delete(key) {
        const urlParams = new URLSearchParams(window.location.search)
        urlParams.delete(key)
        const urlParamsString = urlParams.toString()
        const hasParams = urlParamsString.length > 0
        const newUrl = `${window.location.origin}${window.location.pathname}${hasParams ? '?' : ''}${urlParamsString}`
        window.history.replaceState(null, '', newUrl)
    }
}