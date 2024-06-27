// Alan Ren @NYU ITP
// Spring 2024

// Global variables for the detector, image elements, and status paragraph
let detector;
let imgElement,
	defaultImg1,
	defaultImg1DataURL,
	defaultImg2,
	defaultImg2DataURL;
let statusP;

// Preload function to load the default image and convert it to a base64 data URL
function preload() {
	defaultImg1 = loadImage('https://cors-anywhere-ajr.up.railway.app/https://hdwallpaperim.com/wp-content/uploads/2017/08/25/452511-street-street_view-cityscape-city.jpg', (img) => {
		// Create an offscreen graphics object to draw the image for conversion
		let offscreenGraphics = createGraphics(img.width, img.height);
		offscreenGraphics.image(img, 0, 0);
		// Convert the drawn image on canvas to Data URL (base64)
		defaultImg1DataURL = offscreenGraphics.elt.toDataURL();
	});

	defaultImg2 = loadImage('https://cors-anywhere-ajr.up.railway.app/https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fdirectoffice.com%2Fwp-content%2Fuploads%2F2024%2F06%2FOffice-Storage-Cabinets-2048x1366.jpg&f=1&nofb=1&ipt=f6b591aded06e6451a47bac25c3b6fe04aa285fb7796c7bc35b881e063a07a5f&ipo=images', (img) => {
		// Create an offscreen graphics object to draw the image for conversion
		let offscreenGraphics = createGraphics(img.width, img.height);
		offscreenGraphics.image(img, 0, 0);
		// Convert the drawn image on canvas to Data URL (base64)
		defaultImg2DataURL = offscreenGraphics.elt.toDataURL();
	});
}

// Setup function initializes the p5 sketch
function setup() {
	// Create a paragraph element to show status messages
	statusP = createP('Loading model...').style('color', 'blue');

	// Check if the transformersPipeline is loaded and available
	if (typeof window.transformersPipeline === 'undefined') {
		console.error('Transformers pipeline not available!');
		statusP.html('Pipeline loading failed.');
		return;
	}

	// Initialize the object detection model using the transformersPipeline
	window
		.transformersPipeline('object-detection', 'Xenova/yolos-tiny', {
			device: 'webgpu',
		})
		.then((d) => {
			detector = d;
			statusP.html('Model ready. Upload an image.');
		})
		.catch((error) => {
			console.error('Error loading the model: ', error);
			statusP.html('Model loading failed.');
		});

	// Create a file input for image upload
	createFileInput(imageUploaded).attribute('accept', 'image/*');
	createButton('Example 1').mousePressed(loadImg1);
	createButton('Example 2').mousePressed(loadImg2);
}

function loadImg1() {
	if (imgElement) {
		imgElement.remove();
	}
	// Initialize the imgElement with the preloaded default image #2
	imgElement = createImg(defaultImg1DataURL, '').hide();
	// Immediately perform detection on the default image
	detect(imgElement);
}

function loadImg2() {
	if (imgElement) {
		imgElement.remove();
	}
	// Initialize the imgElement with the preloaded default image #2
	imgElement = createImg(defaultImg2DataURL, '').hide();
	// Immediately perform detection on the default image
	detect(imgElement);
}

// Function to handle uploaded images
function imageUploaded(file) {
	if (file.type === 'image') {
		if (imgElement) {
			imgElement.remove(); // Remove the previous image if exists
		}
		// Create an image element with the uploaded file
		imgElement = createImg(file.data, '').hide();
		// Detect objects in the uploaded image
		detect(imgElement);
	} else {
		statusP.html('Please upload an image file.');
	}
}

// Function to perform object detection
async function detect(image) {
	statusP.html('Analysing...');
	const results = await detector(image.elt.src, {
		threshold: 0.5,
		percentage: true,
	});

	// Display the image and bounding boxes once analysis is complete
	displayImageAndBoxes(image, results);
	statusP.html('Image Processed');
}

// Function to display the image and bounding boxes on the canvas
function displayImageAndBoxes(img, results) {
	// Calculate scale to fit the image to the screen width while maintaining aspect ratio
	let scaleX = windowWidth / img.width;
	let scaleY = scaleX; // Maintain aspect ratio

	// Adjust the canvas to fit the scaled image
	let scaledWidth = img.width * scaleX;
	let scaledHeight = img.height * scaleY;

	// Resize the canvas to fit the scaled image and provide space for status
	resizeCanvas(windowWidth, scaledHeight + 200);

	// Draw the scaled image on the canvas
	image(img, 0, 100, scaledWidth, scaledHeight);

	// Iterate over each result to draw bounding boxes and labels
	for (const result of results) {
		const { box, label } = result;
		const { xmax, xmin, ymax, ymin } = box;

		// Calculate coordinates and dimensions for scaled bounding boxes
		let rectX = xmin * scaledWidth;
		let rectY = ymin * scaledHeight + 100; // Offset by 100 pixels from top
		let rectWidth = (xmax - xmin) * scaledWidth;
		let rectHeight = (ymax - ymin) * scaledHeight;

		// Draw bounding box
		stroke(255, 0, 0);
		noFill();
		rect(rectX, rectY, rectWidth, rectHeight);

		// Draw label above the bounding box
		fill(255);
		strokeWeight(1);
		textSize(16);
		text(label, rectX, rectY - 10);
	}
}

// The draw function is left empty because updates only occur during detection
function draw() {
	// Leave this function empty if updates only occur during detection
}
