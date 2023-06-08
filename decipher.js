class DecipherAlgorithm {
    async decipher(url, secret) {
        let bytes = await this.get_pixel_bytes(url);
        return await this.dbytes(bytes, secret);
    }
    async decipherFromBytes(pixelBytes, secret) {
        const engine = new SequenceEngine(secret, 107);

        let result = '';
        let nextPosition = await engine.next();
        console.log(nextPosition);
        let realIndex = 0;
        let len = 2;
        let calc = true;
        for (let i = 0; i < pixelBytes.length; i++) {
            if ((i + 1) % 4 == 0) continue;
            if (realIndex == nextPosition) {
                let byte = pixelBytes[i];
                result += String.fromCharCode(byte);
                if (calc && result.length == 2) {
                    calc = false;
                    len = result.charCodeAt(0);
                    len = len << 8;
                    len |= result.charCodeAt(1);


                    let mod = pixelBytes.length - i - 1;
                    mod /= len;
                    engine.updateMod(Math.floor(mod))
                    result = '';
                }
                nextPosition += await engine.next();
                console.log(nextPosition)
                if (result.length >= len) {
                    console.log("breaking");
                    break;
                }
            }
            realIndex++;
        }
        return result;
    }
    async dbytes(pixelBytes, secret) {
        const engine = new SequenceEngine(secret, 107);

        let temp = new Uint8Array((pixelBytes.length*3)/4);
        for(let i = 0, j = 0;i < pixelBytes.length;i++) {
            if((i+1)%4 == 0) continue;
            temp[j++] = pixelBytes[i];
        }
        let pos = await engine.next();
        console.log(pos);
        let len = temp[pos] & 0b1111_1111;

        pos += await engine.next();
        console.log(pos);
        len = len << 8;
        len |= (temp[pos]& 0b1111_1111);

        console.log("Length of message : " + len);

        let mod = temp.length-pos;
        mod /= (len);
        engine.updateMod(Math.floor(mod));

        let result = '';

        for(let i = 0;i < len;i++) {
            pos += await engine.next();
            result += String.fromCharCode(temp[pos]);
            console.log("POS : "+pos + " CHAR : " + String.fromCharCode(temp[pos]& 0b1111_1111));
        }
        return result;
    }
    async get_pixel_bytes(imageUrl) {
        const img = await this.loadImageFromUrl(imageUrl);
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        return imageData.data;
    }

    loadImageFromUrl(imageUrl) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = reject;
            image.src = imageUrl;
        });
    }

}

async function decipher(url, key) {
    const algo = new DecipherAlgorithm();
    return await algo.decipher(url, key);
}