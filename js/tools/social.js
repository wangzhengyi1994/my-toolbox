/* ========================================
   SOCIAL MEDIA TOOLS
   ======================================== */

// ========================================
// 1. Social Media Cropper
// ========================================
App.registerTool({
  id: 'social-media-cropper',
  name: 'Social Media Cropper',
  description: 'Crop images to perfect social media dimensions',
  category: 'Social Media',
  icon: '✂️',

  render() {
    return `
      <div class="upload-area" id="smc-upload">
        <span class="upload-icon">📁</span>
        <p>Drop image here or click to upload</p>
        <input type="file" id="smc-file" accept="image/*">
      </div>

      <div id="smc-controls" class="hidden">
        <div class="tool-section">
          <div class="tool-section-title">Source Image</div>
          <div id="smc-info" style="font-size:13px;color:var(--text-dim);margin-bottom:12px"></div>
        </div>

        <div class="tool-section">
          <div class="tool-section-title">Choose Platform Preset</div>
          <div class="result-grid" id="smc-presets" style="grid-template-columns:repeat(auto-fill,minmax(170px,1fr))"></div>
        </div>

        <div id="smc-crop-area" class="hidden">
          <div class="tool-section">
            <div class="tool-section-title">Crop Preview — <span id="smc-preset-label"></span> <span id="smc-preset-dims" style="color:var(--text-dim);font-weight:400"></span></div>
            <div class="canvas-container" style="position:relative;overflow:hidden;cursor:move" id="smc-canvas-container">
              <canvas id="smc-canvas"></canvas>
              <div id="smc-crop-overlay" style="position:absolute;top:0;left:0;pointer-events:none"></div>
            </div>
          </div>

          <div class="tool-section">
            <div class="tool-section-title">Cropped Result</div>
            <div class="canvas-container">
              <canvas id="smc-result-canvas"></canvas>
            </div>
          </div>

          <div class="tool-btn-group">
            <button class="tool-btn tool-btn-primary" id="smc-download">Download Cropped Image</button>
          </div>
        </div>
      </div>
    `;
  },

  init() {
    let sourceImg = null;
    let currentPreset = null;
    let cropX = 0;
    let cropY = 0;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let cropStartX = 0;
    let cropStartY = 0;
    // Scale factor: how source pixels map to display pixels on the preview canvas
    let displayScale = 1;

    const presets = [
      { name: 'Instagram Post',       w: 1080, h: 1080, platform: 'Instagram' },
      { name: 'Instagram Story',      w: 1080, h: 1920, platform: 'Instagram' },
      { name: 'Instagram Landscape',  w: 1080, h: 566,  platform: 'Instagram' },
      { name: 'Twitter/X Post',       w: 1200, h: 675,  platform: 'Twitter/X' },
      { name: 'Twitter/X Header',     w: 1500, h: 500,  platform: 'Twitter/X' },
      { name: 'Facebook Post',        w: 1200, h: 630,  platform: 'Facebook' },
      { name: 'Facebook Cover',       w: 820,  h: 312,  platform: 'Facebook' },
      { name: 'LinkedIn Post',        w: 1200, h: 627,  platform: 'LinkedIn' },
      { name: 'LinkedIn Banner',      w: 1584, h: 396,  platform: 'LinkedIn' },
      { name: 'YouTube Thumbnail',    w: 1280, h: 720,  platform: 'YouTube' },
      { name: 'Pinterest Pin',        w: 1000, h: 1500, platform: 'Pinterest' }
    ];

    const platformIcons = {
      'Instagram': '📸', 'Twitter/X': '🐦', 'Facebook': '👤',
      'LinkedIn': '💼', 'YouTube': '▶️', 'Pinterest': '📌'
    };

    // Render preset cards
    const presetsGrid = document.getElementById('smc-presets');
    presetsGrid.innerHTML = presets.map((p, i) => `
      <div class="result-card smc-preset-card" data-index="${i}" style="cursor:pointer;text-align:center;padding:12px">
        <div style="font-size:20px;margin-bottom:4px">${platformIcons[p.platform] || '📱'}</div>
        <div style="font-weight:600;font-size:13px">${p.name}</div>
        <div style="font-size:11px;color:var(--text-dim)">${p.w} x ${p.h}</div>
      </div>
    `).join('');

    App.utils.setupUpload('smc-upload', 'smc-file', async (file) => {
      try {
        const dataUrl = await App.utils.readFileAs(file, 'dataurl');
        sourceImg = await App.utils.loadImage(dataUrl);
        document.getElementById('smc-controls').classList.remove('hidden');
        document.getElementById('smc-crop-area').classList.add('hidden');
        document.getElementById('smc-info').textContent =
          `${sourceImg.naturalWidth} x ${sourceImg.naturalHeight} pixels`;
        // Reset any active preset highlight
        document.querySelectorAll('.smc-preset-card').forEach(c => c.style.outline = '');
      } catch (e) {
        App.utils.toast('Error loading image');
      }
    });

    // Preset card click
    presetsGrid.addEventListener('click', (e) => {
      const card = e.target.closest('.smc-preset-card');
      if (!card || !sourceImg) return;
      const idx = parseInt(card.dataset.index);
      currentPreset = presets[idx];

      // Highlight active card
      document.querySelectorAll('.smc-preset-card').forEach(c => c.style.outline = '');
      card.style.outline = '2px solid var(--primary)';

      document.getElementById('smc-preset-label').textContent = currentPreset.name;
      document.getElementById('smc-preset-dims').textContent = `(${currentPreset.w}x${currentPreset.h})`;

      initCrop();
      document.getElementById('smc-crop-area').classList.remove('hidden');
    });

    function initCrop() {
      if (!sourceImg || !currentPreset) return;

      const canvas = document.getElementById('smc-canvas');
      const ctx = canvas.getContext('2d');
      const container = document.getElementById('smc-canvas-container');

      // Determine display size (fit within 700px width)
      const maxDisplayW = Math.min(700, container.parentElement.clientWidth - 32);
      displayScale = Math.min(1, maxDisplayW / sourceImg.naturalWidth);
      const displayW = Math.round(sourceImg.naturalWidth * displayScale);
      const displayH = Math.round(sourceImg.naturalHeight * displayScale);

      canvas.width = displayW;
      canvas.height = displayH;
      canvas.style.width = displayW + 'px';
      canvas.style.height = displayH + 'px';

      // Center crop in source coordinates
      const presetAspect = currentPreset.w / currentPreset.h;
      const imgAspect = sourceImg.naturalWidth / sourceImg.naturalHeight;

      let cropW, cropH;
      if (presetAspect > imgAspect) {
        // Preset is wider relative to image: fit width
        cropW = sourceImg.naturalWidth;
        cropH = Math.round(cropW / presetAspect);
      } else {
        // Preset is taller relative to image: fit height
        cropH = sourceImg.naturalHeight;
        cropW = Math.round(cropH * presetAspect);
      }

      cropX = Math.round((sourceImg.naturalWidth - cropW) / 2);
      cropY = Math.round((sourceImg.naturalHeight - cropH) / 2);

      drawCropPreview();
      drawResult();
    }

    function drawCropPreview() {
      if (!sourceImg || !currentPreset) return;

      const canvas = document.getElementById('smc-canvas');
      const ctx = canvas.getContext('2d');

      // Draw full image at display scale
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(sourceImg, 0, 0, canvas.width, canvas.height);

      // Calculate crop rect in display coords
      const presetAspect = currentPreset.w / currentPreset.h;
      const imgAspect = sourceImg.naturalWidth / sourceImg.naturalHeight;

      let cropW, cropH;
      if (presetAspect > imgAspect) {
        cropW = sourceImg.naturalWidth;
        cropH = Math.round(cropW / presetAspect);
      } else {
        cropH = sourceImg.naturalHeight;
        cropW = Math.round(cropH * presetAspect);
      }

      // Clamp crop position
      cropX = App.utils.clamp(cropX, 0, sourceImg.naturalWidth - cropW);
      cropY = App.utils.clamp(cropY, 0, sourceImg.naturalHeight - cropH);

      const dx = Math.round(cropX * displayScale);
      const dy = Math.round(cropY * displayScale);
      const dw = Math.round(cropW * displayScale);
      const dh = Math.round(cropH * displayScale);

      // Dim area outside crop
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      // Top
      ctx.fillRect(0, 0, canvas.width, dy);
      // Bottom
      ctx.fillRect(0, dy + dh, canvas.width, canvas.height - dy - dh);
      // Left
      ctx.fillRect(0, dy, dx, dh);
      // Right
      ctx.fillRect(dx + dw, dy, canvas.width - dx - dw, dh);

      // Crop border
      ctx.strokeStyle = 'var(--primary)';
      ctx.lineWidth = 2;
      ctx.strokeRect(dx, dy, dw, dh);

      // Rule of thirds guides
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1;
      for (let i = 1; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(dx + (dw * i / 3), dy);
        ctx.lineTo(dx + (dw * i / 3), dy + dh);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(dx, dy + (dh * i / 3));
        ctx.lineTo(dx + dw, dy + (dh * i / 3));
        ctx.stroke();
      }
    }

    function drawResult() {
      if (!sourceImg || !currentPreset) return;

      const resultCanvas = document.getElementById('smc-result-canvas');
      const resultCtx = resultCanvas.getContext('2d');

      const presetAspect = currentPreset.w / currentPreset.h;
      const imgAspect = sourceImg.naturalWidth / sourceImg.naturalHeight;

      let cropW, cropH;
      if (presetAspect > imgAspect) {
        cropW = sourceImg.naturalWidth;
        cropH = Math.round(cropW / presetAspect);
      } else {
        cropH = sourceImg.naturalHeight;
        cropW = Math.round(cropH * presetAspect);
      }

      cropX = App.utils.clamp(cropX, 0, sourceImg.naturalWidth - cropW);
      cropY = App.utils.clamp(cropY, 0, sourceImg.naturalHeight - cropH);

      // Output at preset dimensions
      resultCanvas.width = currentPreset.w;
      resultCanvas.height = currentPreset.h;

      resultCtx.drawImage(
        sourceImg,
        cropX, cropY, cropW, cropH,
        0, 0, currentPreset.w, currentPreset.h
      );
    }

    // Draggable crop
    const canvasContainer = document.getElementById('smc-canvas-container');

    canvasContainer.addEventListener('mousedown', (e) => {
      if (!currentPreset || !sourceImg) return;
      isDragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      cropStartX = cropX;
      cropStartY = cropY;
      e.preventDefault();
    });

    canvasContainer.addEventListener('touchstart', (e) => {
      if (!currentPreset || !sourceImg) return;
      isDragging = true;
      dragStartX = e.touches[0].clientX;
      dragStartY = e.touches[0].clientY;
      cropStartX = cropX;
      cropStartY = cropY;
      e.preventDefault();
    }, { passive: false });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;
      // Convert display pixel movement to source pixel movement
      cropX = cropStartX - Math.round(dx / displayScale);
      cropY = cropStartY - Math.round(dy / displayScale);
      drawCropPreview();
      drawResult();
    });

    document.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const dx = e.touches[0].clientX - dragStartX;
      const dy = e.touches[0].clientY - dragStartY;
      cropX = cropStartX - Math.round(dx / displayScale);
      cropY = cropStartY - Math.round(dy / displayScale);
      drawCropPreview();
      drawResult();
    }, { passive: false });

    document.addEventListener('mouseup', () => { isDragging = false; });
    document.addEventListener('touchend', () => { isDragging = false; });

    // Download
    document.getElementById('smc-download').addEventListener('click', async () => {
      if (!sourceImg || !currentPreset) return;
      const resultCanvas = document.getElementById('smc-result-canvas');
      const blob = await App.utils.canvasToBlob(resultCanvas, 'image/png');
      const safeName = currentPreset.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      App.utils.downloadFile(blob, `${safeName}-${currentPreset.w}x${currentPreset.h}.png`);
      App.utils.toast('Image downloaded!');
    });
  }
});


// ========================================
// 2. Seamless Scroll Generator
// ========================================
App.registerTool({
  id: 'seamless-scroll-gen',
  name: 'Seamless Scroll Generator',
  description: 'Split panoramic images into overlapping carousel panels',
  category: 'Social Media',
  icon: '📜',

  render() {
    return `
      <div class="upload-area" id="ssg-upload">
        <span class="upload-icon">📁</span>
        <p>Drop a wide/panoramic image here or click to upload</p>
        <input type="file" id="ssg-file" accept="image/*">
      </div>

      <div id="ssg-controls" class="hidden">
        <div class="tool-section">
          <div class="tool-section-title">Source Image</div>
          <div id="ssg-info" style="font-size:13px;color:var(--text-dim);margin-bottom:8px"></div>
          <div class="canvas-container" style="max-height:200px">
            <canvas id="ssg-source-canvas" style="max-height:180px"></canvas>
          </div>
        </div>

        <div class="tool-row">
          <div class="tool-col">
            <label class="tool-label">Number of Slides: <span id="ssg-slides-val">3</span></label>
            <input type="range" class="tool-range" id="ssg-slides" min="2" max="10" value="3">
          </div>
          <div class="tool-col">
            <label class="tool-label">Overlap: <span id="ssg-overlap-val">10</span>%</label>
            <input type="range" class="tool-range" id="ssg-overlap" min="0" max="40" value="10">
          </div>
        </div>

        <div class="tool-section">
          <div class="tool-section-title">Algorithm Explanation</div>
          <div id="ssg-algo-info" style="font-size:12px;color:var(--text-dim);line-height:1.6"></div>
        </div>

        <div class="tool-btn-group" style="margin-bottom:16px">
          <button class="tool-btn tool-btn-primary" id="ssg-generate">Generate Panels</button>
        </div>

        <div id="ssg-result" class="hidden">
          <div class="tool-section">
            <div class="tool-section-title">Generated Panels</div>
            <div id="ssg-panels" style="display:flex;gap:8px;overflow-x:auto;padding-bottom:8px"></div>
          </div>

          <div class="tool-section">
            <div class="tool-section-title">Panel Dimensions</div>
            <div id="ssg-dims" style="font-size:13px;color:var(--text-dim);line-height:1.8"></div>
          </div>

          <div class="tool-btn-group">
            <button class="tool-btn tool-btn-primary" id="ssg-download-zip">Download All as ZIP</button>
          </div>
        </div>
      </div>
    `;
  },

  init() {
    let sourceImg = null;
    let generatedFiles = [];

    const slidesRange = document.getElementById('ssg-slides');
    const overlapRange = document.getElementById('ssg-overlap');
    const slidesVal = document.getElementById('ssg-slides-val');
    const overlapVal = document.getElementById('ssg-overlap-val');

    slidesRange.addEventListener('input', () => {
      slidesVal.textContent = slidesRange.value;
      updateAlgoInfo();
    });
    overlapRange.addEventListener('input', () => {
      overlapVal.textContent = overlapRange.value;
      updateAlgoInfo();
    });

    function updateAlgoInfo() {
      if (!sourceImg) return;
      const n = parseInt(slidesRange.value);
      const overlapPct = parseInt(overlapRange.value) / 100;
      const imgW = sourceImg.naturalWidth;
      const imgH = sourceImg.naturalHeight;

      // Calculate panel dimensions
      // Each panel has width = panelW. Panels overlap by overlapPx.
      // Total coverage: panelW * n - overlapPx * (n - 1) = imgW
      // panelW * n - panelW * overlapPct * (n - 1) = imgW
      // panelW * (n - overlapPct * (n - 1)) = imgW
      const panelW = Math.round(imgW / (n - overlapPct * (n - 1)));
      const overlapPx = Math.round(panelW * overlapPct);

      document.getElementById('ssg-algo-info').innerHTML =
        `Source: <strong>${imgW} x ${imgH}</strong> px<br>` +
        `Each panel: <strong>${panelW} x ${imgH}</strong> px<br>` +
        `Overlap per edge: <strong>${overlapPx}</strong> px (${Math.round(overlapPct * 100)}% of panel width)<br>` +
        `Total panels: <strong>${n}</strong><br>` +
        `Step (non-overlap advance): <strong>${panelW - overlapPx}</strong> px`;
    }

    App.utils.setupUpload('ssg-upload', 'ssg-file', async (file) => {
      try {
        const dataUrl = await App.utils.readFileAs(file, 'dataurl');
        sourceImg = await App.utils.loadImage(dataUrl);
        document.getElementById('ssg-controls').classList.remove('hidden');
        document.getElementById('ssg-result').classList.add('hidden');
        document.getElementById('ssg-info').textContent =
          `${sourceImg.naturalWidth} x ${sourceImg.naturalHeight} pixels` +
          (sourceImg.naturalWidth > sourceImg.naturalHeight ? ' (landscape)' : '');

        // Draw source preview
        const srcCanvas = document.getElementById('ssg-source-canvas');
        const srcCtx = srcCanvas.getContext('2d');
        srcCanvas.width = sourceImg.naturalWidth;
        srcCanvas.height = sourceImg.naturalHeight;
        srcCtx.drawImage(sourceImg, 0, 0);

        updateAlgoInfo();
      } catch (e) {
        App.utils.toast('Error loading image');
      }
    });

    document.getElementById('ssg-generate').addEventListener('click', async () => {
      if (!sourceImg) return;

      const n = parseInt(slidesRange.value);
      const overlapPct = parseInt(overlapRange.value) / 100;
      const imgW = sourceImg.naturalWidth;
      const imgH = sourceImg.naturalHeight;

      // panelW * (n - overlapPct * (n - 1)) = imgW
      const panelW = Math.round(imgW / (n - overlapPct * (n - 1)));
      const overlapPx = Math.round(panelW * overlapPct);
      const step = panelW - overlapPx;

      generatedFiles = [];
      const panelsContainer = document.getElementById('ssg-panels');
      panelsContainer.innerHTML = '';
      let dimsHtml = '';

      for (let i = 0; i < n; i++) {
        const startX = Math.round(i * step);
        // Ensure last panel does not exceed image width
        const clampedStartX = Math.min(startX, imgW - panelW);
        const actualStartX = Math.max(0, clampedStartX);
        const actualW = Math.min(panelW, imgW - actualStartX);

        const panelCanvas = document.createElement('canvas');
        panelCanvas.width = actualW;
        panelCanvas.height = imgH;
        const panelCtx = panelCanvas.getContext('2d');
        panelCtx.drawImage(sourceImg, actualStartX, 0, actualW, imgH, 0, 0, actualW, imgH);

        const blob = await App.utils.canvasToBlob(panelCanvas, 'image/png');
        const filename = `panel-${i + 1}.png`;
        generatedFiles.push({ name: filename, data: blob });

        // Preview
        const url = URL.createObjectURL(blob);
        const panelDiv = document.createElement('div');
        panelDiv.style.cssText = 'flex:0 0 auto;text-align:center;';
        panelDiv.innerHTML = `
          <div style="border:2px solid var(--border);border-radius:var(--radius-sm);overflow:hidden;margin-bottom:4px">
            <img src="${url}" style="height:180px;display:block">
          </div>
          <div style="font-size:12px;font-weight:600">Panel ${i + 1}</div>
          <div style="font-size:11px;color:var(--text-dim)">${actualW} x ${imgH}</div>
        `;
        panelsContainer.appendChild(panelDiv);

        dimsHtml += `<strong>Panel ${i + 1}:</strong> ${actualW} x ${imgH} px (starts at x=${actualStartX})<br>`;
      }

      document.getElementById('ssg-dims').innerHTML = dimsHtml;
      document.getElementById('ssg-result').classList.remove('hidden');
      App.utils.toast(`Generated ${n} panels!`);
    });

    document.getElementById('ssg-download-zip').addEventListener('click', async () => {
      if (generatedFiles.length === 0) return;
      await App.utils.downloadZip(generatedFiles, 'carousel-panels.zip');
      App.utils.toast('ZIP downloaded!');
    });
  }
});
