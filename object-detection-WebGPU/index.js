import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.10.1';

// Since we will download the model from the Hugging Face Hub, we can skip the local model check
env.allowLocalModels = false;

// Reference the elements that we will need
const status = document.getElementById('status');
const fileUpload = document.getElementById('upload');
const imageContainer = document.getElementById('container');
const example = document.getElementById('example');

const EXAMPLE_URL = 'https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/city-streets.jpg';

// Create a new object detection pipeline
status.textContent = 'Loading model...';
const detector = await pipeline('object-detection', 'Xenova/detr-resnet-50');
status.textContent = 'Ready';

example.addEventListener('click', (e) => {
    e.preventDefault();
    detect(EXAMPLE_URL);
});

fileUpload.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) {
        return;
    }

    const reader = new FileReader();

    // Set up a callback when the file is loaded
    reader.onload = e2 => detect(e2.target.result);

    reader.readAsDataURL(file);
});


// Detect objects in the image
async function detect(img) {
    imageContainer.innerHTML = '';
    imageContainer.style.backgroundImage = `url(${img})`;

    status.textContent = 'Analysing...';
    const output = await detector(img, {
        threshold: 0.5,
        percentage: true,
    });
    status.textContent = '';
    output.forEach(renderBox);
}

// Render a bounding box and label on the image
function renderBox({ box, label }) {
    const { xmax, xmin, ymax, ymin } = box;

    // Generate a random color for the box
    const color = '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, 0);

    // Draw the box
    const boxElement = document.createElement('div');
    boxElement.className = 'bounding-box';
    Object.assign(boxElement.style, {
        borderColor: color,
        left: 100 * xmin + '%',
        top: 100 * ymin + '%',
        width: 100 * (xmax - xmin) + '%',
        height: 100 * (ymax - ymin) + '%',
    })

    // Draw label
    const labelElement = document.createElement('span');
    labelElement.textContent = label;
    labelElement.className = 'bounding-box-label';
    labelElement.style.backgroundColor = color;

    boxElement.appendChild(labelElement);
    imageContainer.appendChild(boxElement);
}
