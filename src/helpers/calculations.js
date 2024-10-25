export const calculateChange = (current, previous) => {
    if (typeof current !== 'number' || typeof previous !== 'number') {
        return 0
    }
    return ((current - previous) / previous) * 100
}
