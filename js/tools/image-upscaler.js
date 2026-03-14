/* ========================================
   IMAGE UPSCALER TOOL
   ======================================== */

App.registerTool({
  id: 'image-upscaler',
  name: 'Image Upscaler',
  description: 'AI-style image upscaling with advanced interpolation',
  category: 'Image',
  icon: '🔍',

  render() {
    return `
      <div class="upload-area" id="iu-upload">
        <span class="upload-icon">📁</span>
        <p>Drop image here or click to upload</p>
        <input type="file" id="iu-file" accept="image/*">
      </div>

      <div id="iu-controls" class="hidden">
        <div class="tool-section">
          <div class="tool-section-title">Source Image</div>
          <div id="iu-orig-info" style="font-size:13px;color:var(--text-dim);margin-bottom:8px"></div>
        </div>

        <div class="tool-section">
          <div class="tool-section-title">Scale Factor</div>
          <div class="tool-btn-group">
            <button class="tool-btn iu-scale-btn" data-scale="2" style="min-width:80px">2x</button>
            <button class="tool-btn iu-scale-btn" data-scale="4" style="min-width:80px">4x</button>
          </div>
        </div>

        <div id="iu-processing" class="hidden" style="text-align:center;padding:32px 0">
          <div style="font-size:18px;font-weight:600;margin-bottom:8px">Processing...</div>
          <div style="color:var(--text-dim);font-size:13px" id="iu-processing-step">Upscaling image...</div>
        </div>

        <div id="iu-result" class="hidden">
          <div class="tool-section">
            <div class="tool-section-title">Dimensions</div>
            <div class="tool-row">
              <div class="tool-col" style="text-align:center">
                <div class="result-label">Original</div>
                <div id="iu-orig-dims" class="result-value" style="font-size:16px"></div>
              </div>
              <div class="tool-col" style="text-align:center">
                <div style="font-size:24px;color:var(--text-dim)">→</div>
              </div>
              <div class="tool-col" style="text-align:center">
                <div class="result-label">Upscaled</div>
                <div id="iu-new-dims" class="result-value" style="font-size:16px"></div>
              </div>
            </div>
          </div>

          <div class="tool-section">
            <div class="tool-section-title">File Size</div>
            <div class="tool-row">
              <div class="tool-col" style="text-align:center">
                <div class="result-label">Original</div>
                <div id="iu-orig-size" class="result-value" style="font-size:16px"></div>
              </div>
              <div class="tool-col" style="text-align:center">
                <div class="result-label">Upscaled</div>
                <div id="iu-new-size" class="result-value" style="font-size:16px"></div>
              </div>
            </div>
          </div>

          <div class="tool-section">
            <div class="tool-section-title">Before / After Comparison</div>
            <p style="font-size:12px;color:var(--text-dim);margin-bottom:12px">Drag the slider to compare. Left: original (nearest-neighbor). Right: upscaled (sharpened).</p>
            <div id="iu-split-container" style="position:relative;overflow:hidden;border-radius:var(--radius);border:1px solid var(--border);cursor:col-resize;user-select:none">
              <canvas id="iu-split-original" style="position:absolute;top:0;left:0;width:100%;height:100%"></canvas>
              <canvas id="iu-split-upscaled" style="position:absolute;top:0;left:0;width:100%;height:100%;clip-path:inset(0 0 0 50%)"></canvas>
              <div id="iu-split-handle" style="position:absolute;top:0;width:3px;background:var(--primary);cursor:col-resize;left:50%;height:100%;z-index:10">
                <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:28px;height:28px;background:var(--primary);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;color:#fff;font-weight:bold;box-shadow:0 2px 8px rgba(0,0,0,0.3)">&#x21D4;</div>
              </div>
              <div style="position:absolute;top:8px;left:8px;background:rgba(0,0,0,0.6);color:#fff;font-size:11px;padding:2px 8px;border-radius:4px;pointer-events:none;z-index:5">Original</div>
              <div style="position:absolute;top:8px;right:8px;background:rgba(0,0,0,0.6);color:#fff;font-size:11px;padding:2px 8px;border-radius:4px;pointer-events:none;z-index:5">Upscaled</div>
            </div>
          </div>

          <div class="tool-btn-group" style="margin-top:16px">
            <button class="tool-btn tool-btn-primary" id="iu-download">Download Upscaled Image</button>
          </div>
        </div>
      </div>
    `;
  },

  init() {
    let sourceImg = null;
    let originalFile = null;
    let upscaledBlob = null;
    let selectedScale = 2;

    function formatBytes(bytes) {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / 1048576).toFixed(2) + ' MB';
    }

    App.utils.setupUpload('iu-upload', 'iu-file', async (file) => {
      try {
        originalFile = file;
        const dataUrl = await App.utils.readFileAs(file, 'dataurl');
        sourceImg = await App.utils.loadImage(dataUrl);
        document.getElementById('iu-controls').classList.remove('hidden');
        document.getElementById('iu-result').classList.add('hidden');
        document.getElementById('iu-processing').classList.add('hidden');
        document.getElementById('iu-orig-info').textContent =
          `${sourceImg.naturalWidth} x ${sourceImg.naturalHeight} px | ${formatBytes(file.size)}`;

        // Reset button styles
        document.querySelectorAll('.iu-scale-btn').forEach(b => {
          b.classList.remove('tool-btn-primary');
        });
      } catch (e) {
        App.utils.toast('Error loading image');
      }
    });

    // Scale button clicks
    document.querySelectorAll('.iu-scale-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!sourceImg) {
          App.utils.toast('Please upload an image first');
          return;
        }

        selectedScale = parseInt(btn.dataset.scale);

        // Update active button
        document.querySelectorAll('.iu-scale-btn').forEach(b => b.classList.remove('tool-btn-primary'));
        btn.classList.add('tool-btn-primary');

        // Show processing
        document.getElementById('iu-processing').classList.remove('hidden');
        document.getElementById('iu-result').classList.add('hidden');

        // Yield to allow UI to update
        await new Promise(r => setTimeout(r, 50));

        try {
          await processUpscale(selectedScale);
        } catch (e) {
          App.utils.toast('Error processing image');
          document.getElementById('iu-processing').classList.add('hidden');
        }
      });
    });

    async function processUpscale(scale) {
      const origW = sourceImg.naturalWidth;
      const origH = sourceImg.naturalHeight;
      const newW = origW * scale;
      const newH = origH * scale;

      document.getElementById('iu-processing-step').textContent = 'Upscaling image...';
      await new Promise(r => setTimeout(r, 30));

      // Multi-step upscaling for better quality
      let upscaledCanvas;
      if (scale === 2) {
        upscaledCanvas = upscaleStep(sourceImg, origW, origH, newW, newH);
      } else {
        // 4x: do two 2x steps
        const midW = origW * 2;
        const midH = origH * 2;
        const midCanvas = upscaleStep(sourceImg, origW, origH, midW, midH);
        await new Promise(r => setTimeout(r, 30));
        document.getElementById('iu-processing-step').textContent = 'Second upscale pass...';
        await new Promise(r => setTimeout(r, 30));
        upscaledCanvas = upscaleStep(midCanvas, midW, midH, newW, newH);
      }

      // Apply sharpening
      document.getElementById('iu-processing-step').textContent = 'Applying sharpening filter...';
      await new Promise(r => setTimeout(r, 30));

      const sharpenedCanvas = applySharpen(upscaledCanvas, newW, newH);

      // Generate blob for download
      document.getElementById('iu-processing-step').textContent = 'Generating output...';
      await new Promise(r => setTimeout(r, 30));

      upscaledBlob = await App.utils.canvasToBlob(sharpenedCanvas, 'image/png');

      // Update dimensions info
      document.getElementById('iu-orig-dims').textContent = `${origW} x ${origH}`;
      document.getElementById('iu-new-dims').textContent = `${newW} x ${newH}`;
      document.getElementById('iu-orig-size').textContent = formatBytes(originalFile.size);
      document.getElementById('iu-new-size').textContent = formatBytes(upscaledBlob.size);

      // Build split view
      buildSplitView(sourceImg, origW, origH, sharpenedCanvas, newW, newH);

      document.getElementById('iu-processing').classList.add('hidden');
      document.getElementById('iu-result').classList.remove('hidden');
      App.utils.toast(`Image upscaled to ${newW}x${newH}!`);
    }

    function upscaleStep(source, srcW, srcH, dstW, dstH) {
      const canvas = document.createElement('canvas');
      canvas.width = dstW;
      canvas.height = dstH;
      const ctx = canvas.getContext('2d');
      // Use high quality smoothing for Lanczos-like interpolation
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      if (source instanceof HTMLImageElement || source instanceof HTMLCanvasElement) {
        ctx.drawImage(source, 0, 0, dstW, dstH);
      } else {
        ctx.drawImage(source, 0, 0, srcW, srcH, 0, 0, dstW, dstH);
      }
      return canvas;
    }

    function applySharpen(sourceCanvas, w, h) {
      const ctx = sourceCanvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, w, h);
      const src = imageData.data;

      const outCanvas = document.createElement('canvas');
      outCanvas.width = w;
      outCanvas.height = h;
      const outCtx = outCanvas.getContext('2d');
      const outData = outCtx.createImageData(w, h);
      const dst = outData.data;

      // Sharpening kernel:
      //  0 -1  0
      // -1  5 -1
      //  0 -1  0
      // Center=5, cross=-1, corners=0 (already normalized, sums to 1)
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;

          if (x === 0 || x === w - 1 || y === 0 || y === h - 1) {
            // Border pixels: copy as-is
            dst[idx] = src[idx];
            dst[idx + 1] = src[idx + 1];
            dst[idx + 2] = src[idx + 2];
            dst[idx + 3] = src[idx + 3];
            continue;
          }

          const idxTop = ((y - 1) * w + x) * 4;
          const idxBottom = ((y + 1) * w + x) * 4;
          const idxLeft = (y * w + (x - 1)) * 4;
          const idxRight = (y * w + (x + 1)) * 4;

          for (let c = 0; c < 3; c++) {
            const val = 5 * src[idx + c]
              - src[idxTop + c]
              - src[idxBottom + c]
              - src[idxLeft + c]
              - src[idxRight + c];
            dst[idx + c] = App.utils.clamp(Math.round(val), 0, 255);
          }
          dst[idx + 3] = src[idx + 3]; // alpha unchanged
        }
      }

      outCtx.putImageData(outData, 0, 0);
      return outCanvas;
    }

    function buildSplitView(origImg, origW, origH, upscaledCanvas, newW, newH) {
      const container = document.getElementById('iu-split-container');

      // Determine display size - fit within container width
      const maxDisplayW = Math.min(800, container.parentElement.clientWidth - 32);
      const displayScale = Math.min(1, maxDisplayW / newW);
      const displayW = Math.round(newW * displayScale);
      const displayH = Math.round(newH * displayScale);

      container.style.width = displayW + 'px';
      container.style.height = displayH + 'px';

      // Original canvas (nearest-neighbor upscale for comparison)
      const origCanvas = document.getElementById('iu-split-original');
      origCanvas.width = newW;
      origCanvas.height = newH;
      const origCtx = origCanvas.getContext('2d');
      // Use nearest-neighbor (pixelated) for the "before" side
      origCtx.imageSmoothingEnabled = false;
      origCtx.drawImage(origImg, 0, 0, newW, newH);
      origCanvas.style.width = displayW + 'px';
      origCanvas.style.height = displayH + 'px';

      // Upscaled canvas
      const splitUpscaled = document.getElementById('iu-split-upscaled');
      splitUpscaled.width = newW;
      splitUpscaled.height = newH;
      const upCtx = splitUpscaled.getContext('2d');
      upCtx.drawImage(upscaledCanvas, 0, 0);
      splitUpscaled.style.width = displayW + 'px';
      splitUpscaled.style.height = displayH + 'px';

      // Reset split position to 50%
      const handle = document.getElementById('iu-split-handle');
      handle.style.left = '50%';
      splitUpscaled.style.clipPath = 'inset(0 0 0 50%)';

      // Make handle draggable
      let isDragging = false;

      handle.addEventListener('mousedown', (e) => {
        isDragging = true;
        e.preventDefault();
      });

      handle.addEventListener('touchstart', (e) => {
        isDragging = true;
        e.preventDefault();
      }, { passive: false });

      // Also allow clicking/dragging anywhere on the container
      container.addEventListener('mousedown', (e) => {
        isDragging = true;
        updateSplit(e.clientX);
        e.preventDefault();
      });

      container.addEventListener('touchstart', (e) => {
        isDragging = true;
        updateSplit(e.touches[0].clientX);
        e.preventDefault();
      }, { passive: false });

      function updateSplit(clientX) {
        const rect = container.getBoundingClientRect();
        const x = clientX - rect.left;
        const pct = App.utils.clamp(x / rect.width * 100, 0, 100);
        handle.style.left = pct + '%';
        splitUpscaled.style.clipPath = `inset(0 0 0 ${pct}%)`;
      }

      document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        updateSplit(e.clientX);
      });

      document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        updateSplit(e.touches[0].clientX);
      }, { passive: false });

      document.addEventListener('mouseup', () => { isDragging = false; });
      document.addEventListener('touchend', () => { isDragging = false; });
    }

    // Download
    document.getElementById('iu-download').addEventListener('click', () => {
      if (!upscaledBlob) return;
      const baseName = originalFile.name.replace(/\.[^.]+$/, '');
      App.utils.downloadFile(upscaledBlob, `${baseName}-${selectedScale}x-upscaled.png`);
      App.utils.toast('Upscaled image downloaded!');
    });
  }
});
