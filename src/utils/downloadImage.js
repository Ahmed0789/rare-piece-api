import axios from 'axios';
import { createWriteStream } from 'fs';
import { basename } from 'path';

export async function downloadImage(url, destFolder = './public/sneakers') {
    try {
        const filename = basename(new URL(url).pathname); // gets the image name from URL
        const filepath = `${destFolder}/${filename}`;

        const writer = createWriteStream(filepath);

        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream',
        });

        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => resolve(filename));
            writer.on('error', reject);
        });
    } catch (error) {
        console.error(`❌ Failed to download image from ${url}:`, error.message);
        return null;
    }
}

export async function getImageAsBase64(imageUrl) {
    const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer'
    });
    const base64 = Buffer.from(response.data, 'binary').toString('base64');
    const mimeType = response.headers['content-type'];
    return `data:${mimeType};base64,${base64}`;
}