export default function* timesDo(n, fn) {
    for (let i = 0; i < n; i++) {
        yield fn(i)
    }
}