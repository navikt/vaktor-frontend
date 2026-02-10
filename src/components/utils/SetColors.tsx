var tinycolor = require('tinycolor2')

// Light mode colors (original pastel colors)
const lightColors: string[] = ['#EFECF4', '#E6F0FF', '#E7F8FF', '#EDFFF8', '#F4FDE8', '#FFFEE4', '#FFF6E7', '#FDE8E6']

// Dark mode colors (darker, more saturated versions)
const darkColors: string[] = ['#3d3447', '#2d4a6e', '#2d5a6e', '#2d5e4a', '#4a5e2d', '#6e5e2d', '#6e4a2d', '#6e2d3d']

export const colorPicker: any = (index: number, isDarkMode: boolean = false) => {
    const colors = isDarkMode ? darkColors : lightColors
    return colors[index % colors.length]
}

export const setGrpColor: any = (list: any[], itemId: string) => {
    var grpColor: string = '#FFFFFF'
    list.map((listObj: any) => {
        if (listObj.group === itemId) {
            grpColor = listObj.color
        }
    })
    return grpColor
}

export const setTextColor: any = (color: string, isDarkMode: boolean = false) => {
    // In dark mode, use lighter text. In light mode, use darker text
    let textColor = isDarkMode ? tinycolor(color).lighten(40).toString() : tinycolor(color).darken(80).toString()
    return textColor
}

export const setBorderColor: any = (color: string, isDarkMode: boolean = false) => {
    // In dark mode, use lighter border. In light mode, use darker border
    let borderColor = isDarkMode ? tinycolor(color).lighten(20).setAlpha(0.4).toString() : tinycolor(color).darken(70).setAlpha(0.22).toString()
    return borderColor
}

export const setInterruptionColor: any = (list: any[], itemId: string, isDarkMode: boolean = false) => {
    var interruptionColor: string = '#FFFFFF'
    list.map((listObj: any) => {
        if (listObj.group === itemId) {
            // In dark mode, lighten slightly. In light mode, darken slightly
            interruptionColor = isDarkMode ? tinycolor(listObj.color).lighten(5).toString() : tinycolor(listObj.color).darken(10).toString()
        }
    })
    return interruptionColor
}
