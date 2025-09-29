
const ALPHAKEYS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
const ALPHAKEYS_LENGHT = ALPHAKEYS.length;

function randomInt(max: number) {
    return Math.floor(Math.random() * max)
}

export function generateSlug(length = 6) {
    let out = "";
    for (let i = 0; i < length; i++) {
        out += ALPHAKEYS[randomInt(ALPHAKEYS_LENGHT)]
    }
    return out;
}