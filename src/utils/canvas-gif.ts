import decodeGif from 'decode-gif';
import fs from 'fs';
import { createCanvas, createImageData } from 'canvas';
import GIFEncoder from 'gif-encoder-2';


type EditFrame = (
	ctx: CanvasRenderingContext2D,
	width: number,
	height: number,
	totalFrames: number,
	currentFrame: number,
	encoder: typeof GIFEncoder
) => void;

type Algorithm = 'neuquant' | 'octree';

interface Options {
	coalesce?: boolean;
	delay?: number;
	repeat?: number;
	algorithm?: Algorithm;
	optimiser?: boolean;
	fps?: number;
	quality?: number;
}

/**
 * Renders a new GIF after manipulating every frame using node-canvas
 * @param input The file path to or a buffer of the original GIF
 * @param editFrame The function to run for every frame
 * @param options
 * @returns
 */
export async function canvasGif(
	input: string | Buffer,
	editFrame: EditFrame,
	options: Options
) {
	var bufferToEdit: Buffer;


	var algorithm: Algorithm =
		(options?.algorithm?.toLowerCase() as Algorithm) ?? 'neuquant';
	const optimiserEnabled = options?.optimiser ?? false;
	const delay = options?.delay ?? 0;
	const repeat = options?.repeat ?? 0;
	const fps = options?.fps ?? 60;
	const quality = options?.quality ?? 100 / 100;

	bufferToEdit =
			typeof input === 'string' ? fs.readFileSync(input) : input;

	// Validate the algorithm
	if (!['neuquant', 'octree'].includes(algorithm)) {
		console.error(
			new Error(
				`${algorithm} is not a valid algorithm! Using neuquant as a substitute.`
			)
		);
		algorithm = 'neuquant';
	}

	// Decode the gif and begin the encoder
	const { width, height, frames } = decodeGif(bufferToEdit);
	const encoder = new GIFEncoder(
		width,
		height,
		algorithm,
		optimiserEnabled,
		frames.length
	);

	encoder.on('readable', () => encoder.read());
	encoder.setDelay(delay);
	encoder.setRepeat(repeat);
	encoder.setFrameRate(fps);
	encoder.setQuality(quality);
	encoder.start();

	// Render each frame and add it to the encoder
	
    const framePromises = frames.map((frame, i) => {
        return new Promise(resolve => {
            const canvas = createCanvas(width, height);
		const ctx = canvas.getContext('2d');

		// Create image data from the frame's data and put it on the canvas
		const data = createImageData(frame.data, width, height);
		ctx.putImageData(data, 0, 0);

		// Run the user's custom edit function, and add the frame
        if (i < 20) {
            //@ts-ignore
            editFrame(ctx, width, height, frames.length, i + 1, encoder);
            encoder.addFrame(ctx);
            resolve(null)
        }
        })
    })

    await Promise.all(framePromises)

	// Finish encoding and return the result
	encoder.finish();
	return encoder.out.getData() as Buffer;
};