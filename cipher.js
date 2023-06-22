// image url, secret key, message

class CipherAlgorithm {
    async cipher(imageUrl, secret, message) {
        const img = await this.loadImageFromUrl(imageUrl);
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixelBytes = imageData.data;
        const messageBytes = this.get_message_bytes(message);
        await this.cbytes(pixelBytes, messageBytes, secret);

        const imageLink = await this.createImage(pixelBytes, canvas.width, canvas.height);
        sessionStorage.setItem('link', imageLink);
        const image = document.createElement('img');
        image.src = imageLink;
        return imageLink;
    }
    async createImage(pixelBytes, width, height) {
        const imageData = new ImageData(pixelBytes, width, height);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.putImageData(imageData, 0, 0);
        const image = await this.blob(canvas);
        return URL.createObjectURL(image);
    }
    async blob(canvas) {
        return new Promise((resolve, reject) => {
            canvas.toBlob(resolve, 'image/png', 1.0)
        });
    }
    async cipherBytes(pixelBytes, messageBytes, secret) {

        const engine = new SequenceEngine(secret, 107)
        let nextPosition = await engine.next();
        let realIndex = 0;
        console.log('POSITION' + nextPosition)
        for (let i = 0, j = 0; i < pixelBytes.length && j < messageBytes.length; i++) {
            if ((i + 1) % 4 == 0) continue;
            if (realIndex == nextPosition) {
                if (j == 2) {
                    let mod = pixelBytes.length - i - 1;
                    mod = mod / messageBytes.length;
                    engine.updateMod(Math.floor(mod));
                }
                pixelBytes[i] = messageBytes[j++];
                nextPosition += await engine.next();
                console.log(nextPosition);
            }
            realIndex++;
        }
    }
    async cbytes(pixelBytes, messageBytes, secret) {
        if(messageBytes.length < 2 || pixelBytes.length < 500) {
            console.log("INVALID IMAGE OR MESSAGE");
            return ;
        }
        const engine = new SequenceEngine(secret, 107);

        // copy rgb values to temp array
        const temp = new Uint8Array((pixelBytes.length*3)/4);
        for(let i = 0, j = 0;i < pixelBytes.length;i++) {
            if((i+1)%4 == 0) continue;
            temp[j++] = pixelBytes[i];
        }

        // set length of data
        let pos = await engine.next();
        console.log(pos);
        temp[pos] = messageBytes[0];

        pos += await engine.next();
        console.log(pos);
        temp[pos] = messageBytes[1];

        // update mod to spread data
        let mod = temp.length-pos;
        mod /= (messageBytes.length-2);
        engine.updateMod(Math.floor(mod));

        // cipher data
        for(let i = 2;i < messageBytes.length;i++) {
            pos += await engine.next();
            temp[pos] = messageBytes[i];
            console.log("POS : "+pos + " CHAR : " + String.fromCharCode(temp[pos]));
        }

        // recopy
        for(let i = 0, j = 0;i < pixelBytes.length;i++) {
            if((i+1)%4 == 0) continue;
            pixelBytes[i] = temp[j++];
        }
    }
    loadImageFromUrl(imageUrl) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = reject;
            image.src = imageUrl;
        });
    }

    get_message_bytes(message) {
        let length = message.length;
        const bytes = new Uint8Array(length + 2);
        bytes[1] = (length & (0b1111_1111));
        length = length >> 8;
        bytes[0] = (length & (0b1111_1111));
        // console.log(bytes[0]+" : " + bytes[1]);

        for (let i = 0; i < message.length; i++) {
            bytes[i + 2] = message.charCodeAt(i) & (0b1111_1111);
        }
        return bytes;
    }

}

async function cipher(url, key, msg) {
    const algo = new CipherAlgorithm();
    return await algo.cipher(url, key, msg);
}