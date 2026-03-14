/* ========================================
   COLOUR TOOLS
   ======================================== */

// ----------------------------------------
// 1. Colour Converter
// ----------------------------------------
App.registerTool({
  id: 'colour-converter',
  name: 'Colour Converter',
  description: 'Convert colours between HEX, RGB, HSL, HSV and CMYK',
  category: 'Colour',
  icon: '\u{1F504}',

  render() {
    return `
      <div class="tool-section">
        <div class="tool-row">
          <div class="tool-col">
            <label class="tool-label">Colour Input</label>
            <div class="tool-color-wrapper">
              <input type="color" id="cc-picker" class="tool-color-input" value="#3b82f6">
              <input type="text" id="cc-hex" class="tool-input" value="#3b82f6" placeholder="#000000">
            </div>
          </div>
        </div>
      </div>

      <div id="cc-results">
        <div class="tool-section">
          <div class="tool-section-title">HEX</div>
          <div class="tool-row" style="align-items:center">
            <code id="cc-hex-out" class="tool-output" style="flex:1;margin:0">#3b82f6</code>
            <button class="tool-btn tool-btn-sm" onclick="App.utils.copyToClipboard(document.getElementById('cc-hex-out').textContent)">Copy</button>
          </div>
        </div>
        <div class="tool-section">
          <div class="tool-section-title">RGB</div>
          <div class="tool-row" style="align-items:center">
            <code id="cc-rgb-out" class="tool-output" style="flex:1;margin:0">rgb(59, 130, 246)</code>
            <button class="tool-btn tool-btn-sm" onclick="App.utils.copyToClipboard(document.getElementById('cc-rgb-out').textContent)">Copy</button>
          </div>
        </div>
        <div class="tool-section">
          <div class="tool-section-title">HSL</div>
          <div class="tool-row" style="align-items:center">
            <code id="cc-hsl-out" class="tool-output" style="flex:1;margin:0">hsl(217, 91%, 60%)</code>
            <button class="tool-btn tool-btn-sm" onclick="App.utils.copyToClipboard(document.getElementById('cc-hsl-out').textContent)">Copy</button>
          </div>
        </div>
        <div class="tool-section">
          <div class="tool-section-title">HSV</div>
          <div class="tool-row" style="align-items:center">
            <code id="cc-hsv-out" class="tool-output" style="flex:1;margin:0">hsv(217, 76%, 96%)</code>
            <button class="tool-btn tool-btn-sm" onclick="App.utils.copyToClipboard(document.getElementById('cc-hsv-out').textContent)">Copy</button>
          </div>
        </div>
        <div class="tool-section">
          <div class="tool-section-title">CMYK</div>
          <div class="tool-row" style="align-items:center">
            <code id="cc-cmyk-out" class="tool-output" style="flex:1;margin:0">cmyk(76%, 47%, 0%, 4%)</code>
            <button class="tool-btn tool-btn-sm" onclick="App.utils.copyToClipboard(document.getElementById('cc-cmyk-out').textContent)">Copy</button>
          </div>
        </div>
      </div>
    `;
  },

  init() {
    const picker = document.getElementById('cc-picker');
    const hexInput = document.getElementById('cc-hex');

    const update = (hex) => {
      hex = hex.trim();
      if (!hex.startsWith('#')) hex = '#' + hex;
      if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex)) return;

      const rgb = App.utils.hexToRgb(hex);
      if (!rgb) return;
      const fullHex = App.utils.rgbToHex(rgb.r, rgb.g, rgb.b);
      const hsl = App.utils.rgbToHsl(rgb.r, rgb.g, rgb.b);
      const hsv = App.utils.rgbToHsv(rgb.r, rgb.g, rgb.b);
      const cmyk = App.utils.rgbToCmyk(rgb.r, rgb.g, rgb.b);

      picker.value = fullHex;
      hexInput.value = fullHex;

      document.getElementById('cc-hex-out').textContent = fullHex;
      document.getElementById('cc-rgb-out').textContent = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
      document.getElementById('cc-hsl-out').textContent = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
      document.getElementById('cc-hsv-out').textContent = `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`;
      document.getElementById('cc-cmyk-out').textContent = `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;
    };

    picker.addEventListener('input', () => update(picker.value));
    hexInput.addEventListener('input', () => update(hexInput.value));

    // Initial
    update('#3b82f6');
  }
});


// ----------------------------------------
// 2. Tailwind Shade Generator
// ----------------------------------------
App.registerTool({
  id: 'tailwind-shades',
  name: 'Tailwind Shade Generator',
  description: 'Generate Tailwind-style colour shades from any colour',
  category: 'Colour',
  icon: '\u{1F3AF}',

  render() {
    return `
      <div class="tool-section">
        <div class="tool-row">
          <div class="tool-col">
            <label class="tool-label">Base Colour (500)</label>
            <div class="tool-color-wrapper">
              <input type="color" id="tw-picker" class="tool-color-input" value="#3b82f6">
              <input type="text" id="tw-hex" class="tool-input" value="#3b82f6" placeholder="#000000">
            </div>
          </div>
        </div>
      </div>

      <div id="tw-shades" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:8px;margin:16px 0"></div>

      <div class="tool-btn-group" style="margin-top:16px">
        <button class="tool-btn" id="tw-copy-css">Copy as CSS</button>
        <button class="tool-btn" id="tw-copy-js">Copy as JS Object</button>
      </div>
    `;
  },

  init() {
    const picker = document.getElementById('tw-picker');
    const hexInput = document.getElementById('tw-hex');
    const shadesContainer = document.getElementById('tw-shades');

    const shadeSteps = [
      { name: '50',  lOff: 48, sOff: -30 },
      { name: '100', lOff: 40, sOff: -24 },
      { name: '200', lOff: 30, sOff: -18 },
      { name: '300', lOff: 20, sOff: -12 },
      { name: '400', lOff: 10, sOff: -6  },
      { name: '500', lOff: 0,  sOff: 0   },
      { name: '600', lOff: -8, sOff: 4   },
      { name: '700', lOff: -18, sOff: 8  },
      { name: '800', lOff: -26, sOff: 10 },
      { name: '900', lOff: -34, sOff: 12 },
      { name: '950', lOff: -42, sOff: 14 },
    ];

    let currentShades = [];

    const generate = (hex) => {
      hex = hex.trim();
      if (!hex.startsWith('#')) hex = '#' + hex;
      if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex)) return;

      const rgb = App.utils.hexToRgb(hex);
      const hsl = App.utils.rgbToHsl(rgb.r, rgb.g, rgb.b);
      currentShades = [];

      let html = '';
      shadeSteps.forEach(step => {
        const l = App.utils.clamp(hsl.l + step.lOff, 0, 100);
        const s = App.utils.clamp(hsl.s + step.sOff, 0, 100);
        const shadeRgb = App.utils.hslToRgb(hsl.h, s, l);
        const shadeHex = App.utils.rgbToHex(shadeRgb.r, shadeRgb.g, shadeRgb.b);
        const textColor = l > 55 ? '#000' : '#fff';
        currentShades.push({ name: step.name, hex: shadeHex });

        html += `
          <div style="text-align:center;cursor:pointer" onclick="App.utils.copyToClipboard('${shadeHex}')">
            <div style="background:${shadeHex};height:64px;border-radius:var(--radius-sm);border:1px solid var(--border);display:flex;align-items:flex-end;justify-content:center;padding:4px">
              <span style="font-size:10px;color:${textColor};opacity:0.8">${shadeHex}</span>
            </div>
            <div style="font-size:11px;color:var(--text-dim);margin-top:4px">${step.name}</div>
          </div>
        `;
      });

      shadesContainer.innerHTML = html;
      picker.value = App.utils.rgbToHex(rgb.r, rgb.g, rgb.b);
      hexInput.value = App.utils.rgbToHex(rgb.r, rgb.g, rgb.b);
    };

    picker.addEventListener('input', () => generate(picker.value));
    hexInput.addEventListener('input', () => generate(hexInput.value));

    document.getElementById('tw-copy-css').addEventListener('click', () => {
      const css = currentShades.map(s => `  --color-${s.name}: ${s.hex};`).join('\n');
      App.utils.copyToClipboard(`:root {\n${css}\n}`);
    });

    document.getElementById('tw-copy-js').addEventListener('click', () => {
      const obj = currentShades.map(s => `  '${s.name}': '${s.hex}'`).join(',\n');
      App.utils.copyToClipboard(`{\n${obj}\n}`);
    });

    generate('#3b82f6');
  }
});


// ----------------------------------------
// 3. Contrast Checker
// ----------------------------------------
App.registerTool({
  id: 'contrast-checker',
  name: 'Contrast Checker',
  description: 'Check WCAG colour contrast ratios between foreground and background',
  category: 'Colour',
  icon: '\u26A1',

  render() {
    return `
      <div class="tool-row">
        <div class="tool-col">
          <div class="tool-section">
            <label class="tool-label">Foreground (Text) Colour</label>
            <div class="tool-color-wrapper">
              <input type="color" id="ct-fg-picker" class="tool-color-input" value="#ffffff">
              <input type="text" id="ct-fg-hex" class="tool-input" value="#ffffff" placeholder="#ffffff">
            </div>
          </div>
        </div>
        <div class="tool-col">
          <div class="tool-section">
            <label class="tool-label">Background Colour</label>
            <div class="tool-color-wrapper">
              <input type="color" id="ct-bg-picker" class="tool-color-input" value="#3b82f6">
              <input type="text" id="ct-bg-hex" class="tool-input" value="#3b82f6" placeholder="#000000">
            </div>
          </div>
        </div>
      </div>

      <button class="tool-btn tool-btn-sm" id="ct-swap" style="margin-bottom:16px">Swap Colours</button>

      <div id="ct-preview" class="tool-preview" style="flex-direction:column;gap:8px;min-height:160px;border-radius:var(--radius)">
        <span style="font-size:24px;font-weight:700">Large Text (24px+)</span>
        <span style="font-size:16px">Normal Text (16px)</span>
        <span style="font-size:12px">Small Text (12px)</span>
      </div>

      <div class="result-value" id="ct-ratio" style="text-align:center">4.5:1</div>
      <div class="result-label" style="text-align:center;margin-bottom:24px">Contrast Ratio</div>

      <div class="result-grid" style="grid-template-columns:repeat(2,1fr)">
        <div class="result-card">
          <div class="result-label" style="margin-bottom:8px">WCAG AA</div>
          <div style="margin-bottom:6px">Normal Text <span id="ct-aa-normal" class="badge">--</span></div>
          <div>Large Text <span id="ct-aa-large" class="badge">--</span></div>
        </div>
        <div class="result-card">
          <div class="result-label" style="margin-bottom:8px">WCAG AAA</div>
          <div style="margin-bottom:6px">Normal Text <span id="ct-aaa-normal" class="badge">--</span></div>
          <div>Large Text <span id="ct-aaa-large" class="badge">--</span></div>
        </div>
      </div>
    `;
  },

  init() {
    const fgPicker = document.getElementById('ct-fg-picker');
    const fgHex = document.getElementById('ct-fg-hex');
    const bgPicker = document.getElementById('ct-bg-picker');
    const bgHex = document.getElementById('ct-bg-hex');

    const badge = (pass) => pass
      ? '<span class="badge badge-pass">Pass</span>'
      : '<span class="badge badge-fail">Fail</span>';

    const update = () => {
      let fg = fgHex.value.trim();
      let bg = bgHex.value.trim();
      if (!fg.startsWith('#')) fg = '#' + fg;
      if (!bg.startsWith('#')) bg = '#' + bg;

      const fgRgb = App.utils.parseColor(fg);
      const bgRgb = App.utils.parseColor(bg);
      if (!fgRgb || !bgRgb) return;

      const fgFull = App.utils.rgbToHex(fgRgb.r, fgRgb.g, fgRgb.b);
      const bgFull = App.utils.rgbToHex(bgRgb.r, bgRgb.g, bgRgb.b);
      fgPicker.value = fgFull;
      bgPicker.value = bgFull;

      const ratio = App.utils.contrastRatio(fgRgb, bgRgb);
      const ratioRounded = Math.round(ratio * 100) / 100;

      document.getElementById('ct-ratio').textContent = ratioRounded.toFixed(2) + ':1';

      // Preview
      const preview = document.getElementById('ct-preview');
      preview.style.background = bgFull;
      preview.style.color = fgFull;

      // WCAG checks
      document.getElementById('ct-aa-normal').innerHTML = badge(ratio >= 4.5).replace(/<span[^>]*>/, '<span class="badge ' + (ratio >= 4.5 ? 'badge-pass' : 'badge-fail') + '">');
      document.getElementById('ct-aa-normal').outerHTML = badge(ratio >= 4.5);
      document.getElementById('ct-aa-large').outerHTML = badge(ratio >= 3);
      document.getElementById('ct-aaa-normal').outerHTML = badge(ratio >= 7);
      document.getElementById('ct-aaa-large').outerHTML = badge(ratio >= 4.5);

      // Re-assign IDs after outerHTML replacement
      const cards = document.querySelectorAll('.result-card');
      const aaCard = cards[0];
      const aaaCard = cards[1];
      const aaDivs = aaCard.querySelectorAll('.badge');
      const aaaDivs = aaaCard.querySelectorAll('.badge');
      if (aaDivs[0]) aaDivs[0].id = 'ct-aa-normal';
      if (aaDivs[1]) aaDivs[1].id = 'ct-aa-large';
      if (aaaDivs[0]) aaaDivs[0].id = 'ct-aaa-normal';
      if (aaaDivs[1]) aaaDivs[1].id = 'ct-aaa-large';
    };

    fgPicker.addEventListener('input', () => { fgHex.value = fgPicker.value; update(); });
    fgHex.addEventListener('input', update);
    bgPicker.addEventListener('input', () => { bgHex.value = bgPicker.value; update(); });
    bgHex.addEventListener('input', update);

    document.getElementById('ct-swap').addEventListener('click', () => {
      const tmpFg = fgHex.value;
      fgHex.value = bgHex.value;
      bgHex.value = tmpFg;
      update();
    });

    update();
  }
});


// ----------------------------------------
// 4. Gradient Generator
// ----------------------------------------
App.registerTool({
  id: 'gradient-generator',
  name: 'Gradient Generator',
  description: 'Create CSS gradients with live preview',
  category: 'Colour',
  icon: '\u{1F308}',

  render() {
    return `
      <div class="tool-section">
        <div class="tool-row">
          <div class="tool-col" style="min-width:140px;flex:0 0 auto">
            <label class="tool-label">Type</label>
            <select id="gg-type" class="tool-select">
              <option value="linear">Linear</option>
              <option value="radial">Radial</option>
            </select>
          </div>
          <div class="tool-col" id="gg-direction-col">
            <label class="tool-label">Direction</label>
            <select id="gg-direction" class="tool-select">
              <option value="to right">to right</option>
              <option value="to left">to left</option>
              <option value="to bottom" selected>to bottom</option>
              <option value="to top">to top</option>
              <option value="to bottom right">to bottom right</option>
              <option value="to bottom left">to bottom left</option>
              <option value="to top right">to top right</option>
              <option value="to top left">to top left</option>
              <option value="custom">Custom angle</option>
            </select>
          </div>
          <div class="tool-col hidden" id="gg-angle-col" style="min-width:120px;flex:0 0 auto">
            <label class="tool-label">Angle (deg)</label>
            <input type="number" id="gg-angle" class="tool-input" value="180" min="0" max="360">
          </div>
        </div>
      </div>

      <div class="tool-section">
        <div class="tool-section-title">Colour Stops</div>
        <div id="gg-stops"></div>
        <button class="tool-btn tool-btn-sm" id="gg-add-stop" style="margin-top:12px">+ Add Stop</button>
      </div>

      <div id="gg-preview" style="width:100%;height:200px;border-radius:var(--radius);border:1px solid var(--border);margin:16px 0"></div>

      <div class="tool-section">
        <div class="tool-section-title">CSS Code</div>
        <div class="tool-output" id="gg-css" style="margin:0">background: linear-gradient(to bottom, #3b82f6, #8b5cf6);</div>
        <button class="tool-btn tool-btn-sm" style="margin-top:8px" onclick="App.utils.copyToClipboard(document.getElementById('gg-css').textContent)">Copy CSS</button>
      </div>
    `;
  },

  init() {
    let stops = [
      { color: '#3b82f6', position: 0 },
      { color: '#8b5cf6', position: 100 }
    ];

    const typeSelect = document.getElementById('gg-type');
    const dirSelect = document.getElementById('gg-direction');
    const angleInput = document.getElementById('gg-angle');
    const dirCol = document.getElementById('gg-direction-col');
    const angleCol = document.getElementById('gg-angle-col');

    const renderStops = () => {
      const container = document.getElementById('gg-stops');
      container.innerHTML = stops.map((s, i) => `
        <div class="tool-row" style="align-items:center;margin-bottom:8px">
          <input type="color" class="tool-color-input gg-stop-color" data-i="${i}" value="${s.color}">
          <input type="text" class="tool-input gg-stop-hex" data-i="${i}" value="${s.color}" style="width:100px;flex:0 0 auto">
          <input type="number" class="tool-input gg-stop-pos" data-i="${i}" value="${s.position}" min="0" max="100" style="width:70px;flex:0 0 auto">
          <span style="color:var(--text-dim);font-size:11px">%</span>
          ${stops.length > 2 ? `<button class="tool-btn tool-btn-sm gg-remove-stop" data-i="${i}" style="color:var(--danger)">x</button>` : ''}
        </div>
      `).join('');

      // Event listeners
      container.querySelectorAll('.gg-stop-color').forEach(el => {
        el.addEventListener('input', (e) => {
          const i = +e.target.dataset.i;
          stops[i].color = e.target.value;
          container.querySelector(`.gg-stop-hex[data-i="${i}"]`).value = e.target.value;
          updatePreview();
        });
      });
      container.querySelectorAll('.gg-stop-hex').forEach(el => {
        el.addEventListener('input', (e) => {
          const i = +e.target.dataset.i;
          let val = e.target.value.trim();
          if (!val.startsWith('#')) val = '#' + val;
          if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(val)) {
            stops[i].color = val;
            container.querySelector(`.gg-stop-color[data-i="${i}"]`).value = val.length === 4 ? '#' + val[1]+val[1]+val[2]+val[2]+val[3]+val[3] : val;
            updatePreview();
          }
        });
      });
      container.querySelectorAll('.gg-stop-pos').forEach(el => {
        el.addEventListener('input', (e) => {
          const i = +e.target.dataset.i;
          stops[i].position = App.utils.clamp(+e.target.value, 0, 100);
          updatePreview();
        });
      });
      container.querySelectorAll('.gg-remove-stop').forEach(el => {
        el.addEventListener('click', (e) => {
          const i = +e.target.dataset.i;
          stops.splice(i, 1);
          renderStops();
          updatePreview();
        });
      });
    };

    const updatePreview = () => {
      const type = typeSelect.value;
      const sorted = [...stops].sort((a, b) => a.position - b.position);
      const stopsStr = sorted.map(s => `${s.color} ${s.position}%`).join(', ');

      let css;
      if (type === 'radial') {
        css = `background: radial-gradient(circle, ${stopsStr});`;
      } else {
        let dir = dirSelect.value;
        if (dir === 'custom') {
          dir = angleInput.value + 'deg';
        }
        css = `background: linear-gradient(${dir}, ${stopsStr});`;
      }

      document.getElementById('gg-preview').style.cssText = `width:100%;height:200px;border-radius:var(--radius);border:1px solid var(--border);margin:16px 0;${css}`;
      document.getElementById('gg-css').textContent = css;
    };

    typeSelect.addEventListener('change', () => {
      if (typeSelect.value === 'radial') {
        dirCol.classList.add('hidden');
        angleCol.classList.add('hidden');
      } else {
        dirCol.classList.remove('hidden');
        if (dirSelect.value === 'custom') angleCol.classList.remove('hidden');
      }
      updatePreview();
    });

    dirSelect.addEventListener('change', () => {
      if (dirSelect.value === 'custom') {
        angleCol.classList.remove('hidden');
      } else {
        angleCol.classList.add('hidden');
      }
      updatePreview();
    });

    angleInput.addEventListener('input', updatePreview);

    document.getElementById('gg-add-stop').addEventListener('click', () => {
      const lastColor = stops[stops.length - 1].color;
      const rgb = App.utils.hexToRgb(lastColor);
      const hsl = App.utils.rgbToHsl(rgb.r, rgb.g, rgb.b);
      const newHsl = { h: (hsl.h + 30) % 360, s: hsl.s, l: hsl.l };
      const newRgb = App.utils.hslToRgb(newHsl.h, newHsl.s, newHsl.l);
      const newHex = App.utils.rgbToHex(newRgb.r, newRgb.g, newRgb.b);
      stops.push({ color: newHex, position: 100 });
      // Redistribute positions
      stops.forEach((s, i) => { s.position = Math.round((i / (stops.length - 1)) * 100); });
      renderStops();
      updatePreview();
    });

    renderStops();
    updatePreview();
  }
});


// ----------------------------------------
// 5. Colour Blindness Simulator
// ----------------------------------------
App.registerTool({
  id: 'colour-blindness-sim',
  name: 'Colour Blindness Simulator',
  description: 'Simulate how images appear to people with colour vision deficiency',
  category: 'Colour',
  icon: '\u{1F441}\uFE0F',

  render() {
    return `
      <div class="upload-area" id="cbs-upload-area">
        <input type="file" id="cbs-file-input" accept="image/*">
        <span class="upload-icon">🖼️</span>
        <p>Drop an image here or click to upload</p>
      </div>

      <div id="cbs-results" class="hidden">
        <div class="tool-section" style="margin-top:16px">
          <div class="tool-section-title">Original</div>
          <div class="canvas-container">
            <canvas id="cbs-original"></canvas>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;margin-top:16px" id="cbs-sim-grid"></div>
      </div>
    `;
  },

  init() {
    // Colour blindness transformation matrices
    // These simulate how colour-blind individuals perceive colours
    const simTypes = {
      'Protanopia': [
        0.56667, 0.43333, 0.00000,
        0.55833, 0.44167, 0.00000,
        0.00000, 0.24167, 0.75833
      ],
      'Deuteranopia': [
        0.62500, 0.37500, 0.00000,
        0.70000, 0.30000, 0.00000,
        0.00000, 0.30000, 0.70000
      ],
      'Tritanopia': [
        0.95000, 0.05000, 0.00000,
        0.00000, 0.43333, 0.56667,
        0.00000, 0.47500, 0.52500
      ],
      'Protanomaly': [
        0.81667, 0.18333, 0.00000,
        0.33333, 0.66667, 0.00000,
        0.00000, 0.12500, 0.87500
      ],
      'Deuteranomaly': [
        0.80000, 0.20000, 0.00000,
        0.25833, 0.74167, 0.00000,
        0.00000, 0.14167, 0.85833
      ],
      'Tritanomaly': [
        0.96667, 0.03333, 0.00000,
        0.00000, 0.73333, 0.26667,
        0.00000, 0.18333, 0.81667
      ],
      'Achromatopsia': [
        0.29900, 0.58700, 0.11400,
        0.29900, 0.58700, 0.11400,
        0.29900, 0.58700, 0.11400
      ],
      'Achromatomaly': [
        0.61800, 0.32000, 0.06200,
        0.16300, 0.77500, 0.06200,
        0.16300, 0.32000, 0.51600
      ]
    };

    const applyMatrix = (imageData, matrix) => {
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        data[i]     = App.utils.clamp(Math.round(r * matrix[0] + g * matrix[1] + b * matrix[2]), 0, 255);
        data[i + 1] = App.utils.clamp(Math.round(r * matrix[3] + g * matrix[4] + b * matrix[5]), 0, 255);
        data[i + 2] = App.utils.clamp(Math.round(r * matrix[6] + g * matrix[7] + b * matrix[8]), 0, 255);
      }
      return imageData;
    };

    const processImage = (img) => {
      const maxW = 600;
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      if (w > maxW) { h = Math.round(h * (maxW / w)); w = maxW; }

      // Draw original
      const origCanvas = document.getElementById('cbs-original');
      origCanvas.width = w;
      origCanvas.height = h;
      const origCtx = origCanvas.getContext('2d');
      origCtx.drawImage(img, 0, 0, w, h);
      const origData = origCtx.getImageData(0, 0, w, h);

      // Generate simulations
      const grid = document.getElementById('cbs-sim-grid');
      grid.innerHTML = '';

      Object.entries(simTypes).forEach(([name, matrix]) => {
        const section = document.createElement('div');
        section.className = 'tool-section';
        section.innerHTML = `<div class="tool-section-title">${name}</div><div class="canvas-container"><canvas id="cbs-canvas-${name.toLowerCase()}"></canvas></div>`;
        grid.appendChild(section);

        const canvas = section.querySelector('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        const simData = new ImageData(new Uint8ClampedArray(origData.data), w, h);
        applyMatrix(simData, matrix);
        ctx.putImageData(simData, 0, 0);
      });

      document.getElementById('cbs-results').classList.remove('hidden');
    };

    App.utils.setupUpload('cbs-upload-area', 'cbs-file-input', async (file) => {
      if (!file.type.startsWith('image/')) {
        App.utils.toast('Please upload an image file');
        return;
      }
      const dataUrl = await App.utils.readFileAs(file, 'dataurl');
      const img = await App.utils.loadImage(dataUrl);
      processImage(img);
    });
  }
});


// ----------------------------------------
// 6. Harmony Generator
// ----------------------------------------
App.registerTool({
  id: 'harmony-generator',
  name: 'Harmony Generator',
  description: 'Generate colour harmonies: complementary, analogous, triadic and more',
  category: 'Colour',
  icon: '\u{1F3B5}',

  render() {
    return `
      <div class="tool-section">
        <div class="tool-row">
          <div class="tool-col">
            <label class="tool-label">Base Colour</label>
            <div class="tool-color-wrapper">
              <input type="color" id="hg-picker" class="tool-color-input" value="#3b82f6">
              <input type="text" id="hg-hex" class="tool-input" value="#3b82f6" placeholder="#000000">
            </div>
          </div>
        </div>
      </div>

      <div id="hg-results"></div>
    `;
  },

  init() {
    const picker = document.getElementById('hg-picker');
    const hexInput = document.getElementById('hg-hex');

    const harmonies = {
      'Complementary': [0, 180],
      'Analogous': [-30, 0, 30],
      'Triadic': [0, 120, 240],
      'Split-Complementary': [0, 150, 210],
      'Tetradic (Square)': [0, 90, 180, 270],
      'Tetradic (Rectangle)': [0, 60, 180, 240],
    };

    const renderSwatch = (hex) => {
      const rgb = App.utils.hexToRgb(hex);
      const lum = App.utils.relativeLuminance(rgb.r, rgb.g, rgb.b);
      const textColor = lum > 0.179 ? '#000' : '#fff';
      return `
        <div style="display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer" onclick="App.utils.copyToClipboard('${hex}')">
          <div style="width:64px;height:64px;background:${hex};border-radius:var(--radius-sm);border:1px solid var(--border);display:flex;align-items:center;justify-content:center">
            <span style="font-size:9px;color:${textColor};opacity:0.7">${hex}</span>
          </div>
        </div>
      `;
    };

    const update = (hex) => {
      hex = hex.trim();
      if (!hex.startsWith('#')) hex = '#' + hex;
      if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex)) return;

      const rgb = App.utils.hexToRgb(hex);
      const fullHex = App.utils.rgbToHex(rgb.r, rgb.g, rgb.b);
      const hsl = App.utils.rgbToHsl(rgb.r, rgb.g, rgb.b);

      picker.value = fullHex;
      hexInput.value = fullHex;

      let html = '';
      Object.entries(harmonies).forEach(([name, offsets]) => {
        const colours = offsets.map(offset => {
          const newH = ((hsl.h + offset) % 360 + 360) % 360;
          const newRgb = App.utils.hslToRgb(newH, hsl.s, hsl.l);
          return App.utils.rgbToHex(newRgb.r, newRgb.g, newRgb.b);
        });

        html += `
          <div class="tool-section" style="margin-bottom:12px">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
              <div class="tool-section-title" style="margin-bottom:0">${name}</div>
              <button class="tool-btn tool-btn-sm hg-copy-scheme" data-colors='${JSON.stringify(colours)}'>Copy All</button>
            </div>
            <div style="display:flex;gap:12px;flex-wrap:wrap">
              ${colours.map(c => renderSwatch(c)).join('')}
            </div>
          </div>
        `;
      });

      document.getElementById('hg-results').innerHTML = html;

      // Attach copy listeners
      document.querySelectorAll('.hg-copy-scheme').forEach(btn => {
        btn.addEventListener('click', () => {
          const colors = JSON.parse(btn.dataset.colors);
          App.utils.copyToClipboard(colors.join(', '));
        });
      });
    };

    picker.addEventListener('input', () => update(picker.value));
    hexInput.addEventListener('input', () => update(hexInput.value));

    update('#3b82f6');
  }
});


// ----------------------------------------
// 7. Palette Generator
// ----------------------------------------
App.registerTool({
  id: 'palette-generator',
  name: 'Palette Generator',
  description: 'Generate random harmonious colour palettes with lock and regenerate',
  category: 'Colour',
  icon: '\u{1F3B2}',

  render() {
    return `
      <div id="pg-palette" style="display:flex;gap:0;border-radius:var(--radius);overflow:hidden;border:1px solid var(--border);margin-bottom:16px;height:220px"></div>

      <div class="tool-btn-group">
        <button class="tool-btn tool-btn-primary" id="pg-generate">Generate</button>
        <button class="tool-btn" id="pg-copy-all">Copy All</button>
      </div>
    `;
  },

  init() {
    let palette = [];
    const count = 5;

    // Golden ratio based random colour generation
    const goldenRatio = 0.618033988749895;
    let hueAccum = Math.random();

    const randomColor = () => {
      hueAccum = (hueAccum + goldenRatio) % 1;
      const h = Math.round(hueAccum * 360);
      const s = 55 + Math.round(Math.random() * 30); // 55-85
      const l = 45 + Math.round(Math.random() * 20); // 45-65
      const rgb = App.utils.hslToRgb(h, s, l);
      return App.utils.rgbToHex(rgb.r, rgb.g, rgb.b);
    };

    // Initialize
    for (let i = 0; i < count; i++) {
      palette.push({ color: randomColor(), locked: false });
    }

    const renderPalette = () => {
      const container = document.getElementById('pg-palette');
      container.innerHTML = palette.map((p, i) => {
        const rgb = App.utils.hexToRgb(p.color);
        const lum = App.utils.relativeLuminance(rgb.r, rgb.g, rgb.b);
        const textColor = lum > 0.179 ? '#000' : '#fff';
        return `
          <div style="flex:1;background:${p.color};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;cursor:pointer;position:relative;transition:flex 0.2s" onclick="App.utils.copyToClipboard('${p.color}')">
            <span style="font-size:13px;font-weight:600;color:${textColor}">${p.color}</span>
            <button class="lock-btn pg-lock ${p.locked ? 'locked' : ''}" data-i="${i}" style="color:${textColor}" onclick="event.stopPropagation()">
              ${p.locked ? '🔒' : '🔓'}
            </button>
          </div>
        `;
      }).join('');

      // Lock listeners
      container.querySelectorAll('.pg-lock').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const i = +e.currentTarget.dataset.i;
          palette[i].locked = !palette[i].locked;
          renderPalette();
        });
      });
    };

    document.getElementById('pg-generate').addEventListener('click', () => {
      palette.forEach((p, i) => {
        if (!p.locked) {
          palette[i].color = randomColor();
        }
      });
      renderPalette();
    });

    document.getElementById('pg-copy-all').addEventListener('click', () => {
      const colors = palette.map(p => p.color);
      App.utils.copyToClipboard(JSON.stringify(colors));
    });

    // Spacebar to generate
    const handler = (e) => {
      if (e.code === 'Space' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        document.getElementById('pg-generate').click();
      }
    };
    document.addEventListener('keydown', handler);

    renderPalette();
  }
});
