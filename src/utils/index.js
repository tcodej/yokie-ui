/**
 * Helper function to sort an array of objects by chosen key
 */
export const sort = (arr, key) => {
    try {
        arr.sort(function(a, b) {
            if (key) {
                a = a[key];
                b = b[key];
            }

            if (a < b) {
                return -1;
            }

            if (a > b) {
                return 1;
            }

            return 0;
        });

        return arr;

    } catch (err) {
        console.log('sort failed', arr, key);
    }
}

/**
 * Updates the interface hsl values from preferences
 */
export const updateInterfaceColors = (hue, saturation, lightness) => {
    if (typeof document !== 'undefined') {
        const light = document.querySelectorAll('.hsl-light');
        light.forEach((elt) => {
            elt.style.backgroundColor = 'hsl('+ hue +','+ saturation +'%,'+ lightness +'%)';
        });

        const dark = document.querySelectorAll('.hsl-dark');
        dark.forEach((elt) => {
            elt.style.backgroundColor = 'hsl('+ hue +','+ saturation +'%,'+ (lightness * 0.5) +'%)';
        });
    }
}

/**
 * Search the supplied array of json items for key=value and return it if found
 */
export const getItem = (list, key, value) => {
    if (Array.isArray(list)) {
        for (var i=0; i<list.length; i++) {
            if (list[i][key] == value) {
                return list[i];
            }
        }
    }

    return false;
}
