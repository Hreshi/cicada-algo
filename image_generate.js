// Generate an image with given height and width consisting of random pixels
// Canvas api

async function generate_image(width, height) {
    const image_data = generate_image_data(width, height);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    ctx.putImageData(image_data, 0, 0);

    const blob = await toBlob(canvas);
    add_image(blob);
}
async function toBlob(canvas) {
    return new Promise((resolve, reject) => {
        canvas.toBlob(resolve, 'image/png', 1.0);
    });
}
function add_image(blob) {
    const imageLink = URL.createObjectURL(blob);
    sessionStorage.setItem('link', imageLink);
    const image = document.createElement('img');
    image.src = imageLink;
    document.body.appendChild(image);
    document.body.appendChild(document.createElement('br'));
    console.log("Image added");

}

function generate_image_data(width, height) {
    const data = generate_pixel_array(width * height);
    const image_data = new ImageData(data, width, height);
    return image_data;
}

function generate_pixel_array(pixels) {
    const data = new Uint8ClampedArray(pixels * 4);
    for (let i = 0; i < data.length; i += 4) {
        data[i] = randomInt();
        data[i + 1] = randomInt();
        data[i + 2] = randomInt();
        data[i + 3] = 255;
    }
    return data;
}

function randomInt() {
    let number = Math.floor(Math.random() * 256);
    return number;
}
function randomChar() {
    const a = 33, b = 126;
    let number = Math.floor(Math.random() * (b - a + 1)) + a;
    return number;
}

async function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = () => reject('Error converting blob to base64');
        reader.readAsDataURL(blob);
    });
}