/* ========================================
   TYPOGRAPHY TOOLS
   ======================================== */

// ----------------------------------------
// 1. PX to REM Converter
// ----------------------------------------
App.registerTool({
  id: 'px-to-rem',
  name: 'PX to REM',
  description: 'Convert between PX, REM and EM units',
  category: 'Typography',
  icon: '\u{1F4CF}',

  render() {
    return `
      <div class="tool-section">
        <div class="tool-row">
          <div class="tool-col" style="max-width:200px">
            <label class="tool-label">Base Font Size (px)</label>
            <input type="number" id="ptr-base" class="tool-input" value="16" min="1" max="100">
          </div>
        </div>
      </div>

      <div class="tool-row">
        <div class="tool-col">
          <div class="tool-section">
            <label class="tool-label">PX</label>
            <input type="number" id="ptr-px" class="tool-input" placeholder="16" step="any">
          </div>
        </div>
        <div class="tool-col">
          <div class="tool-section">
            <label class="tool-label">REM</label>
            <input type="number" id="ptr-rem" class="tool-input" placeholder="1" step="any">
          </div>
        </div>
        <div class="tool-col">
          <div class="tool-section">
            <label class="tool-label">EM</label>
            <input type="number" id="ptr-em" class="tool-input" placeholder="1" step="any">
          </div>
        </div>
      </div>

      <hr class="tool-separator">

      <div class="tool-section">
        <div class="tool-section-title">Quick Reference</div>
        <div style="overflow-x:auto">
          <table class="tool-table" id="ptr-table">
            <thead>
              <tr>
                <th>PX</th>
                <th>REM</th>
                <th>EM</th>
              </tr>
            </thead>
            <tbody id="ptr-table-body"></tbody>
          </table>
        </div>
      </div>
    `;
  },

  init() {
    const baseInput = document.getElementById('ptr-base');
    const pxInput = document.getElementById('ptr-px');
    const remInput = document.getElementById('ptr-rem');
    const emInput = document.getElementById('ptr-em');
    const tableBody = document.getElementById('ptr-table-body');

    const commonValues = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 96];

    const roundTo = (val, decimals) => {
      const factor = Math.pow(10, decimals);
      return Math.round(val * factor) / factor;
    };

    const updateFromPx = (px) => {
      const base = parseFloat(baseInput.value) || 16;
      remInput.value = roundTo(px / base, 4);
      emInput.value = roundTo(px / base, 4);
    };

    const updateFromRem = (rem) => {
      const base = parseFloat(baseInput.value) || 16;
      pxInput.value = roundTo(rem * base, 4);
      emInput.value = roundTo(rem, 4);
    };

    const updateFromEm = (em) => {
      const base = parseFloat(baseInput.value) || 16;
      pxInput.value = roundTo(em * base, 4);
      remInput.value = roundTo(em, 4);
    };

    const buildTable = () => {
      const base = parseFloat(baseInput.value) || 16;
      tableBody.innerHTML = commonValues.map(px => {
        const rem = roundTo(px / base, 4);
        return `
          <tr style="cursor:pointer" onclick="document.getElementById('ptr-px').value=${px};document.getElementById('ptr-px').dispatchEvent(new Event('input'))">
            <td>${px}px</td>
            <td>${rem}rem</td>
            <td>${rem}em</td>
          </tr>
        `;
      }).join('');
    };

    pxInput.addEventListener('input', () => {
      const val = parseFloat(pxInput.value);
      if (!isNaN(val)) updateFromPx(val);
    });

    remInput.addEventListener('input', () => {
      const val = parseFloat(remInput.value);
      if (!isNaN(val)) updateFromRem(val);
    });

    emInput.addEventListener('input', () => {
      const val = parseFloat(emInput.value);
      if (!isNaN(val)) updateFromEm(val);
    });

    baseInput.addEventListener('input', () => {
      const px = parseFloat(pxInput.value);
      if (!isNaN(px)) updateFromPx(px);
      buildTable();
    });

    buildTable();
  }
});


// ----------------------------------------
// 2. Line Height Calculator
// ----------------------------------------
App.registerTool({
  id: 'line-height-calc',
  name: 'Line Height Calculator',
  description: 'Calculate optimal line heights for different use cases',
  category: 'Typography',
  icon: '\u{1F4D0}',

  render() {
    return `
      <div class="tool-section">
        <div class="tool-row">
          <div class="tool-col" style="max-width:200px">
            <label class="tool-label">Font Size (px)</label>
            <input type="number" id="lhc-size" class="tool-input" value="16" min="1" max="200">
          </div>
        </div>
      </div>

      <div id="lhc-results"></div>
    `;
  },

  init() {
    const sizeInput = document.getElementById('lhc-size');

    const useCases = [
      { name: 'Body Text', min: 1.5, max: 1.7, recommended: 1.6, desc: 'Long-form reading content, paragraphs, articles' },
      { name: 'Headings', min: 1.1, max: 1.3, recommended: 1.2, desc: 'H1-H6, titles, display text' },
      { name: 'UI / Buttons', min: 1.0, max: 1.2, recommended: 1.1, desc: 'Buttons, labels, form inputs, navigation' },
      { name: 'Captions', min: 1.3, max: 1.5, recommended: 1.4, desc: 'Image captions, footnotes, helper text' },
    ];

    const sampleText = 'The quick brown fox jumps over the lazy dog. Typography is the art and technique of arranging type to make written language legible, readable, and appealing when displayed.';

    const update = () => {
      const fontSize = parseFloat(sizeInput.value) || 16;

      let html = '';
      useCases.forEach(uc => {
        const recPx = Math.round(fontSize * uc.recommended * 10) / 10;
        const minPx = Math.round(fontSize * uc.min * 10) / 10;
        const maxPx = Math.round(fontSize * uc.max * 10) / 10;

        html += `
          <div class="tool-section" style="margin-bottom:16px">
            <div class="tool-section-title">${uc.name}</div>
            <p style="font-size:11px;color:var(--text-muted);margin-bottom:12px">${uc.desc}</p>

            <div class="result-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:12px">
              <div class="result-card">
                <div class="result-label">Minimum</div>
                <div style="font-size:18px;font-weight:600;color:var(--text);margin-top:4px">${uc.min}</div>
                <div style="font-size:11px;color:var(--text-dim)">${minPx}px</div>
              </div>
              <div class="result-card" style="border-color:var(--primary)">
                <div class="result-label">Recommended</div>
                <div style="font-size:18px;font-weight:600;color:var(--primary);margin-top:4px">${uc.recommended}</div>
                <div style="font-size:11px;color:var(--text-dim)">${recPx}px</div>
              </div>
              <div class="result-card">
                <div class="result-label">Maximum</div>
                <div style="font-size:18px;font-weight:600;color:var(--text);margin-top:4px">${uc.max}</div>
                <div style="font-size:11px;color:var(--text-dim)">${maxPx}px</div>
              </div>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:12px">
              <div style="background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-sm);padding:16px">
                <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Line-height: ${uc.min} (${minPx}px)</div>
                <p style="font-size:${fontSize}px;line-height:${uc.min};color:var(--text)">${sampleText}</p>
              </div>
              <div style="background:var(--bg);border:1px solid var(--primary);border-radius:var(--radius-sm);padding:16px">
                <div style="font-size:10px;color:var(--primary);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Line-height: ${uc.recommended} (${recPx}px)</div>
                <p style="font-size:${fontSize}px;line-height:${uc.recommended};color:var(--text)">${sampleText}</p>
              </div>
              <div style="background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-sm);padding:16px">
                <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Line-height: ${uc.max} (${maxPx}px)</div>
                <p style="font-size:${fontSize}px;line-height:${uc.max};color:var(--text)">${sampleText}</p>
              </div>
            </div>
          </div>
        `;
      });

      document.getElementById('lhc-results').innerHTML = html;
    };

    sizeInput.addEventListener('input', update);
    update();
  }
});


// ----------------------------------------
// 3. Typography Calculator
// ----------------------------------------
App.registerTool({
  id: 'typography-calc',
  name: 'Typography Calculator',
  description: 'Convert between pt, px, em, rem, and percentage units',
  category: 'Typography',
  icon: '\u{1F522}',

  render() {
    return `
      <div class="tool-section">
        <div class="tool-row">
          <div class="tool-col" style="max-width:200px">
            <label class="tool-label">Base Size (px)</label>
            <input type="number" id="tc-base" class="tool-input" value="16" min="1" max="200">
          </div>
        </div>
      </div>

      <div class="tool-section">
        <div class="tool-section-title">Input</div>
        <div class="tool-row">
          <div class="tool-col">
            <label class="tool-label">Value</label>
            <input type="number" id="tc-value" class="tool-input" value="16" step="any">
          </div>
          <div class="tool-col" style="max-width:160px">
            <label class="tool-label">Unit</label>
            <select id="tc-unit" class="tool-select">
              <option value="px" selected>px</option>
              <option value="pt">pt</option>
              <option value="em">em</option>
              <option value="rem">rem</option>
              <option value="%">%</option>
            </select>
          </div>
        </div>
      </div>

      <div class="result-grid" style="grid-template-columns:repeat(auto-fill,minmax(160px,1fr))" id="tc-results"></div>

      <hr class="tool-separator">

      <div class="tool-section">
        <div class="tool-section-title">Standard Type Sizes Reference</div>
        <div style="overflow-x:auto">
          <table class="tool-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>PX</th>
                <th>PT</th>
                <th>REM</th>
                <th>EM</th>
                <th>%</th>
              </tr>
            </thead>
            <tbody id="tc-ref-table"></tbody>
          </table>
        </div>
      </div>
    `;
  },

  init() {
    const baseInput = document.getElementById('tc-base');
    const valueInput = document.getElementById('tc-value');
    const unitSelect = document.getElementById('tc-unit');
    const resultsContainer = document.getElementById('tc-results');
    const refTable = document.getElementById('tc-ref-table');

    // 1pt = 1.333px (96/72)
    const PT_TO_PX = 96 / 72;

    const roundTo = (val, decimals) => {
      const factor = Math.pow(10, decimals);
      return Math.round(val * factor) / factor;
    };

    // Convert any input to px first
    const toPx = (value, unit, base) => {
      switch (unit) {
        case 'px': return value;
        case 'pt': return value * PT_TO_PX;
        case 'em': return value * base;
        case 'rem': return value * base;
        case '%': return (value / 100) * base;
        default: return value;
      }
    };

    // Convert from px to target unit
    const fromPx = (px, unit, base) => {
      switch (unit) {
        case 'px': return px;
        case 'pt': return px / PT_TO_PX;
        case 'em': return px / base;
        case 'rem': return px / base;
        case '%': return (px / base) * 100;
        default: return px;
      }
    };

    const unitLabels = {
      px: 'PX',
      pt: 'PT',
      em: 'EM',
      rem: 'REM',
      '%': '%'
    };

    const update = () => {
      const base = parseFloat(baseInput.value) || 16;
      const value = parseFloat(valueInput.value);
      const unit = unitSelect.value;

      if (isNaN(value)) {
        resultsContainer.innerHTML = '';
        return;
      }

      const px = toPx(value, unit, base);

      let html = '';
      Object.keys(unitLabels).forEach(u => {
        const converted = roundTo(fromPx(px, u, base), 4);
        const isActive = u === unit;
        html += `
          <div class="result-card" style="${isActive ? 'border-color:var(--primary)' : ''};cursor:pointer" onclick="App.utils.copyToClipboard('${converted}${u}')">
            <div class="result-label">${unitLabels[u]}</div>
            <div style="font-size:20px;font-weight:600;color:${isActive ? 'var(--primary)' : 'var(--text)'};margin-top:4px">${converted}</div>
            <div style="font-size:11px;color:var(--text-dim)">${u}</div>
          </div>
        `;
      });
      resultsContainer.innerHTML = html;
    };

    const standardSizes = [
      { name: 'Caption', px: 12 },
      { name: 'Body', px: 16 },
      { name: 'H6', px: 16 },
      { name: 'H5', px: 20 },
      { name: 'H4', px: 24 },
      { name: 'H3', px: 30 },
      { name: 'H2', px: 36 },
      { name: 'H1', px: 48 },
      { name: 'Display', px: 60 },
    ];

    const buildRefTable = () => {
      const base = parseFloat(baseInput.value) || 16;

      refTable.innerHTML = standardSizes.map(s => {
        const pt = roundTo(fromPx(s.px, 'pt', base), 2);
        const rem = roundTo(fromPx(s.px, 'rem', base), 4);
        const em = roundTo(fromPx(s.px, 'em', base), 4);
        const pct = roundTo(fromPx(s.px, '%', base), 2);
        return `
          <tr style="cursor:pointer" onclick="document.getElementById('tc-value').value=${s.px};document.getElementById('tc-unit').value='px';document.getElementById('tc-value').dispatchEvent(new Event('input'))">
            <td style="font-weight:500">${s.name}</td>
            <td>${s.px}px</td>
            <td>${pt}pt</td>
            <td>${rem}rem</td>
            <td>${em}em</td>
            <td>${pct}%</td>
          </tr>
        `;
      }).join('');
    };

    valueInput.addEventListener('input', update);
    unitSelect.addEventListener('change', update);
    baseInput.addEventListener('input', () => { update(); buildRefTable(); });

    update();
    buildRefTable();
  }
});
