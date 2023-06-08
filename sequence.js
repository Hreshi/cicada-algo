class SequenceEngine {
    constructor(key, mod) {
        this.key = key;
        this.mod = mod;
    }
    
    async next() {
        this.key = await this.calculateSHA256Hash(this.key);
        const val = 1+this.hash(this.key);
        return val;
    }

    hash(key) {
        let hashValue = 0;
        for (let i = 0; i < key.length; i++) {
            hashValue = (hashValue * 31 + key.charCodeAt(i)) % (this.mod);
        }
        return hashValue;
    }

    async calculateSHA256Hash(input) {
        const encoder = new TextEncoder();
        const data = encoder.encode(input);

        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashedString = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

        return hashedString;
    }

    updateMod(mod) {
        this.mod = mod;
    }
}

// working fine
async function start() {
    const engine = new SequenceEngine("hello", 23);
    for(let i = 0;i < 100;i++) {
        const num = await engine.next();
        console.log(num);
    }
}
