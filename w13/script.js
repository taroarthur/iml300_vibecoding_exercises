class ImageEditor {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.originalImage = null;
        this.currentImage = null;
        this.imageInput = document.getElementById('imageInput');
        this.placeholder = document.getElementById('placeholder');
        
        this.pixelSize = 8;
        this.thresholdLevel = 128;
        
        this.initEventListeners();
    }

    initEventListeners() {
        // File upload
        this.imageInput.addEventListener('change', (e) => this.handleImageUpload(e));
        
        // Drag and drop
        const uploadBox = document.querySelector('.upload-box');
        uploadBox.addEventListener('dragover', (e) => e.preventDefault());
        uploadBox.addEventListener('drop', (e) => {
            e.preventDefault();
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.loadImage(files[0]);
            }
        });

        // Theme select
        document.getElementById('themeSelect').addEventListener('change', (e) => {
            document.body.className = 'theme-' + e.target.value;
        });

        // Effect buttons
        document.querySelectorAll('.effect-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;
                this.applyEffect(filter);
            });
        });

        // Sliders
        document.getElementById('pixelSize').addEventListener('input', (e) => {
            this.pixelSize = parseInt(e.target.value);
        });

        document.getElementById('threshold').addEventListener('input', (e) => {
            this.thresholdLevel = parseInt(e.target.value);
        });

        // Action buttons
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());
        document.getElementById('exportBtn').addEventListener('click', () => this.export());
    }

    handleImageUpload(e) {
        const file = e.target.files[0];
        if (file) {
            this.loadImage(file);
        }
    }

    loadImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.originalImage = img;
                this.currentImage = img;
                this.displayImage(img);
                this.placeholder.style.display = 'none';
                document.getElementById('imageInfo').textContent = `${file.name} • ${img.width}x${img.height}`;
            };
            img.crossOrigin = 'Anonymous';
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    displayImage(img) {
        const maxWidth = 800;
        const maxHeight = 400;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = width * ratio;
            height = height * ratio;
        }

        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx.drawImage(img, 0, 0, width, height);
        this.canvas.classList.add('active');
    }

    applyEffect(filter) {
        if (!this.originalImage) return;

        switch (filter) {
            case 'pixelate':
                this.pixelate();
                break;
            case 'threshold':
                this.threshold();
                break;
            case 'ascii':
                this.asciiArt();
                break;
            case 'posterize':
                this.posterize();
                break;
            case 'dither':
                this.dither();
                break;
            case 'grayscale':
                this.grayscale();
                break;
            case 'invert':
                this.invert();
                break;
            case 'colorReduce':
                this.colorReduce();
                break;
            case 'edge':
                this.edgeDetect();
                break;
            case 'glitch':
                this.glitch();
                break;
        }
    }

    getImageData() {
        return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    }

    putImageData(imageData) {
        this.ctx.putImageData(imageData, 0, 0);
    }

    pixelate() {
        this.displayImage(this.originalImage);
        const imageData = this.getImageData();
        const data = imageData.data;
        const pixelSize = this.pixelSize;

        for (let y = 0; y < imageData.height; y += pixelSize) {
            for (let x = 0; x < imageData.width; x += pixelSize) {
                const idx = (y * imageData.width + x) * 4;
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];

                for (let dyy = 0; dyy < pixelSize && y + dyy < imageData.height; dyy++) {
                    for (let dxx = 0; dxx < pixelSize && x + dxx < imageData.width; dxx++) {
                        const i = ((y + dyy) * imageData.width + (x + dxx)) * 4;
                        data[i] = r;
                        data[i + 1] = g;
                        data[i + 2] = b;
                    }
                }
            }
        }
        this.putImageData(imageData);
    }

    threshold() {
        this.displayImage(this.originalImage);
        const imageData = this.getImageData();
        const data = imageData.data;
        const threshold = this.thresholdLevel;

        for (let i = 0; i < data.length; i += 4) {
            const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
            const value = gray > threshold ? 255 : 0;
            data[i] = value;
            data[i + 1] = value;
            data[i + 2] = value;
        }
        this.putImageData(imageData);
    }

    asciiArt() {
        this.displayImage(this.originalImage);
        const characters = '@%#*+=-:. ';
        const imageData = this.getImageData();
        const data = imageData.data;
        const chars = [];

        const sampleRate = 6;
        const lines = [];
        for (let y = 0; y < imageData.height; y += sampleRate) {
            let line = '';
            for (let x = 0; x < imageData.width; x += sampleRate) {
                const idx = (y * imageData.width + x) * 4;
                const gray = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
                const charIdx = Math.floor((gray / 255) * (characters.length - 1));
                line += characters[charIdx];
            }
            lines.push(line);
        }

        this.ctx.fillStyle = '#000000';
        this.ctx.font = 'bold 8px monospace';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#ffffff';

        lines.forEach((line, i) => {
            this.ctx.fillText(line, 2, (i + 1) * 10);
        });
    }

    posterize() {
        this.displayImage(this.originalImage);
        const imageData = this.getImageData();
        const data = imageData.data;
        const levels = 4;

        for (let i = 0; i < data.length; i += 4) {
            const step = Math.floor(256 / levels);
            data[i] = Math.floor(data[i] / step) * step;
            data[i + 1] = Math.floor(data[i + 1] / step) * step;
            data[i + 2] = Math.floor(data[i + 2] / step) * step;
        }
        this.putImageData(imageData);
    }

    dither() {
        this.displayImage(this.originalImage);
        const imageData = this.getImageData();
        const data = imageData.data;
        const width = imageData.width;

        for (let i = 0; i < data.length; i += 4) {
            const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
            const dithered = gray > 128 ? 255 : 0;
            const error = gray - dithered;

            data[i] = dithered;
            data[i + 1] = dithered;
            data[i + 2] = dithered;

            if (i + 7 < data.length) {
                const nextIdx = i + 4;
                data[nextIdx] = Math.max(0, Math.min(255, data[nextIdx] + error * 0.5));
            }
        }
        this.putImageData(imageData);
    }

    grayscale() {
        this.displayImage(this.originalImage);
        const imageData = this.getImageData();
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
            data[i] = gray;
            data[i + 1] = gray;
            data[i + 2] = gray;
        }
        this.putImageData(imageData);
    }

    invert() {
        this.displayImage(this.originalImage);
        const imageData = this.getImageData();
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            data[i] = 255 - data[i];
            data[i + 1] = 255 - data[i + 1];
            data[i + 2] = 255 - data[i + 2];
        }
        this.putImageData(imageData);
    }

    colorReduce() {
        this.displayImage(this.originalImage);
        const imageData = this.getImageData();
        const data = imageData.data;
        const levels = 3;

        for (let i = 0; i < data.length; i += 4) {
            const step = Math.floor(256 / levels);
            const r = Math.round(data[i] / step) * step;
            const g = Math.round(data[i + 1] / step) * step;
            const b = Math.round(data[i + 2] / step) * step;

            data[i] = Math.min(255, r);
            data[i + 1] = Math.min(255, g);
            data[i + 2] = Math.min(255, b);
        }
        this.putImageData(imageData);
    }

    edgeDetect() {
        this.displayImage(this.originalImage);
        const imageData = this.getImageData();
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;

        const edges = new Uint8ClampedArray(width * height);

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                let gx = 0, gy = 0;

                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        const idx = ((y + dy) * width + (x + dx)) * 4;
                        const gray = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;

                        if (dx === -1) gx -= gray;
                        if (dx === 1) gx += gray;
                        if (dy === -1) gy -= gray;
                        if (dy === 1) gy += gray;
                    }
                }

                const magnitude = Math.sqrt(gx * gx + gy * gy);
                edges[y * width + x] = magnitude > 50 ? 255 : 0;
            }
        }

        for (let i = 0; i < data.length; i += 4) {
            const value = edges[Math.floor(i / 4)];
            data[i] = value;
            data[i + 1] = value;
            data[i + 2] = value;
        }
        this.putImageData(imageData);
    }

    glitch() {
        this.displayImage(this.originalImage);
        const imageData = this.getImageData();
        const data = imageData.data;
        const width = imageData.width;

        for (let y = 0; y < imageData.height; y++) {
            if (Math.random() > 0.7) {
                const shift = Math.floor(Math.random() * 20) - 10;
                for (let x = 0; x < width; x++) {
                    const idx = (y * width + x) * 4;
                    const newX = Math.max(0, Math.min(width - 1, x + shift));
                    const newIdx = (y * width + newX) * 4;

                    if (Math.random() > 0.5) {
                        data[idx] = data[newIdx];
                    } else {
                        data[idx + 1] = data[newIdx + 1];
                    }
                }
            }
        }
        this.putImageData(imageData);
    }

    reset() {
        if (this.originalImage) {
            this.displayImage(this.originalImage);
        }
    }

    export() {
        if (!this.canvas) return;

        const canvasImage = this.canvas.toDataURL('image/png');
        const width = this.canvas.width;
        const height = this.canvas.height;

        const newWindow = window.open('', '', `width=${Math.min(width + 40, 1200)},height=${Math.min(height + 40, 900)}`);
        
        newWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { margin: 0; padding: 0; background: #000; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
                    img { max-width: 100%; max-height: 100%; image-rendering: pixelated; }
                </style>
            </head>
            <body>
                <img src="${canvasImage}">
            </body>
            </html>
        `);
        newWindow.document.close();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ImageEditor();
});
