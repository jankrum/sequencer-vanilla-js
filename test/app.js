import { test, expect } from './test/test.js'

test('2 + 2 = 4', () => {
    expect(2 + 2).toBe(4)
})

test('2 + 2 != 5', () => {
    expect(2 + 2).not.toBe(5)
})

test('Lazy addition', async () => {
    await new Promise(resolve => setTimeout(resolve, 2000))
    expect(2 + 2).toBe(4)
})

test('Meant to fail', () => {
    expect(2 + 2).toBe(5)
})