const canvas = document.getElementById('imageCanvas');
const ctx = canvas.getContext('2d');
let img = new Image();
let history = [];

function loadImage(event) {
    const file = event.target.files[0];
    img.src = URL.createObjectURL(file);
    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        saveState();
    };
}

function saveState() {
    history.push(canvas.toDataURL());
    if (history.length > 10) history.shift();
}

function undo() {
    if (history.length > 1) {
        history.pop();
        const lastState = new Image();
        lastState.onload = () => {
            canvas.width = lastState.width;
            canvas.height = lastState.height;
            ctx.drawImage(lastState, 0, 0);
        };
        lastState.src = history[history.length - 1];
    }
}

function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
    document.getElementById(tabName).style.display = 'block';
}

function showHelp() {
    document.getElementById('helpModal').style.display = 'block';
}

function hideHelp() {
    document.getElementById('helpModal').style.display = 'none';
}

function applyFilters() {
    const brightness = document.getElementById('brightness').value;
    const contrast = document.getElementById('contrast').value;
    const saturation = document.getElementById('saturation').value;
    ctx.filter = `brightness(${100 + Number(brightness)}%) contrast(${100 + Number(contrast)}%) saturate(${saturation}%)`;
    ctx.drawImage(img, 0, 0);
    saveState();
}

function adjustColors() {
    const hue = document.getElementById('hue').value;
    const lightness = document.getElementById('lightness').value;
    ctx.filter = `hue-rotate(${hue}deg) brightness(${lightness}%)`;
    ctx.drawImage(img, 0, 0);
    saveState();
}

function addText() {
    const text = document.getElementById('textInput').value;
    const fontSize = document.getElementById('fontSize').value;
    const color = document.getElementById('textColor').value;
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = color;
    ctx.fillText(text, 50, 50);
    saveState();
}

let isRemovingWatermark = false;
let startX, startY;

function enableWatermarkRemoval() {
    isRemovingWatermark = true;
    canvas.addEventListener('mousedown', startSelection);
    canvas.addEventListener('mouseup', applyBlur);
}

function startSelection(e) {
    if (isRemovingWatermark) {
        startX = e.offsetX;
        startY = e.offsetY;
    }
}

function applyBlur(e) {
    if (isRemovingWatermark) {
        const endX = e.offsetX;
        const endY = e.offsetY;
        const width = endX - startX;
        const height = endY - startY;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillRect(startX, startY, width, height);
        saveState();
        isRemovingWatermark = false;
        canvas.removeEventListener('mousedown', startSelection);
        canvas.removeEventListener('mouseup', applyBlur);
    }
}

let isCropping = false;

function enableCrop() {
    isCropping = true;
    canvas.addEventListener('mousedown', startSelection);
    canvas.addEventListener('mouseup', cropImage);
}

function cropImage(e) {
    if (isCropping) {
        const endX = e.offsetX;
        const endY = e.offsetY;
        const width = endX - startX;
        const height = endY - startY;
        const imageData = ctx.getImageData(startX, startY, width, height);
        canvas.width = width;
        canvas.height = height;
        ctx.putImageData(imageData, 0, 0);
        saveState();
        isCropping = false;
        canvas.removeEventListener('mousedown', startSelection);
        canvas.removeEventListener('mouseup', cropImage);
    }
}
