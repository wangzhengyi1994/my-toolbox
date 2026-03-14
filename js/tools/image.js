/* ========================================
   IMAGE TOOLS
   ======================================== */

// ========================================
// 1. Image Converter
// ========================================
App.registerTool({
  id: 'image-converter',
  name: '图片格式转换',
  description: 'Convert images between PNG, JPEG, WebP and AVIF formats',
  category: '图片',
  icon: '🔄',

  render() {
    const avifSupported = document.createElement('canvas').toDataURL('image/avif').startsWith('data:image/avif');
    return `
      <div class="upload-area" id="ic-upload">
        <span class="upload-icon">📁</span>
        <p>Drop image here or click to upload</p>
        <input type="file" id="ic-file" accept="image/*">
      </div>

      <div id="ic-controls" class="hidden">
        <div class="tool-row">
          <div class="tool-col">
            <label class="tool-label">Output Format</label>
            <select class="tool-select" id="ic-format">
              <option value="image/png">PNG</option>
              <option value="image/jpeg">JPEG</option>
              <option value="image/webp">WebP</option>
              ${avifSupported ? '<option value="image/avif">AVIF</option>' : ''}
            </select>
          </div>
          <div class="tool-col">
            <label class="tool-label">Quality: <span id="ic-quality-val">92</span>%</label>
            <input type="range" class="tool-range" id="ic-quality" min="1" max="100" value="92">
          </div>
        </div>

        <div class="tool-row">
          <button class="tool-btn tool-btn-primary" id="ic-convert">Convert</button>
        </div>

        <div id="ic-result" class="hidden">
          <div class="tool-section">
            <div class="tool-section-title">Comparison</div>
            <div class="tool-row">
              <div class="tool-col" style="text-align:center">
                <div class="result-label">Original</div>
                <div id="ic-orig-size" class="result-value" style="font-size:18px"></div>
                <div class="canvas-container"><img id="ic-orig-preview" style="max-height:200px"></div>
              </div>
              <div class="tool-col" style="text-align:center">
                <div class="result-label">Converted</div>
                <div id="ic-conv-size" class="result-value" style="font-size:18px"></div>
                <div class="canvas-container"><img id="ic-conv-preview" style="max-height:200px"></div>
              </div>
            </div>
          </div>
          <div class="tool-btn-group">
            <button class="tool-btn tool-btn-primary" id="ic-download">Download</button>
          </div>
        </div>
      </div>
    `;
  },

  init() {
    let originalFile = null;
    let convertedBlob = null;
    let convertedName = '';

    const qualitySlider = document.getElementById('ic-quality');
    const qualityVal = document.getElementById('ic-quality-val');
    const formatSel = document.getElementById('ic-format');

    qualitySlider.addEventListener('input', () => {
      qualityVal.textContent = qualitySlider.value;
    });

    // Show/hide quality slider based on format
    formatSel.addEventListener('change', () => {
      const fmt = formatSel.value;
      const isLossy = fmt === 'image/jpeg' || fmt === 'image/webp' || fmt === 'image/avif';
      qualitySlider.parentElement.style.display = isLossy ? '' : 'none';
    });

    function formatBytes(bytes) {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / 1048576).toFixed(2) + ' MB';
    }

    App.utils.setupUpload('ic-upload', 'ic-file', (file) => {
      originalFile = file;
      document.getElementById('ic-controls').classList.remove('hidden');
      document.getElementById('ic-result').classList.add('hidden');
    });

    document.getElementById('ic-convert').addEventListener('click', async () => {
      if (!originalFile) return;
      try {
        const dataUrl = await App.utils.readFileAs(originalFile, 'dataurl');
        const img = await App.utils.loadImage(dataUrl);
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');

        const fmt = formatSel.value;

        // JPEG needs white background (no alpha)
        if (fmt === 'image/jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0);

        const quality = parseInt(qualitySlider.value) / 100;
        convertedBlob = await App.utils.canvasToBlob(canvas, fmt, quality);

        // Determine extension
        const extMap = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/avif': 'avif' };
        const ext = extMap[fmt] || 'png';
        const baseName = originalFile.name.replace(/\.[^.]+$/, '');
        convertedName = `${baseName}.${ext}`;

        // Show results
        document.getElementById('ic-orig-size').textContent = formatBytes(originalFile.size);
        document.getElementById('ic-conv-size').textContent = formatBytes(convertedBlob.size);

        document.getElementById('ic-orig-preview').src = dataUrl;
        document.getElementById('ic-conv-preview').src = URL.createObjectURL(convertedBlob);

        document.getElementById('ic-result').classList.remove('hidden');
        App.utils.toast('Conversion complete!');
      } catch (e) {
        App.utils.toast('Error converting image');
      }
    });

    document.getElementById('ic-download').addEventListener('click', () => {
      if (convertedBlob) {
        App.utils.downloadFile(convertedBlob, convertedName);
      }
    });
  }
});


// ========================================
// 2. SVG Optimiser
// ========================================
App.registerTool({
  id: 'svg-optimiser',
  name: 'SVG 压缩',
  description: 'Optimise and minify SVG code',
  category: '图片',
  icon: '✂️',

  render() {
    return `
      <div class="tool-row">
        <div class="tool-col">
          <label class="tool-label">Input SVG</label>
          <textarea class="tool-textarea" id="svgo-input" rows="10" placeholder="Paste your SVG code here..."></textarea>
        </div>
      </div>
      <div class="tool-btn-group" style="margin-bottom:16px">
        <button class="tool-btn tool-btn-primary" id="svgo-optimize">Optimize</button>
        <button class="tool-btn" id="svgo-paste">Paste from Clipboard</button>
      </div>

      <div id="svgo-result" class="hidden">
        <div class="tool-section">
          <div class="tool-section-title">Result</div>
          <div class="tool-row">
            <div class="tool-col" style="text-align:center">
              <div class="result-label">Original</div>
              <div id="svgo-orig-bytes" class="result-value" style="font-size:18px"></div>
            </div>
            <div class="tool-col" style="text-align:center">
              <div class="result-label">Optimized</div>
              <div id="svgo-opt-bytes" class="result-value" style="font-size:18px"></div>
            </div>
            <div class="tool-col" style="text-align:center">
              <div class="result-label">Saved</div>
              <div id="svgo-saved" class="result-value" style="font-size:18px"></div>
            </div>
          </div>
        </div>

        <div class="tool-row">
          <div class="tool-col">
            <label class="tool-label">Original Preview</label>
            <div class="canvas-container" id="svgo-preview-orig" style="min-height:150px"></div>
          </div>
          <div class="tool-col">
            <label class="tool-label">Optimized Preview</label>
            <div class="canvas-container" id="svgo-preview-opt" style="min-height:150px"></div>
          </div>
        </div>

        <label class="tool-label">Optimized SVG</label>
        <div class="tool-output" style="max-height:300px;overflow:auto">
          <button class="tool-btn tool-btn-sm copy-btn" id="svgo-copy">Copy</button>
          <code id="svgo-output"></code>
        </div>
      </div>
    `;
  },

  init() {
    function optimizeSVG(svg) {
      let s = svg;

      // Remove XML declaration
      s = s.replace(/<\?xml[^?]*\?>\s*/gi, '');

      // Remove comments
      s = s.replace(/<!--[\s\S]*?-->/g, '');

      // Remove metadata elements
      s = s.replace(/<metadata[\s\S]*?<\/metadata>/gi, '');

      // Remove title and desc
      s = s.replace(/<title[\s\S]*?<\/title>/gi, '');
      s = s.replace(/<desc[\s\S]*?<\/desc>/gi, '');

      // Remove empty groups
      s = s.replace(/<g[^>]*>\s*<\/g>/gi, '');

      // Remove editor-specific attributes and namespaces
      s = s.replace(/\s+xmlns:(?:inkscape|sodipodi|sketch|dc|cc|rdf)="[^"]*"/gi, '');
      s = s.replace(/\s+(?:inkscape|sodipodi|sketch):[a-z\-]+="[^"]*"/gi, '');

      // Remove data- attributes
      s = s.replace(/\s+data-[a-z\-]+="[^"]*"/gi, '');

      // Remove xmlns on inner SVG elements (not the root <svg>)
      s = s.replace(/(<(?!svg\b)[a-z][^>]*)\s+xmlns="[^"]*"/gi, '$1');

      // Remove default attribute values
      s = s.replace(/\s+fill-opacity="1"/gi, '');
      s = s.replace(/\s+stroke-opacity="1"/gi, '');
      s = s.replace(/\s+opacity="1"/gi, '');
      s = s.replace(/\s+fill-rule="nonzero"/gi, '');
      s = s.replace(/\s+clip-rule="nonzero"/gi, '');
      s = s.replace(/\s+stroke="none"/gi, '');
      s = s.replace(/\s+stroke-width="1"/gi, '');
      s = s.replace(/\s+stroke-dasharray="none"/gi, '');
      s = s.replace(/\s+stroke-miterlimit="4"/gi, '');
      s = s.replace(/\s+stroke-linecap="butt"/gi, '');
      s = s.replace(/\s+stroke-linejoin="miter"/gi, '');
      s = s.replace(/\s+font-weight="normal"/gi, '');
      s = s.replace(/\s+font-style="normal"/gi, '');
      s = s.replace(/\s+display="inline"/gi, '');
      s = s.replace(/\s+overflow="visible"/gi, '');
      s = s.replace(/\s+visibility="visible"/gi, '');

      // Shorten color hex codes: #AABBCC -> #ABC
      s = s.replace(/#([0-9a-fA-F])\1([0-9a-fA-F])\2([0-9a-fA-F])\3/g, '#$1$2$3');

      // Named colors to shorter hex when possible
      const colorMap = {
        'white': '#fff', 'black': '#000', 'red': '#f00',
        'blue': '#00f', 'green': '#008000', 'yellow': '#ff0',
        'cyan': '#0ff', 'magenta': '#f0f'
      };
      for (const [name, hex] of Object.entries(colorMap)) {
        const re = new RegExp(`(fill|stroke|color|stop-color)="${name}"`, 'gi');
        s = s.replace(re, `$1="${hex}"`);
      }

      // Clean up IDs: shorten long IDs
      let idCounter = 0;
      const idMap = {};
      s = s.replace(/\bid="([^"]+)"/g, (match, id) => {
        const short = 'a' + (idCounter++).toString(36);
        idMap[id] = short;
        return `id="${short}"`;
      });
      // Update references to shortened IDs
      for (const [oldId, newId] of Object.entries(idMap)) {
        const escaped = oldId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        s = s.replace(new RegExp(`url\\(#${escaped}\\)`, 'g'), `url(#${newId})`);
        s = s.replace(new RegExp(`href="#${escaped}"`, 'g'), `href="#${newId}"`);
        s = s.replace(new RegExp(`xlink:href="#${escaped}"`, 'g'), `xlink:href="#${newId}"`);
      }

      // Collapse multiple whitespace to single space
      s = s.replace(/\s{2,}/g, ' ');

      // Remove whitespace between tags
      s = s.replace(/>\s+</g, '><');

      // Remove trailing whitespace in attributes
      s = s.replace(/\s+>/g, '>');
      s = s.replace(/\s+\/>/g, '/>');

      // Trim
      s = s.trim();

      return s;
    }

    function formatBytes(bytes) {
      if (bytes < 1024) return bytes + ' B';
      return (bytes / 1024).toFixed(1) + ' KB';
    }

    document.getElementById('svgo-paste').addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        document.getElementById('svgo-input').value = text;
      } catch (e) {
        App.utils.toast('Could not read clipboard');
      }
    });

    document.getElementById('svgo-optimize').addEventListener('click', () => {
      const input = document.getElementById('svgo-input').value.trim();
      if (!input) {
        App.utils.toast('Please paste SVG code first');
        return;
      }
      if (!input.includes('<svg')) {
        App.utils.toast('Input does not appear to be SVG');
        return;
      }

      const optimized = optimizeSVG(input);
      const origBytes = new Blob([input]).size;
      const optBytes = new Blob([optimized]).size;
      const saved = origBytes - optBytes;
      const pct = ((saved / origBytes) * 100).toFixed(1);

      document.getElementById('svgo-orig-bytes').textContent = formatBytes(origBytes);
      document.getElementById('svgo-opt-bytes').textContent = formatBytes(optBytes);
      document.getElementById('svgo-saved').textContent = `${formatBytes(saved)} (${pct}%)`;

      document.getElementById('svgo-output').textContent = optimized;

      // Previews
      const origBlob = new Blob([input], { type: 'image/svg+xml' });
      const optBlob = new Blob([optimized], { type: 'image/svg+xml' });
      document.getElementById('svgo-preview-orig').innerHTML =
        `<img src="${URL.createObjectURL(origBlob)}" style="max-width:100%;max-height:200px">`;
      document.getElementById('svgo-preview-opt').innerHTML =
        `<img src="${URL.createObjectURL(optBlob)}" style="max-width:100%;max-height:200px">`;

      document.getElementById('svgo-result').classList.remove('hidden');
      App.utils.toast('SVG optimized!');
    });

    document.getElementById('svgo-copy').addEventListener('click', () => {
      const output = document.getElementById('svgo-output').textContent;
      App.utils.copyToClipboard(output);
    });
  }
});


// ========================================
// 3. Placeholder Generator
// ========================================
App.registerTool({
  id: 'placeholder-generator',
  name: '占位图生成器',
  description: 'Generate placeholder images with custom dimensions and text',
  category: '图片',
  icon: '🖼️',

  render() {
    return `
      <div class="tool-row">
        <div class="tool-col">
          <label class="tool-label">Width (px)</label>
          <input type="number" class="tool-input" id="ph-width" value="400" min="1" max="4000">
        </div>
        <div class="tool-col">
          <label class="tool-label">Height (px)</label>
          <input type="number" class="tool-input" id="ph-height" value="300" min="1" max="4000">
        </div>
      </div>
      <div class="tool-row">
        <div class="tool-col">
          <label class="tool-label">Background Color</label>
          <div class="tool-color-wrapper">
            <input type="color" class="tool-color-input" id="ph-bg" value="#cccccc">
            <input type="text" class="tool-input" id="ph-bg-hex" value="#cccccc" style="width:100px">
          </div>
        </div>
        <div class="tool-col">
          <label class="tool-label">Text Color</label>
          <div class="tool-color-wrapper">
            <input type="color" class="tool-color-input" id="ph-fg" value="#666666">
            <input type="text" class="tool-input" id="ph-fg-hex" value="#666666" style="width:100px">
          </div>
        </div>
      </div>
      <div class="tool-row">
        <div class="tool-col">
          <label class="tool-label">Custom Text (leave empty for WxH)</label>
          <input type="text" class="tool-input" id="ph-text" placeholder="e.g. Logo Here">
        </div>
        <div class="tool-col">
          <label class="tool-label">Font Size (0 = auto)</label>
          <input type="number" class="tool-input" id="ph-fontsize" value="0" min="0" max="500">
        </div>
      </div>

      <div class="canvas-container" id="ph-preview-container">
        <canvas id="ph-canvas"></canvas>
      </div>

      <div class="tool-btn-group">
        <button class="tool-btn tool-btn-primary" id="ph-download">Download PNG</button>
        <button class="tool-btn" id="ph-copy-uri">Copy Data URI</button>
      </div>
    `;
  },

  init() {
    const canvas = document.getElementById('ph-canvas');
    const ctx = canvas.getContext('2d');
    const inputs = ['ph-width', 'ph-height', 'ph-bg', 'ph-fg', 'ph-text', 'ph-fontsize', 'ph-bg-hex', 'ph-fg-hex'];

    function syncColor(colorId, hexId) {
      document.getElementById(colorId).addEventListener('input', (e) => {
        document.getElementById(hexId).value = e.target.value;
        drawPlaceholder();
      });
      document.getElementById(hexId).addEventListener('input', (e) => {
        const val = e.target.value;
        if (/^#[0-9a-fA-F]{6}$/.test(val)) {
          document.getElementById(colorId).value = val;
        }
        drawPlaceholder();
      });
    }

    syncColor('ph-bg', 'ph-bg-hex');
    syncColor('ph-fg', 'ph-fg-hex');

    function drawPlaceholder() {
      const w = parseInt(document.getElementById('ph-width').value) || 400;
      const h = parseInt(document.getElementById('ph-height').value) || 300;
      const bg = document.getElementById('ph-bg').value;
      const fg = document.getElementById('ph-fg').value;
      const customText = document.getElementById('ph-text').value;
      const fontSizeInput = parseInt(document.getElementById('ph-fontsize').value) || 0;

      canvas.width = w;
      canvas.height = h;

      // Background
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Text
      const text = customText || `${w}x${h}`;
      const fontSize = fontSizeInput > 0 ? fontSizeInput : Math.max(12, Math.min(w, h) / 8);
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.fillStyle = fg;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, w / 2, h / 2);
    }

    inputs.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', App.utils.debounce(drawPlaceholder, 100));
    });

    drawPlaceholder();

    document.getElementById('ph-download').addEventListener('click', async () => {
      const w = document.getElementById('ph-width').value || 400;
      const h = document.getElementById('ph-height').value || 300;
      const blob = await App.utils.canvasToBlob(canvas, 'image/png');
      App.utils.downloadFile(blob, `placeholder-${w}x${h}.png`);
    });

    document.getElementById('ph-copy-uri').addEventListener('click', () => {
      const uri = canvas.toDataURL('image/png');
      App.utils.copyToClipboard(uri);
    });
  }
});


// ========================================
// 4. Favicon Generator
// ========================================
App.registerTool({
  id: 'favicon-generator',
  name: 'Favicon 生成器',
  description: 'Generate favicons at all standard sizes from a single image',
  category: '图片',
  icon: '⭐',

  render() {
    return `
      <div class="upload-area" id="fav-upload">
        <span class="upload-icon">📁</span>
        <p>Drop image here or click to upload (PNG, JPG, SVG)</p>
        <input type="file" id="fav-file" accept="image/*,.svg">
      </div>

      <div id="fav-controls" class="hidden">
        <div class="tool-section">
          <div class="tool-section-title">Source Preview</div>
          <div class="canvas-container" style="max-height:200px">
            <img id="fav-source-preview" style="max-height:180px">
          </div>
        </div>

        <div class="tool-btn-group" style="margin-bottom:16px">
          <button class="tool-btn tool-btn-primary" id="fav-generate">Generate All Sizes</button>
        </div>

        <div id="fav-result" class="hidden">
          <div class="tool-section">
            <div class="tool-section-title">Generated Favicons</div>
            <div class="result-grid" id="fav-grid" style="grid-template-columns: repeat(auto-fill, minmax(100px, 1fr))"></div>
          </div>

          <div class="tool-btn-group" style="margin-bottom:16px">
            <button class="tool-btn tool-btn-primary" id="fav-download-zip">Download All as ZIP</button>
          </div>

          <div class="tool-section">
            <div class="tool-section-title">HTML Code</div>
            <div class="tool-output" style="max-height:200px;overflow:auto">
              <button class="tool-btn tool-btn-sm copy-btn" id="fav-copy-html">Copy</button>
              <code id="fav-html-code"></code>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  init() {
    let sourceImg = null;
    const sizes = [16, 32, 48, 64, 128, 180, 192, 512];
    const generatedFiles = [];

    App.utils.setupUpload('fav-upload', 'fav-file', async (file) => {
      try {
        const dataUrl = await App.utils.readFileAs(file, 'dataurl');
        sourceImg = await App.utils.loadImage(dataUrl);
        document.getElementById('fav-source-preview').src = dataUrl;
        document.getElementById('fav-controls').classList.remove('hidden');
        document.getElementById('fav-result').classList.add('hidden');
      } catch (e) {
        App.utils.toast('Error loading image');
      }
    });

    document.getElementById('fav-generate').addEventListener('click', async () => {
      if (!sourceImg) return;

      generatedFiles.length = 0;
      const grid = document.getElementById('fav-grid');
      grid.innerHTML = '';

      for (const size of sizes) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(sourceImg, 0, 0, size, size);

        const blob = await App.utils.canvasToBlob(canvas, 'image/png');
        const label = size === 180 ? `${size}x${size} (apple)` : `${size}x${size}`;
        const filename = size === 180 ? 'apple-touch-icon.png' : `favicon-${size}x${size}.png`;

        generatedFiles.push({ name: filename, data: blob });

        const url = URL.createObjectURL(blob);
        const card = document.createElement('div');
        card.className = 'result-card';
        card.innerHTML = `
          <div style="margin-bottom:8px">
            <img src="${url}" style="width:${Math.min(size, 64)}px;height:${Math.min(size, 64)}px;image-rendering:pixelated">
          </div>
          <div class="result-label">${label}</div>
        `;
        grid.appendChild(card);
      }

      // Generate HTML snippet
      const htmlCode = `<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png">
<link rel="icon" type="image/png" sizes="64x64" href="/favicon-64x64.png">
<link rel="icon" type="image/png" sizes="128x128" href="/favicon-128x128.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png">
<link rel="icon" type="image/png" sizes="512x512" href="/favicon-512x512.png">`;

      document.getElementById('fav-html-code').textContent = htmlCode;
      document.getElementById('fav-result').classList.remove('hidden');
      App.utils.toast('Favicons generated!');
    });

    document.getElementById('fav-download-zip').addEventListener('click', async () => {
      if (generatedFiles.length === 0) return;
      await App.utils.downloadZip(generatedFiles, 'favicons.zip');
    });

    document.getElementById('fav-copy-html').addEventListener('click', () => {
      App.utils.copyToClipboard(document.getElementById('fav-html-code').textContent);
    });
  }
});


// ========================================
// 5. Watermarker
// ========================================
App.registerTool({
  id: 'watermarker',
  name: '水印工具',
  description: 'Add text watermarks to images',
  category: '图片',
  icon: '💧',

  render() {
    return `
      <div class="upload-area" id="wm-upload">
        <span class="upload-icon">📁</span>
        <p>Drop image here or click to upload</p>
        <input type="file" id="wm-file" accept="image/*">
      </div>

      <div id="wm-controls" class="hidden">
        <div class="tool-row">
          <div class="tool-col">
            <label class="tool-label">Watermark Text</label>
            <input type="text" class="tool-input" id="wm-text" value="WATERMARK" placeholder="Enter watermark text">
          </div>
          <div class="tool-col">
            <label class="tool-label">Font Family</label>
            <select class="tool-select" id="wm-font">
              <option value="Arial">Arial</option>
              <option value="Georgia">Georgia</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier New">Courier New</option>
              <option value="Verdana">Verdana</option>
              <option value="Impact">Impact</option>
              <option value="JetBrains Mono, monospace" selected>JetBrains Mono</option>
            </select>
          </div>
        </div>
        <div class="tool-row">
          <div class="tool-col">
            <label class="tool-label">Font Size: <span id="wm-size-val">48</span>px</label>
            <input type="range" class="tool-range" id="wm-size" min="8" max="200" value="48">
          </div>
          <div class="tool-col">
            <label class="tool-label">Opacity: <span id="wm-opacity-val">30</span>%</label>
            <input type="range" class="tool-range" id="wm-opacity" min="1" max="100" value="30">
          </div>
        </div>
        <div class="tool-row">
          <div class="tool-col">
            <label class="tool-label">Text Color</label>
            <div class="tool-color-wrapper">
              <input type="color" class="tool-color-input" id="wm-color" value="#ffffff">
            </div>
          </div>
          <div class="tool-col">
            <label class="tool-label">Position</label>
            <select class="tool-select" id="wm-position">
              <option value="center">Center</option>
              <option value="bottom-right">Bottom Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="top-right">Top Right</option>
              <option value="top-left">Top Left</option>
              <option value="tiled">Tiled</option>
            </select>
          </div>
        </div>
        <div class="tool-row">
          <div class="tool-col">
            <label class="tool-label">Rotation: <span id="wm-rotation-val">-30</span> deg</label>
            <input type="range" class="tool-range" id="wm-rotation" min="-180" max="180" value="-30">
          </div>
        </div>

        <div class="canvas-container">
          <canvas id="wm-canvas"></canvas>
        </div>

        <div class="tool-btn-group">
          <button class="tool-btn tool-btn-primary" id="wm-download">Download</button>
        </div>
      </div>
    `;
  },

  init() {
    let sourceImg = null;
    const canvas = document.getElementById('wm-canvas');
    const ctx = canvas.getContext('2d');

    function drawWatermark() {
      if (!sourceImg) return;

      const text = document.getElementById('wm-text').value || 'WATERMARK';
      const font = document.getElementById('wm-font').value;
      const size = parseInt(document.getElementById('wm-size').value);
      const opacity = parseInt(document.getElementById('wm-opacity').value) / 100;
      const color = document.getElementById('wm-color').value;
      const position = document.getElementById('wm-position').value;
      const rotation = parseInt(document.getElementById('wm-rotation').value) * (Math.PI / 180);

      canvas.width = sourceImg.naturalWidth;
      canvas.height = sourceImg.naturalHeight;
      ctx.drawImage(sourceImg, 0, 0);

      ctx.globalAlpha = opacity;
      ctx.fillStyle = color;
      ctx.font = `bold ${size}px ${font}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const w = canvas.width;
      const h = canvas.height;
      const padding = Math.max(size, 20);

      if (position === 'tiled') {
        const metrics = ctx.measureText(text);
        const textWidth = metrics.width;
        const stepX = textWidth + size * 2;
        const stepY = size * 3;

        for (let y = -h; y < h * 2; y += stepY) {
          for (let x = -w; x < w * 2; x += stepX) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotation);
            ctx.fillText(text, 0, 0);
            ctx.restore();
          }
        }
      } else {
        let x, y;
        switch (position) {
          case 'center': x = w / 2; y = h / 2; break;
          case 'bottom-right':
            ctx.textAlign = 'right';
            x = w - padding; y = h - padding; break;
          case 'bottom-left':
            ctx.textAlign = 'left';
            x = padding; y = h - padding; break;
          case 'top-right':
            ctx.textAlign = 'right';
            x = w - padding; y = padding; break;
          case 'top-left':
            ctx.textAlign = 'left';
            x = padding; y = padding; break;
          default: x = w / 2; y = h / 2;
        }

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.fillText(text, 0, 0);
        ctx.restore();
      }

      ctx.globalAlpha = 1;
    }

    // Bind sliders to value display and redraw
    ['wm-size', 'wm-opacity', 'wm-rotation'].forEach(id => {
      const el = document.getElementById(id);
      const valEl = document.getElementById(id + '-val');
      el.addEventListener('input', () => {
        valEl.textContent = el.value;
        drawWatermark();
      });
    });

    // Other controls
    ['wm-text', 'wm-font', 'wm-color', 'wm-position'].forEach(id => {
      document.getElementById(id).addEventListener('input', App.utils.debounce(drawWatermark, 100));
    });
    document.getElementById('wm-position').addEventListener('change', drawWatermark);

    App.utils.setupUpload('wm-upload', 'wm-file', async (file) => {
      try {
        const dataUrl = await App.utils.readFileAs(file, 'dataurl');
        sourceImg = await App.utils.loadImage(dataUrl);
        document.getElementById('wm-controls').classList.remove('hidden');
        drawWatermark();
      } catch (e) {
        App.utils.toast('Error loading image');
      }
    });

    document.getElementById('wm-download').addEventListener('click', async () => {
      if (!sourceImg) return;
      const blob = await App.utils.canvasToBlob(canvas, 'image/png');
      App.utils.downloadFile(blob, 'watermarked.png');
    });
  }
});


// ========================================
// 6. Image Splitter
// ========================================
App.registerTool({
  id: 'image-splitter',
  name: '图片切割',
  description: 'Split an image into a grid of tiles',
  category: '图片',
  icon: '🔲',

  render() {
    return `
      <div class="upload-area" id="is-upload">
        <span class="upload-icon">📁</span>
        <p>Drop image here or click to upload</p>
        <input type="file" id="is-file" accept="image/*">
      </div>

      <div id="is-controls" class="hidden">
        <div class="tool-row">
          <div class="tool-col">
            <label class="tool-label">Columns</label>
            <input type="number" class="tool-input" id="is-cols" value="3" min="1" max="20">
          </div>
          <div class="tool-col">
            <label class="tool-label">Rows</label>
            <input type="number" class="tool-input" id="is-rows" value="3" min="1" max="20">
          </div>
        </div>

        <div class="tool-section">
          <div class="tool-section-title">Preview (grid overlay)</div>
          <div class="canvas-container">
            <canvas id="is-preview-canvas"></canvas>
          </div>
        </div>

        <div class="tool-btn-group" style="margin-bottom:16px">
          <button class="tool-btn tool-btn-primary" id="is-split">Split & Download ZIP</button>
        </div>

        <div id="is-tiles-result" class="hidden">
          <div class="tool-section">
            <div class="tool-section-title">Generated Tiles</div>
            <div class="result-grid" id="is-tiles-grid"></div>
          </div>
        </div>
      </div>
    `;
  },

  init() {
    let sourceImg = null;
    const previewCanvas = document.getElementById('is-preview-canvas');
    const previewCtx = previewCanvas.getContext('2d');

    function drawPreview() {
      if (!sourceImg) return;
      const cols = parseInt(document.getElementById('is-cols').value) || 3;
      const rows = parseInt(document.getElementById('is-rows').value) || 3;

      previewCanvas.width = sourceImg.naturalWidth;
      previewCanvas.height = sourceImg.naturalHeight;
      previewCtx.drawImage(sourceImg, 0, 0);

      // Draw grid lines
      previewCtx.strokeStyle = 'rgba(0, 255, 136, 0.8)';
      previewCtx.lineWidth = Math.max(1, Math.min(sourceImg.naturalWidth, sourceImg.naturalHeight) / 300);
      previewCtx.setLineDash([8, 4]);

      const tileW = sourceImg.naturalWidth / cols;
      const tileH = sourceImg.naturalHeight / rows;

      // Vertical lines
      for (let c = 1; c < cols; c++) {
        previewCtx.beginPath();
        previewCtx.moveTo(c * tileW, 0);
        previewCtx.lineTo(c * tileW, sourceImg.naturalHeight);
        previewCtx.stroke();
      }
      // Horizontal lines
      for (let r = 1; r < rows; r++) {
        previewCtx.beginPath();
        previewCtx.moveTo(0, r * tileH);
        previewCtx.lineTo(sourceImg.naturalWidth, r * tileH);
        previewCtx.stroke();
      }
      previewCtx.setLineDash([]);
    }

    App.utils.setupUpload('is-upload', 'is-file', async (file) => {
      try {
        const dataUrl = await App.utils.readFileAs(file, 'dataurl');
        sourceImg = await App.utils.loadImage(dataUrl);
        document.getElementById('is-controls').classList.remove('hidden');
        document.getElementById('is-tiles-result').classList.add('hidden');
        drawPreview();
      } catch (e) {
        App.utils.toast('Error loading image');
      }
    });

    ['is-cols', 'is-rows'].forEach(id => {
      document.getElementById(id).addEventListener('input', App.utils.debounce(drawPreview, 150));
    });

    document.getElementById('is-split').addEventListener('click', async () => {
      if (!sourceImg) return;

      const cols = parseInt(document.getElementById('is-cols').value) || 3;
      const rows = parseInt(document.getElementById('is-rows').value) || 3;
      const tileW = Math.floor(sourceImg.naturalWidth / cols);
      const tileH = Math.floor(sourceImg.naturalHeight / rows);

      const files = [];
      const grid = document.getElementById('is-tiles-grid');
      grid.innerHTML = '';

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const tileCanvas = document.createElement('canvas');
          tileCanvas.width = tileW;
          tileCanvas.height = tileH;
          const tileCtx = tileCanvas.getContext('2d');
          tileCtx.drawImage(sourceImg, c * tileW, r * tileH, tileW, tileH, 0, 0, tileW, tileH);

          const blob = await App.utils.canvasToBlob(tileCanvas, 'image/png');
          const name = `tile_${r + 1}_${c + 1}.png`;
          files.push({ name, data: blob });

          // Preview card
          const url = URL.createObjectURL(blob);
          const card = document.createElement('div');
          card.className = 'result-card';
          card.innerHTML = `
            <img src="${url}" style="max-width:100%;max-height:80px;margin-bottom:4px">
            <div class="result-label">R${r + 1} C${c + 1}</div>
          `;
          grid.appendChild(card);
        }
      }

      document.getElementById('is-tiles-result').classList.remove('hidden');

      await App.utils.downloadZip(files, 'image-tiles.zip');
      App.utils.toast(`Split into ${cols * rows} tiles!`);
    });
  }
});


// ========================================
// 7. Matte Generator
// ========================================
App.registerTool({
  id: 'matte-generator',
  name: '背景填充',
  description: 'Add a coloured matte/border around an image',
  category: '图片',
  icon: '🖼️',

  render() {
    return `
      <div class="upload-area" id="mg-upload">
        <span class="upload-icon">📁</span>
        <p>Drop image here or click to upload</p>
        <input type="file" id="mg-file" accept="image/*">
      </div>

      <div id="mg-controls" class="hidden">
        <div class="tool-row">
          <div class="tool-col">
            <label class="tool-label">Matte Color</label>
            <div class="tool-color-wrapper">
              <input type="color" class="tool-color-input" id="mg-color" value="#ffffff">
              <input type="text" class="tool-input" id="mg-color-hex" value="#ffffff" style="width:100px">
            </div>
          </div>
          <div class="tool-col">
            <label class="tool-label">Padding Mode</label>
            <select class="tool-select" id="mg-mode">
              <option value="px">Pixels (px)</option>
              <option value="pct">Percentage (%)</option>
            </select>
          </div>
        </div>
        <div class="tool-row">
          <div class="tool-col">
            <label class="tool-label">Padding Size: <span id="mg-pad-val">40</span><span id="mg-pad-unit">px</span></label>
            <input type="range" class="tool-range" id="mg-padding" min="0" max="500" value="40">
          </div>
        </div>
        <div class="tool-row">
          <div class="tool-col">
            <label class="tool-label" style="display:flex;align-items:center;gap:8px;text-transform:none">
              <input type="checkbox" id="mg-square"> Make result square (add uneven padding)
            </label>
          </div>
        </div>

        <div class="canvas-container">
          <canvas id="mg-canvas"></canvas>
        </div>

        <div class="tool-btn-group">
          <button class="tool-btn tool-btn-primary" id="mg-download">Download</button>
        </div>
      </div>
    `;
  },

  init() {
    let sourceImg = null;
    const canvas = document.getElementById('mg-canvas');
    const ctx = canvas.getContext('2d');

    function syncColor() {
      const colorInput = document.getElementById('mg-color');
      const hexInput = document.getElementById('mg-color-hex');
      colorInput.addEventListener('input', () => {
        hexInput.value = colorInput.value;
        drawMatte();
      });
      hexInput.addEventListener('input', () => {
        if (/^#[0-9a-fA-F]{6}$/.test(hexInput.value)) {
          colorInput.value = hexInput.value;
        }
        drawMatte();
      });
    }
    syncColor();

    function drawMatte() {
      if (!sourceImg) return;

      const color = document.getElementById('mg-color').value;
      const mode = document.getElementById('mg-mode').value;
      const padVal = parseInt(document.getElementById('mg-padding').value) || 0;
      const makeSquare = document.getElementById('mg-square').checked;

      const imgW = sourceImg.naturalWidth;
      const imgH = sourceImg.naturalHeight;

      let padPx;
      if (mode === 'pct') {
        padPx = Math.round(Math.max(imgW, imgH) * padVal / 100);
      } else {
        padPx = padVal;
      }

      let totalW, totalH, offsetX, offsetY;

      if (makeSquare) {
        // Make the result square
        const maxDim = Math.max(imgW, imgH) + padPx * 2;
        totalW = maxDim;
        totalH = maxDim;
        offsetX = Math.round((maxDim - imgW) / 2);
        offsetY = Math.round((maxDim - imgH) / 2);
      } else {
        totalW = imgW + padPx * 2;
        totalH = imgH + padPx * 2;
        offsetX = padPx;
        offsetY = padPx;
      }

      canvas.width = totalW;
      canvas.height = totalH;

      ctx.fillStyle = color;
      ctx.fillRect(0, 0, totalW, totalH);
      ctx.drawImage(sourceImg, offsetX, offsetY);
    }

    // Update padding mode units
    document.getElementById('mg-mode').addEventListener('change', () => {
      const mode = document.getElementById('mg-mode').value;
      const slider = document.getElementById('mg-padding');
      const unit = document.getElementById('mg-pad-unit');
      if (mode === 'pct') {
        slider.max = 100;
        if (parseInt(slider.value) > 100) slider.value = 20;
        unit.textContent = '%';
      } else {
        slider.max = 500;
        unit.textContent = 'px';
      }
      document.getElementById('mg-pad-val').textContent = slider.value;
      drawMatte();
    });

    document.getElementById('mg-padding').addEventListener('input', (e) => {
      document.getElementById('mg-pad-val').textContent = e.target.value;
      drawMatte();
    });

    document.getElementById('mg-square').addEventListener('change', drawMatte);

    App.utils.setupUpload('mg-upload', 'mg-file', async (file) => {
      try {
        const dataUrl = await App.utils.readFileAs(file, 'dataurl');
        sourceImg = await App.utils.loadImage(dataUrl);
        document.getElementById('mg-controls').classList.remove('hidden');
        drawMatte();
      } catch (e) {
        App.utils.toast('Error loading image');
      }
    });

    document.getElementById('mg-download').addEventListener('click', async () => {
      if (!sourceImg) return;
      const blob = await App.utils.canvasToBlob(canvas, 'image/png');
      App.utils.downloadFile(blob, 'matted-image.png');
    });
  }
});

// PNG to ICO Converter
App.registerTool({
  id: 'png-to-ico',
  name: 'PNG 转 ICO',
  description: '将 PNG 图片转换为 ICO 格式，支持多尺寸（16/32/48/64/128/256px）',
  category: '图片',
  icon: '🪟',
  render() {
    return `
      <div class="tool-section">
        <label class="upload-label" id="ico-upload-label">
          <span class="upload-icon">📁</span>
          <span>拖拽或点击上传 PNG 图片</span>
          <input type="file" id="ico-file-input" accept=".png,image/png" style="display:none">
        </label>
        <div id="ico-preview" style="display:none;margin-top:16px">
          <img id="ico-original-img" style="max-width:200px;max-height:200px;border-radius:8px;border:1px solid var(--border)">
          <p id="ico-img-info" style="color:var(--text-muted);margin-top:8px;font-size:13px"></p>
        </div>
      </div>
      <div class="tool-section">
        <div class="tool-section-title">输出尺寸</div>
        <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:8px" id="ico-sizes">
          ${[16,32,48,64,128,256].map(s => `
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:8px 12px;border:1px solid var(--border);border-radius:6px;background:var(--surface)">
              <input type="checkbox" value="${s}" ${[16,32,48].includes(s)?'checked':''} class="ico-size-check">
              <span style="font-family:monospace">${s}×${s}</span>
            </label>
          `).join('')}
        </div>
      </div>
      <button class="btn btn-primary" id="ico-convert-btn" style="margin-top:8px" disabled>转换并下载 .ico</button>
      <div id="ico-status" style="margin-top:12px;font-size:13px;color:var(--accent)"></div>
    `;
  },
  init() {
    const input = document.getElementById('ico-file-input');
    const label = document.getElementById('ico-upload-label');
    const btn = document.getElementById('ico-convert-btn');
    let imgData = null;

    const loadFile = file => {
      if (!file || !file.type.includes('png')) {
        App.utils.toast('请上传 PNG 格式图片');
        return;
      }
      const reader = new FileReader();
      reader.onload = e => {
        const img = document.getElementById('ico-original-img');
        img.src = e.target.result;
        img.onload = () => {
          document.getElementById('ico-preview').style.display = '';
          document.getElementById('ico-img-info').textContent = `${img.naturalWidth} × ${img.naturalHeight}px`;
          imgData = img;
          btn.disabled = false;
        };
      };
      reader.readAsDataURL(file);
    };

    input.addEventListener('change', e => loadFile(e.target.files[0]));
    label.addEventListener('dragover', e => { e.preventDefault(); label.style.borderColor = 'var(--accent)'; });
    label.addEventListener('dragleave', () => { label.style.borderColor = ''; });
    label.addEventListener('drop', e => { e.preventDefault(); label.style.borderColor = ''; loadFile(e.dataTransfer.files[0]); });

    btn.addEventListener('click', () => {
      const sizes = [...document.querySelectorAll('.ico-size-check')]
        .filter(c => c.checked).map(c => parseInt(c.value));
      if (!sizes.length) { App.utils.toast('请至少选择一个尺寸'); return; }
      document.getElementById('ico-status').textContent = '生成中...';

      // Render each size to canvas → PNG blob
      Promise.all(sizes.map(size => new Promise(resolve => {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = size;
        canvas.getContext('2d').drawImage(imgData, 0, 0, size, size);
        canvas.toBlob(blob => blob.arrayBuffer().then(buf => resolve({ size, buf })), 'image/png');
      }))).then(entries => {
        const ico = buildIco(entries);
        const url = URL.createObjectURL(new Blob([ico], { type: 'image/x-icon' }));
        const a = document.createElement('a'); a.href = url; a.download = 'favicon.ico'; a.click();
        URL.revokeObjectURL(url);
        document.getElementById('ico-status').textContent = `✓ 已下载 favicon.ico（${sizes.join('/')}px）`;
      });
    });

    function buildIco(entries) {
      // ICO format: ICONDIR + ICONDIRENTRY × n + PNG data × n
      const n = entries.length;
      const dirSize = 6 + 16 * n;
      let offset = dirSize;
      const offsets = entries.map(e => { const o = offset; offset += e.buf.byteLength; return o; });
      const total = offset;
      const buf = new ArrayBuffer(total);
      const view = new DataView(buf);
      // ICONDIR
      view.setUint16(0, 0, true);  // reserved
      view.setUint16(2, 1, true);  // type: ICO
      view.setUint16(4, n, true);  // count
      // ICONDIRENTRY × n
      entries.forEach((e, i) => {
        const base = 6 + 16 * i;
        const s = e.size === 256 ? 0 : e.size;
        view.setUint8(base, s);      // width (0 = 256)
        view.setUint8(base+1, s);    // height
        view.setUint8(base+2, 0);    // color count
        view.setUint8(base+3, 0);    // reserved
        view.setUint16(base+4, 1, true);  // planes
        view.setUint16(base+6, 32, true); // bit count
        view.setUint32(base+8, e.buf.byteLength, true);  // size
        view.setUint32(base+12, offsets[i], true);       // offset
      });
      // PNG data
      const u8 = new Uint8Array(buf);
      entries.forEach((e, i) => u8.set(new Uint8Array(e.buf), offsets[i]));
      return buf;
    }
  }
});
