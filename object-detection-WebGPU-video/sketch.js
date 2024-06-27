// Alan Ren @NYU ITP
// Spring 2024

// Global variables for the detector, video element, and status paragraph
let detector;
let videoElement;
let statusP;
let detectionPending = false; // Flag to manage detection call overlap
let lastResults = []; // Store the last detection results

const COLOURS = [
	'#EF4444',
	'#4299E1',
	'#059669',
	'#FBBF24',
	'#4B52B1',
	'#7B3AC2',
	'#ED507A',
	'#1DD1A1',
	'#F3873A',
	'#4B5563',
	'#DC2626',
	'#1852B4',
	'#18A35D',
	'#F59E0B',
	'#4059BE',
	'#6027A5',
	'#D63D60',
	'#00AC9B',
	'#E64A19',
	'#272A34',
];

// Setup function initializes the p5 sketch
function setup() {
	createCanvas(800, 600); // Adjust size as needed
	videoElement = createCapture(VIDEO);
	videoElement.size(width, height);
	videoElement.hide(); // Hide the HTML video element, use the canvas for display

	// Create a paragraph element to show status messages
	statusP = createP('Loading model...').style('color', 'blue');

	// Initialize the object detection model using the transformersPipeline
	if (typeof window.transformersPipeline === 'undefined') {
		console.error('Transformers pipeline not available!');
		statusP.html('Pipeline loading failed.');
		return;
	}

	window
		.transformersPipeline('object-detection', 'Xenova/yolos-tiny', {
			device: 'webgpu',
		})
		.then((d) => {
			detector = d;
			statusP.html('Model ready. Detecting objects...');
		})
		.catch((error) => {
			console.error('Error loading the model: ', error);
			statusP.html('Model loading failed.');
		});
}

// Draw function to handle real-time updates
function draw() {
	background(0);
	image(videoElement, 0, 0, width, height); // Draw video to canvas

	if (detector && !detectionPending) {
		detect();
	}

	drawDetections(lastResults); // Draw detections from last successful detection
}

// Function to perform object detection
function detect() {
	detectionPending = true; // Set flag to indicate detection is in process
	let videoFrame = videoElement.get(); // Capture the current video frame as a p5.Image object

	if (videoFrame && videoFrame.width > 0 && videoFrame.height > 0) {
		detector(videoFrame.canvas.toDataURL(), {
			threshold: 0.5,
			percentage: true,
		})
			.then((results) => {
				lastResults = results; // Update results
				detectionPending = false; // Reset flag after detection completes
				statusP.html('Image Processed');
			})
			.catch((error) => {
				console.error('Detection error:', error);
				detectionPending = false; // Reset flag on error
				statusP.html('Error in object detection.');
			});
	} else {
		detectionPending = false; // Ensure flag is reset if frame is not ready
	}
}

// Function to display bounding boxes and labels based on detection results
function drawDetections(results) {
	results.forEach((result) => {
		const { box, label } = result;
		const { xmax, xmin, ymax, ymin } = box;

		// Draw bounding box
		let color = COLOURS[label.charCodeAt(0) % COLOURS.length];
		stroke(color);
		noFill();
		rect(
			xmin * width,
			ymin * height,
			(xmax - xmin) * width,
			(ymax - ymin) * height
		);

		// Draw label above the bounding box
		fill(color);
		strokeWeight(1);
		textSize(16);
		text(label, xmin * width, ymin * height - 10);
	});
}
