export const getLocalStorageTextItem= (itemKey: string) => {
    try {
        const item = localStorage.getItem(itemKey)
    if(!item) return null
    return item
    } catch (error) {
       
    }
}

export const setLocalStorageTextItem = (itemKey: string, itemValue: string) => {
    try {
        localStorage.setItem(itemKey, itemValue)
    } catch (error) {
       
    }
}