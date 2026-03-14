/* ========================================
   OTHER TOOLS
   ======================================== */

// ----------------------------------------
// 1. QR Generator
// ----------------------------------------
App.registerTool({
  id: 'qr-generator',
  name: '二维码生成器',
  description: 'Generate QR codes with custom colours and sizes',
  category: '其他',
  icon: '\u{1F4F1}',

  render() {
    return `
      <div class="tool-row">
        <div class="tool-col" style="flex:1">
          <div class="tool-section">
            <label class="tool-label">Text / URL</label>
            <textarea id="qr-text" class="tool-textarea" rows="3" placeholder="Enter text or URL...">https://example.com</textarea>
          </div>
          <div class="tool-section">
            <label class="tool-label">Error Correction Level</label>
            <select id="qr-ec" class="tool-select">
              <option value="L">L - Low (7%)</option>
              <option value="M" selected>M - Medium (15%)</option>
              <option value="Q">Q - Quartile (25%)</option>
              <option value="H">H - High (30%)</option>
            </select>
          </div>
          <div class="tool-row">
            <div class="tool-col">
              <label class="tool-label">Foreground</label>
              <div class="tool-color-wrapper">
                <input type="color" id="qr-fg" class="tool-color-input" value="#000000">
              </div>
            </div>
            <div class="tool-col">
              <label class="tool-label">Background</label>
              <div class="tool-color-wrapper">
                <input type="color" id="qr-bg" class="tool-color-input" value="#ffffff">
              </div>
            </div>
          </div>
          <div class="tool-section">
            <label class="tool-label">Size: <span id="qr-size-val">300</span>px</label>
            <input type="range" id="qr-size" class="tool-range" min="100" max="500" value="300">
          </div>
          <div class="tool-btn-group" style="margin-top:12px">
            <button class="tool-btn tool-btn-primary" id="qr-download">Download PNG</button>
          </div>
        </div>
        <div class="tool-col" style="flex:1;display:flex;align-items:center;justify-content:center">
          <div class="tool-preview" id="qr-preview" style="padding:24px;display:flex;align-items:center;justify-content:center;min-height:340px">
            <canvas id="qr-canvas"></canvas>
          </div>
        </div>
      </div>
    `;
  },

  init() {
    const textEl = document.getElementById('qr-text');
    const ecEl = document.getElementById('qr-ec');
    const fgEl = document.getElementById('qr-fg');
    const bgEl = document.getElementById('qr-bg');
    const sizeEl = document.getElementById('qr-size');
    const sizeVal = document.getElementById('qr-size-val');
    const canvas = document.getElementById('qr-canvas');
    const ctx = canvas.getContext('2d');

    const generate = () => {
      const text = textEl.value.trim();
      if (!text) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }
      const size = parseInt(sizeEl.value);
      sizeVal.textContent = size;

      try {
        const qr = qrcode(0, ecEl.value);
        qr.addData(text);
        qr.make();

        const moduleCount = qr.getModuleCount();
        const cellSize = size / moduleCount;

        canvas.width = size;
        canvas.height = size;

        const fg = fgEl.value;
        const bg = bgEl.value;

        // Draw background
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, size, size);

        // Draw modules
        ctx.fillStyle = fg;
        for (let row = 0; row < moduleCount; row++) {
          for (let col = 0; col < moduleCount; col++) {
            if (qr.isDark(row, col)) {
              ctx.fillRect(
                Math.round(col * cellSize),
                Math.round(row * cellSize),
                Math.ceil(cellSize),
                Math.ceil(cellSize)
              );
            }
          }
        }
      } catch (e) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = 300;
        canvas.height = 100;
        ctx.fillStyle = '#ff4444';
        ctx.font = '14px monospace';
        ctx.fillText('Error: ' + e.message, 10, 50);
      }
    };

    textEl.addEventListener('input', App.utils.debounce(generate, 200));
    ecEl.addEventListener('change', generate);
    fgEl.addEventListener('input', generate);
    bgEl.addEventListener('input', generate);
    sizeEl.addEventListener('input', generate);

    document.getElementById('qr-download').addEventListener('click', async () => {
      if (!textEl.value.trim()) {
        App.utils.toast('Enter text first');
        return;
      }
      const blob = await App.utils.canvasToBlob(canvas);
      App.utils.downloadFile(blob, 'qrcode.png', 'image/png');
    });

    generate();
  }
});


// ----------------------------------------
// 2. Barcode Generator
// ----------------------------------------
App.registerTool({
  id: 'barcode-generator',
  name: '条形码生成器',
  description: 'Generate barcodes in various formats',
  category: '其他',
  icon: '\u{1F4CA}',

  render() {
    return `
      <div class="tool-row">
        <div class="tool-col" style="flex:1">
          <div class="tool-section">
            <label class="tool-label">Data</label>
            <input type="text" id="bc-data" class="tool-input" value="1234567890" placeholder="Enter barcode data...">
          </div>
          <div class="tool-section">
            <label class="tool-label">Format</label>
            <select id="bc-format" class="tool-select">
              <option value="CODE128" selected>CODE128</option>
              <option value="CODE39">CODE39</option>
              <option value="EAN13">EAN13</option>
              <option value="EAN8">EAN8</option>
              <option value="UPC">UPC</option>
              <option value="ITF14">ITF14</option>
              <option value="MSI">MSI</option>
              <option value="pharmacode">Pharmacode</option>
            </select>
          </div>
          <div class="tool-section">
            <label class="tool-label">Bar Width: <span id="bc-width-val">2</span></label>
            <input type="range" id="bc-width" class="tool-range" min="1" max="4" step="0.5" value="2">
          </div>
          <div class="tool-section">
            <label class="tool-label">Height: <span id="bc-height-val">100</span>px</label>
            <input type="range" id="bc-height" class="tool-range" min="50" max="200" value="100">
          </div>
          <div class="tool-row">
            <div class="tool-col">
              <label class="tool-label">Line Colour</label>
              <div class="tool-color-wrapper">
                <input type="color" id="bc-line-color" class="tool-color-input" value="#000000">
              </div>
            </div>
            <div class="tool-col">
              <label class="tool-label">Background</label>
              <div class="tool-color-wrapper">
                <input type="color" id="bc-bg-color" class="tool-color-input" value="#ffffff">
              </div>
            </div>
          </div>
          <div class="tool-section">
            <label class="tool-label" style="display:flex;align-items:center;gap:8px">
              <input type="checkbox" id="bc-show-text" checked> Show text below barcode
            </label>
          </div>
          <div id="bc-error" style="color:var(--danger);font-size:12px;margin-top:8px;display:none"></div>
          <div class="tool-btn-group" style="margin-top:12px">
            <button class="tool-btn" id="bc-dl-svg">Download SVG</button>
            <button class="tool-btn tool-btn-primary" id="bc-dl-png">Download PNG</button>
          </div>
        </div>
        <div class="tool-col" style="flex:1;display:flex;align-items:center;justify-content:center">
          <div class="tool-preview" id="bc-preview" style="padding:24px;display:flex;align-items:center;justify-content:center;min-height:200px;background:#fff;border-radius:var(--radius)">
            <svg id="bc-svg"></svg>
          </div>
        </div>
      </div>
    `;
  },

  init() {
    const dataEl = document.getElementById('bc-data');
    const formatEl = document.getElementById('bc-format');
    const widthEl = document.getElementById('bc-width');
    const heightEl = document.getElementById('bc-height');
    const lineColorEl = document.getElementById('bc-line-color');
    const bgColorEl = document.getElementById('bc-bg-color');
    const showTextEl = document.getElementById('bc-show-text');
    const widthVal = document.getElementById('bc-width-val');
    const heightVal = document.getElementById('bc-height-val');
    const errorEl = document.getElementById('bc-error');
    const svgEl = document.getElementById('bc-svg');

    const generate = () => {
      const data = dataEl.value.trim();
      if (!data) {
        svgEl.innerHTML = '';
        errorEl.style.display = 'none';
        return;
      }
      widthVal.textContent = widthEl.value;
      heightVal.textContent = heightEl.value;

      try {
        JsBarcode('#bc-svg', data, {
          format: formatEl.value,
          width: parseFloat(widthEl.value),
          height: parseInt(heightEl.value),
          displayValue: showTextEl.checked,
          lineColor: lineColorEl.value,
          background: bgColorEl.value,
          margin: 10,
          fontSize: 16,
          font: 'monospace'
        });
        errorEl.style.display = 'none';
      } catch (e) {
        svgEl.innerHTML = '';
        errorEl.textContent = 'Invalid data for selected format: ' + e.message;
        errorEl.style.display = 'block';
      }
    };

    [dataEl, formatEl].forEach(el => el.addEventListener('input', App.utils.debounce(generate, 200)));
    [widthEl, heightEl].forEach(el => el.addEventListener('input', generate));
    [lineColorEl, bgColorEl].forEach(el => el.addEventListener('input', generate));
    showTextEl.addEventListener('change', generate);
    formatEl.addEventListener('change', generate);

    document.getElementById('bc-dl-svg').addEventListener('click', () => {
      const svgData = new XMLSerializer().serializeToString(svgEl);
      App.utils.downloadFile(svgData, 'barcode.svg', 'image/svg+xml');
    });

    document.getElementById('bc-dl-png').addEventListener('click', () => {
      const svgData = new XMLSerializer().serializeToString(svgEl);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth * 2;
        canvas.height = img.naturalHeight * 2;
        const ctx = canvas.getContext('2d');
        ctx.scale(2, 2);
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(blob => {
          App.utils.downloadFile(blob, 'barcode.png', 'image/png');
          URL.revokeObjectURL(url);
        });
      };
      img.src = url;
    });

    generate();
  }
});


// ----------------------------------------
// 3. Unit Converter
// ----------------------------------------
App.registerTool({
  id: 'unit-converter',
  name: '单位换算',
  description: 'Convert between units of length, weight, temperature and more',
  category: '其他',
  icon: '\u{1F4D0}',

  render() {
    const categories = ['Length', 'Weight', 'Temperature', 'Area', 'Volume', 'Speed', 'Data', 'Time'];
    const tabs = categories.map((c, i) =>
      `<button class="tool-tab${i === 0 ? ' active' : ''}" data-uc-tab="${c}">${c}</button>`
    ).join('');

    return `
      <div class="tool-tabs" id="uc-tabs">${tabs}</div>
      <div class="tool-section" style="margin-top:16px">
        <div class="tool-row">
          <div class="tool-col" style="flex:2">
            <label class="tool-label">Value</label>
            <input type="number" id="uc-value" class="tool-input" value="1" step="any">
          </div>
          <div class="tool-col" style="flex:2">
            <label class="tool-label">From</label>
            <select id="uc-from" class="tool-select"></select>
          </div>
          <div class="tool-col" style="flex:0 0 auto;display:flex;align-items:flex-end;padding-bottom:4px">
            <button class="tool-btn tool-btn-sm" id="uc-swap" title="Swap">&#x21C4;</button>
          </div>
          <div class="tool-col" style="flex:2">
            <label class="tool-label">To</label>
            <select id="uc-to" class="tool-select"></select>
          </div>
        </div>
        <div style="margin-top:16px">
          <div class="result-value" id="uc-result" style="cursor:pointer" title="Click to copy">-</div>
        </div>
      </div>
      <hr class="tool-separator">
      <div class="tool-section">
        <div class="tool-section-title">All Conversions</div>
        <div class="result-grid" id="uc-all-grid" style="grid-template-columns:repeat(auto-fill,minmax(180px,1fr))"></div>
      </div>
    `;
  },

  init() {
    const units = {
      Length: {
        base: 'm',
        units: {
          'mm': 0.001, 'cm': 0.01, 'm': 1, 'km': 1000,
          'inch': 0.0254, 'foot': 0.3048, 'yard': 0.9144, 'mile': 1609.344
        }
      },
      Weight: {
        base: 'kg',
        units: {
          'mg': 0.000001, 'g': 0.001, 'kg': 1, 'ton': 1000,
          'oz': 0.0283495, 'lb': 0.453592
        }
      },
      Temperature: {
        base: 'Celsius',
        units: { 'Celsius': null, 'Fahrenheit': null, 'Kelvin': null },
        convert(val, from, to) {
          // Convert to Celsius first
          let c;
          if (from === 'Celsius') c = val;
          else if (from === 'Fahrenheit') c = (val - 32) * 5 / 9;
          else c = val - 273.15;
          // Convert from Celsius to target
          if (to === 'Celsius') return c;
          if (to === 'Fahrenheit') return c * 9 / 5 + 32;
          return c + 273.15;
        }
      },
      Area: {
        base: 'm\u00B2',
        units: {
          'mm\u00B2': 0.000001, 'cm\u00B2': 0.0001, 'm\u00B2': 1, 'km\u00B2': 1000000,
          'acre': 4046.86, 'hectare': 10000, 'sq ft': 0.092903, 'sq mi': 2589988.11
        }
      },
      Volume: {
        base: 'l',
        units: {
          'ml': 0.001, 'l': 1, 'gallon(US)': 3.78541, 'quart': 0.946353,
          'pint': 0.473176, 'cup': 0.236588, 'fl oz': 0.0295735,
          'tbsp': 0.0147868, 'tsp': 0.00492892
        }
      },
      Speed: {
        base: 'm/s',
        units: {
          'm/s': 1, 'km/h': 0.277778, 'mph': 0.44704, 'knots': 0.514444
        }
      },
      Data: {
        base: 'byte',
        units: {
          'bit': 0.125, 'byte': 1, 'KB': 1024, 'MB': 1048576,
          'GB': 1073741824, 'TB': 1099511627776, 'PB': 1125899906842624
        }
      },
      Time: {
        base: 's',
        units: {
          'ms': 0.001, 's': 1, 'min': 60, 'hour': 3600,
          'day': 86400, 'week': 604800, 'month(30d)': 2592000, 'year(365d)': 31536000
        }
      }
    };

    let currentCategory = 'Length';
    const valueEl = document.getElementById('uc-value');
    const fromEl = document.getElementById('uc-from');
    const toEl = document.getElementById('uc-to');
    const resultEl = document.getElementById('uc-result');
    const allGrid = document.getElementById('uc-all-grid');

    const populateSelects = () => {
      const cat = units[currentCategory];
      const unitNames = Object.keys(cat.units);
      fromEl.innerHTML = unitNames.map(u => `<option value="${u}">${u}</option>`).join('');
      toEl.innerHTML = unitNames.map(u => `<option value="${u}">${u}</option>`).join('');
      if (unitNames.length > 1) toEl.selectedIndex = 1;
    };

    const convertValue = (val, from, to, cat) => {
      if (cat.convert) return cat.convert(val, from, to);
      const inBase = val * cat.units[from];
      return inBase / cat.units[to];
    };

    const formatResult = (n) => {
      if (Math.abs(n) === 0) return '0';
      if (Math.abs(n) >= 1e15 || (Math.abs(n) < 1e-10 && Math.abs(n) > 0)) {
        return n.toExponential(6);
      }
      // Use up to 10 significant figures
      const s = parseFloat(n.toPrecision(10));
      return s.toString();
    };

    const update = () => {
      const val = parseFloat(valueEl.value);
      if (isNaN(val)) {
        resultEl.textContent = '-';
        allGrid.innerHTML = '';
        return;
      }
      const cat = units[currentCategory];
      const from = fromEl.value;
      const to = toEl.value;

      const result = convertValue(val, from, to, cat);
      resultEl.textContent = `${formatResult(result)} ${to}`;

      // All conversions
      const unitNames = Object.keys(cat.units);
      allGrid.innerHTML = unitNames.map(u => {
        const r = convertValue(val, from, u, cat);
        return `
          <div class="result-card" style="cursor:pointer" onclick="App.utils.copyToClipboard('${formatResult(r)}')">
            <div class="result-label">${u}</div>
            <div style="font-size:15px;font-weight:600;color:var(--text);margin-top:4px;word-break:break-all">${formatResult(r)}</div>
          </div>
        `;
      }).join('');
    };

    // Tab switching
    document.getElementById('uc-tabs').addEventListener('click', (e) => {
      const tab = e.target.closest('[data-uc-tab]');
      if (!tab) return;
      document.querySelectorAll('[data-uc-tab]').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCategory = tab.dataset.ucTab;
      populateSelects();
      update();
    });

    document.getElementById('uc-swap').addEventListener('click', () => {
      const tmp = fromEl.value;
      fromEl.value = toEl.value;
      toEl.value = tmp;
      update();
    });

    resultEl.addEventListener('click', () => {
      const text = resultEl.textContent;
      if (text && text !== '-') App.utils.copyToClipboard(text);
    });

    valueEl.addEventListener('input', update);
    fromEl.addEventListener('change', update);
    toEl.addEventListener('change', update);

    populateSelects();
    update();
  }
});


// ----------------------------------------
// 4. Time Calculator
// ----------------------------------------
App.registerTool({
  id: 'time-calculator',
  name: '时间计算器',
  description: 'Unix timestamps, timezone conversions and date formatting',
  category: '其他',
  icon: '\u{1F550}',

  render() {
    const timezones = [
      'UTC',
      'America/New_York',
      'America/Chicago',
      'America/Denver',
      'America/Los_Angeles',
      'Europe/London',
      'Europe/Paris',
      'Europe/Berlin',
      'Asia/Tokyo',
      'Asia/Shanghai',
      'Australia/Sydney',
      'Asia/Kolkata',
      'Asia/Dubai',
      'America/Sao_Paulo'
    ];
    const tzOptions = timezones.map(tz => `<option value="${tz}">${tz.replace(/_/g, ' ')}</option>`).join('');

    return `
      <div class="tool-section" style="margin-bottom:16px">
        <div class="result-grid" style="grid-template-columns:repeat(auto-fill,minmax(200px,1fr))">
          <div class="result-card">
            <div class="result-label">Current Unix Timestamp</div>
            <div class="result-value" id="tc-current-ts" style="cursor:pointer;font-size:22px" title="Click to copy">-</div>
          </div>
          <div class="result-card">
            <div class="result-label">Current UTC Time</div>
            <div id="tc-current-utc" style="font-size:13px;color:var(--text);margin-top:6px">-</div>
          </div>
        </div>
      </div>

      <div class="tool-tabs" id="tc-tabs">
        <button class="tool-tab active" data-tc-tab="unix">Unix Timestamp</button>
        <button class="tool-tab" data-tc-tab="timezone">Timezone Converter</button>
      </div>

      <div id="tc-unix-panel" class="tool-tab-content active" style="margin-top:16px">
        <div class="tool-section">
          <div class="tool-section-title">Timestamp &rarr; Date</div>
          <div class="tool-row">
            <div class="tool-col" style="flex:2">
              <label class="tool-label">Unix Timestamp (seconds)</label>
              <input type="number" id="tc-ts-input" class="tool-input" placeholder="e.g. 1700000000" step="1">
            </div>
            <div class="tool-col" style="flex:0 0 auto;display:flex;align-items:flex-end;padding-bottom:4px">
              <button class="tool-btn tool-btn-sm" id="tc-now-btn">Now</button>
            </div>
          </div>
          <div id="tc-ts-results" style="margin-top:12px"></div>
        </div>
        <hr class="tool-separator">
        <div class="tool-section">
          <div class="tool-section-title">Date &rarr; Timestamp</div>
          <div class="tool-row">
            <div class="tool-col">
              <label class="tool-label">Date &amp; Time</label>
              <input type="datetime-local" id="tc-dt-input" class="tool-input" step="1">
            </div>
          </div>
          <div id="tc-dt-results" style="margin-top:12px"></div>
        </div>
      </div>

      <div id="tc-tz-panel" class="tool-tab-content" style="margin-top:16px;display:none">
        <div class="tool-section">
          <div class="tool-row">
            <div class="tool-col">
              <label class="tool-label">Source Timezone</label>
              <select id="tc-tz-from" class="tool-select">${tzOptions}</select>
            </div>
            <div class="tool-col">
              <label class="tool-label">Date &amp; Time</label>
              <input type="datetime-local" id="tc-tz-dt" class="tool-input" step="1">
            </div>
          </div>
          <div class="tool-row" style="margin-top:12px">
            <div class="tool-col">
              <label class="tool-label">Target Timezone</label>
              <select id="tc-tz-to" class="tool-select">${tzOptions}</select>
            </div>
          </div>
          <div id="tc-tz-result" style="margin-top:16px"></div>
        </div>
        <hr class="tool-separator">
        <div class="tool-section">
          <div class="tool-section-title">All Timezones</div>
          <div class="result-grid" id="tc-tz-all" style="grid-template-columns:repeat(auto-fill,minmax(220px,1fr))"></div>
        </div>
      </div>
    `;
  },

  init() {
    // Live clock
    const currentTsEl = document.getElementById('tc-current-ts');
    const currentUtcEl = document.getElementById('tc-current-utc');
    let clockInterval;

    const updateClock = () => {
      const now = new Date();
      const ts = Math.floor(now.getTime() / 1000);
      currentTsEl.textContent = ts;
      currentUtcEl.textContent = now.toISOString();
    };
    updateClock();
    clockInterval = setInterval(updateClock, 1000);

    // Cleanup on navigation
    const cleanup = () => {
      clearInterval(clockInterval);
      window.removeEventListener('hashchange', cleanup);
    };
    window.addEventListener('hashchange', cleanup);

    currentTsEl.addEventListener('click', () => {
      App.utils.copyToClipboard(currentTsEl.textContent);
    });

    // Relative time
    const relativeTime = (date) => {
      const now = new Date();
      const diffMs = date.getTime() - now.getTime();
      const absDiff = Math.abs(diffMs);
      const past = diffMs < 0;

      const seconds = Math.floor(absDiff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      const months = Math.floor(days / 30);
      const years = Math.floor(days / 365);

      let str;
      if (seconds < 60) str = `${seconds} second${seconds !== 1 ? 's' : ''}`;
      else if (minutes < 60) str = `${minutes} minute${minutes !== 1 ? 's' : ''}`;
      else if (hours < 24) str = `${hours} hour${hours !== 1 ? 's' : ''}`;
      else if (days < 30) str = `${days} day${days !== 1 ? 's' : ''}`;
      else if (months < 12) str = `${months} month${months !== 1 ? 's' : ''}`;
      else str = `${years} year${years !== 1 ? 's' : ''}`;

      return past ? `${str} ago` : `in ${str}`;
    };

    // Tab switching
    document.getElementById('tc-tabs').addEventListener('click', (e) => {
      const tab = e.target.closest('[data-tc-tab]');
      if (!tab) return;
      document.querySelectorAll('[data-tc-tab]').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const name = tab.dataset.tcTab;
      document.getElementById('tc-unix-panel').style.display = name === 'unix' ? '' : 'none';
      document.getElementById('tc-tz-panel').style.display = name === 'timezone' ? '' : 'none';
      if (name === 'unix') document.getElementById('tc-unix-panel').classList.add('active');
      if (name === 'timezone') {
        document.getElementById('tc-tz-panel').classList.add('active');
        updateTzAll();
      }
    });

    // Unix Timestamp -> Date
    const tsInput = document.getElementById('tc-ts-input');
    const tsResults = document.getElementById('tc-ts-results');

    const updateTimestampToDate = () => {
      const val = tsInput.value.trim();
      if (!val) { tsResults.innerHTML = ''; return; }
      const ts = parseInt(val);
      if (isNaN(ts)) { tsResults.innerHTML = '<div style="color:var(--danger)">Invalid timestamp</div>'; return; }

      const date = new Date(ts * 1000);
      if (isNaN(date.getTime())) { tsResults.innerHTML = '<div style="color:var(--danger)">Invalid timestamp</div>'; return; }

      const formats = [
        { label: 'ISO 8601', value: date.toISOString() },
        { label: 'RFC 2822', value: date.toUTCString() },
        { label: 'Locale String', value: date.toLocaleString() },
        { label: 'Relative', value: relativeTime(date) }
      ];

      tsResults.innerHTML = `
        <div class="result-grid" style="grid-template-columns:repeat(auto-fill,minmax(220px,1fr))">
          ${formats.map(f => `
            <div class="result-card" style="cursor:pointer" onclick="App.utils.copyToClipboard('${App.utils.escapeHtml(f.value)}')">
              <div class="result-label">${f.label}</div>
              <div style="font-size:13px;color:var(--text);margin-top:4px;word-break:break-all">${App.utils.escapeHtml(f.value)}</div>
            </div>
          `).join('')}
        </div>
      `;
    };

    tsInput.addEventListener('input', updateTimestampToDate);

    document.getElementById('tc-now-btn').addEventListener('click', () => {
      tsInput.value = Math.floor(Date.now() / 1000);
      updateTimestampToDate();
    });

    // Date -> Timestamp
    const dtInput = document.getElementById('tc-dt-input');
    const dtResults = document.getElementById('tc-dt-results');

    // Set default to now
    const nowLocal = new Date();
    const localISO = new Date(nowLocal.getTime() - nowLocal.getTimezoneOffset() * 60000).toISOString().slice(0, 19);
    dtInput.value = localISO;

    const updateDateToTimestamp = () => {
      const val = dtInput.value;
      if (!val) { dtResults.innerHTML = ''; return; }
      const date = new Date(val);
      if (isNaN(date.getTime())) { dtResults.innerHTML = '<div style="color:var(--danger)">Invalid date</div>'; return; }

      const ts = Math.floor(date.getTime() / 1000);
      dtResults.innerHTML = `
        <div class="result-grid" style="grid-template-columns:repeat(auto-fill,minmax(200px,1fr))">
          <div class="result-card" style="cursor:pointer" onclick="App.utils.copyToClipboard('${ts}')">
            <div class="result-label">Unix Timestamp (seconds)</div>
            <div class="result-value" style="font-size:22px">${ts}</div>
          </div>
          <div class="result-card" style="cursor:pointer" onclick="App.utils.copyToClipboard('${ts * 1000}')">
            <div class="result-label">Milliseconds</div>
            <div style="font-size:16px;font-weight:600;color:var(--text);margin-top:6px">${ts * 1000}</div>
          </div>
          <div class="result-card">
            <div class="result-label">Relative</div>
            <div style="font-size:13px;color:var(--text);margin-top:6px">${relativeTime(date)}</div>
          </div>
        </div>
      `;
    };

    dtInput.addEventListener('input', updateDateToTimestamp);
    updateDateToTimestamp();

    // Timezone converter
    const tzFromEl = document.getElementById('tc-tz-from');
    const tzToEl = document.getElementById('tc-tz-to');
    const tzDtEl = document.getElementById('tc-tz-dt');
    const tzResult = document.getElementById('tc-tz-result');
    const tzAllGrid = document.getElementById('tc-tz-all');

    // Set defaults
    tzDtEl.value = localISO;
    tzToEl.value = 'Asia/Tokyo';

    const allTimezones = [
      'UTC', 'America/New_York', 'America/Chicago', 'America/Denver',
      'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Europe/Berlin',
      'Asia/Tokyo', 'Asia/Shanghai', 'Australia/Sydney', 'Asia/Kolkata',
      'Asia/Dubai', 'America/Sao_Paulo'
    ];

    const formatInTz = (date, tz) => {
      try {
        return date.toLocaleString('en-US', {
          timeZone: tz,
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit', second: '2-digit',
          hour12: false
        });
      } catch (e) {
        return 'Invalid timezone';
      }
    };

    const updateTzConvert = () => {
      const val = tzDtEl.value;
      if (!val) { tzResult.innerHTML = ''; return; }

      // Parse the input as if in the source timezone
      const sourceTz = tzFromEl.value;
      const targetTz = tzToEl.value;

      // Create a date from the input, interpret in source timezone
      // We use a trick: format the date to the source tz, find offset
      const inputDate = new Date(val);
      if (isNaN(inputDate.getTime())) { tzResult.innerHTML = '<div style="color:var(--danger)">Invalid date</div>'; return; }

      const targetStr = formatInTz(inputDate, targetTz);
      const sourceStr = formatInTz(inputDate, sourceTz);

      tzResult.innerHTML = `
        <div class="result-grid" style="grid-template-columns:1fr 1fr">
          <div class="result-card">
            <div class="result-label">${sourceTz.replace(/_/g, ' ')}</div>
            <div style="font-size:15px;font-weight:600;color:var(--text);margin-top:6px">${sourceStr}</div>
          </div>
          <div class="result-card" style="border-color:var(--primary)">
            <div class="result-label">${targetTz.replace(/_/g, ' ')}</div>
            <div style="font-size:15px;font-weight:600;color:var(--primary);margin-top:6px">${targetStr}</div>
          </div>
        </div>
      `;
    };

    const updateTzAll = () => {
      const val = tzDtEl.value;
      if (!val) { tzAllGrid.innerHTML = ''; return; }
      const inputDate = new Date(val);
      if (isNaN(inputDate.getTime())) { tzAllGrid.innerHTML = ''; return; }

      tzAllGrid.innerHTML = allTimezones.map(tz => {
        const str = formatInTz(inputDate, tz);
        return `
          <div class="result-card" style="cursor:pointer" onclick="App.utils.copyToClipboard('${App.utils.escapeHtml(str)}')">
            <div class="result-label">${tz.replace(/_/g, ' ')}</div>
            <div style="font-size:12px;color:var(--text);margin-top:4px">${str}</div>
          </div>
        `;
      }).join('');
    };

    tzFromEl.addEventListener('change', () => { updateTzConvert(); updateTzAll(); });
    tzToEl.addEventListener('change', updateTzConvert);
    tzDtEl.addEventListener('input', () => { updateTzConvert(); updateTzAll(); });

    updateTzConvert();
  }
});


// ----------------------------------------
// 5. Scientific Calculator
// ----------------------------------------
App.registerTool({
  id: 'scientific-calc',
  name: '科学计算器',
  description: 'Full scientific calculator with trig, log and memory functions',
  category: '其他',
  icon: '\u{1F9EE}',

  render() {
    return `
      <div style="max-width:420px;margin:0 auto">
        <div class="tool-section">
          <div class="tool-output" id="sc-expression" style="min-height:24px;font-size:13px;color:var(--text-dim);text-align:right;padding:8px 12px;margin-bottom:0;border-bottom:none;border-radius:var(--radius) var(--radius) 0 0">&nbsp;</div>
          <div class="tool-output" id="sc-display" style="font-size:28px;text-align:right;padding:12px;margin-top:0;border-radius:0 0 var(--radius) var(--radius);min-height:52px;word-break:break-all">0</div>
        </div>
        <div id="sc-memory-indicator" style="font-size:11px;color:var(--text-dim);text-align:right;padding:0 4px 4px;min-height:18px"></div>
        <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px" id="sc-buttons">
          <button class="calc-btn" data-action="mc">MC</button>
          <button class="calc-btn" data-action="mr">MR</button>
          <button class="calc-btn" data-action="mplus">M+</button>
          <button class="calc-btn" data-action="mminus">M-</button>
          <button class="calc-btn op" data-action="clear">C</button>

          <button class="calc-btn" data-action="sin">sin</button>
          <button class="calc-btn" data-action="cos">cos</button>
          <button class="calc-btn" data-action="tan">tan</button>
          <button class="calc-btn" data-action="lparen">(</button>
          <button class="calc-btn" data-action="rparen">)</button>

          <button class="calc-btn" data-action="log">log</button>
          <button class="calc-btn" data-action="ln">ln</button>
          <button class="calc-btn" data-action="sqrt">&radic;</button>
          <button class="calc-btn" data-action="square">x&sup2;</button>
          <button class="calc-btn" data-action="power">x<sup>n</sup></button>

          <button class="calc-btn" data-action="pi">&pi;</button>
          <button class="calc-btn" data-action="e">e</button>
          <button class="calc-btn" data-action="factorial">n!</button>
          <button class="calc-btn" data-action="abs">|x|</button>
          <button class="calc-btn" data-action="inverse">1/x</button>

          <button class="calc-btn" data-action="percent">%</button>
          <button class="calc-btn" data-action="negate">&plusmn;</button>
          <button class="calc-btn op" data-action="backspace">&#x232B;</button>
          <button class="calc-btn op" data-action="divide">&divide;</button>
          <button class="calc-btn op" data-action="multiply">&times;</button>

          <button class="calc-btn" data-action="7">7</button>
          <button class="calc-btn" data-action="8">8</button>
          <button class="calc-btn" data-action="9">9</button>
          <button class="calc-btn op" data-action="subtract">&minus;</button>
          <button class="calc-btn op" data-action="add">+</button>

          <button class="calc-btn" data-action="4">4</button>
          <button class="calc-btn" data-action="5">5</button>
          <button class="calc-btn" data-action="6">6</button>
          <button class="calc-btn" data-action="1">1</button>
          <button class="calc-btn" data-action="2">2</button>

          <button class="calc-btn" data-action="3">3</button>
          <button class="calc-btn" data-action="0">0</button>
          <button class="calc-btn" data-action="decimal">.</button>
          <button class="calc-btn op wide" data-action="equals" style="grid-column:span 2">=</button>
        </div>
      </div>
    `;
  },

  init() {
    const display = document.getElementById('sc-display');
    const exprDisplay = document.getElementById('sc-expression');
    const memIndicator = document.getElementById('sc-memory-indicator');

    let expression = '';
    let currentInput = '0';
    let shouldResetInput = false;
    let memory = 0;
    let hasMemory = false;
    let lastResult = null;

    const degToRad = (deg) => deg * Math.PI / 180;

    const factorial = (n) => {
      if (n < 0) return NaN;
      if (n === 0 || n === 1) return 1;
      if (n > 170) return Infinity;
      if (!Number.isInteger(n)) return NaN;
      let result = 1;
      for (let i = 2; i <= n; i++) result *= i;
      return result;
    };

    const updateDisplay = () => {
      display.textContent = currentInput;
      exprDisplay.textContent = expression || '\u00A0';
      memIndicator.textContent = hasMemory ? 'M = ' + memory : '';
    };

    const evaluateExpression = (expr) => {
      try {
        // Replace display symbols with JS operators
        let evalExpr = expr
          .replace(/\u00D7/g, '*')
          .replace(/\u00F7/g, '/')
          .replace(/\u2212/g, '-')
          .replace(/\u2013/g, '-')
          .replace(/\u2014/g, '-');

        // Sanitize: only allow numbers, operators, parens, dots, spaces
        if (/[^0-9+\-*/().e\s]/i.test(evalExpr)) return NaN;

        const fn = new Function('return (' + evalExpr + ')');
        const result = fn();
        if (typeof result !== 'number') return NaN;
        return result;
      } catch (e) {
        return NaN;
      }
    };

    const handleAction = (action) => {
      // Number input
      if (/^[0-9]$/.test(action)) {
        if (shouldResetInput || currentInput === '0') {
          currentInput = action;
          shouldResetInput = false;
        } else {
          currentInput += action;
        }
        updateDisplay();
        return;
      }

      if (action === 'decimal') {
        if (shouldResetInput) {
          currentInput = '0.';
          shouldResetInput = false;
        } else if (!currentInput.includes('.')) {
          currentInput += '.';
        }
        updateDisplay();
        return;
      }

      if (action === 'clear') {
        expression = '';
        currentInput = '0';
        shouldResetInput = false;
        lastResult = null;
        updateDisplay();
        return;
      }

      if (action === 'backspace') {
        if (currentInput.length > 1) {
          currentInput = currentInput.slice(0, -1);
        } else {
          currentInput = '0';
        }
        updateDisplay();
        return;
      }

      if (action === 'negate') {
        if (currentInput !== '0') {
          if (currentInput.startsWith('-')) {
            currentInput = currentInput.slice(1);
          } else {
            currentInput = '-' + currentInput;
          }
        }
        updateDisplay();
        return;
      }

      // Operations
      if (['add', 'subtract', 'multiply', 'divide'].includes(action)) {
        const opMap = { add: '+', subtract: '\u2212', multiply: '\u00D7', divide: '\u00F7' };
        if (expression && shouldResetInput) {
          // Replace last operator
          expression = expression.trimEnd();
          const lastChar = expression.slice(-1);
          if (['+', '\u2212', '\u00D7', '\u00F7'].includes(lastChar)) {
            expression = expression.slice(0, -1) + opMap[action] + ' ';
          } else {
            expression += ' ' + opMap[action] + ' ';
          }
        } else {
          expression += currentInput + ' ' + opMap[action] + ' ';
        }
        shouldResetInput = true;
        updateDisplay();
        return;
      }

      if (action === 'equals') {
        const fullExpr = expression + currentInput;
        const result = evaluateExpression(fullExpr);
        if (isNaN(result) || !isFinite(result)) {
          expression = '';
          currentInput = isFinite(result) ? '0' : 'Error';
          if (!isFinite(result) && result === Infinity) currentInput = 'Infinity';
          if (!isFinite(result) && result === -Infinity) currentInput = '-Infinity';
          if (isNaN(result)) currentInput = 'Error';
        } else {
          exprDisplay.textContent = fullExpr + ' =';
          expression = '';
          currentInput = String(parseFloat(result.toPrecision(12)));
          lastResult = result;
        }
        shouldResetInput = true;
        display.textContent = currentInput;
        exprDisplay.textContent = exprDisplay.textContent;
        memIndicator.textContent = hasMemory ? 'M = ' + memory : '';
        return;
      }

      if (action === 'percent') {
        const val = parseFloat(currentInput);
        if (!isNaN(val)) {
          currentInput = String(val / 100);
          updateDisplay();
        }
        return;
      }

      // Scientific functions (operate on current input)
      const val = parseFloat(currentInput);
      if (isNaN(val) && !['pi', 'e', 'lparen', 'rparen', 'mc', 'mr', 'mplus', 'mminus'].includes(action)) return;

      let result;
      switch (action) {
        case 'sin':
          result = Math.sin(degToRad(val));
          currentInput = String(parseFloat(result.toPrecision(12)));
          expression = `sin(${val}) =`;
          shouldResetInput = true;
          break;
        case 'cos':
          result = Math.cos(degToRad(val));
          currentInput = String(parseFloat(result.toPrecision(12)));
          expression = `cos(${val}) =`;
          shouldResetInput = true;
          break;
        case 'tan':
          result = Math.tan(degToRad(val));
          currentInput = String(parseFloat(result.toPrecision(12)));
          expression = `tan(${val}) =`;
          shouldResetInput = true;
          break;
        case 'log':
          result = Math.log10(val);
          currentInput = String(parseFloat(result.toPrecision(12)));
          expression = `log(${val}) =`;
          shouldResetInput = true;
          break;
        case 'ln':
          result = Math.log(val);
          currentInput = String(parseFloat(result.toPrecision(12)));
          expression = `ln(${val}) =`;
          shouldResetInput = true;
          break;
        case 'sqrt':
          result = Math.sqrt(val);
          currentInput = String(parseFloat(result.toPrecision(12)));
          expression = `\u221A(${val}) =`;
          shouldResetInput = true;
          break;
        case 'square':
          result = val * val;
          currentInput = String(parseFloat(result.toPrecision(12)));
          expression = `(${val})\u00B2 =`;
          shouldResetInput = true;
          break;
        case 'power':
          expression += currentInput + ' ^ ';
          shouldResetInput = true;
          break;
        case 'factorial':
          result = factorial(val);
          currentInput = isNaN(result) ? 'Error' : String(result);
          expression = `${val}! =`;
          shouldResetInput = true;
          break;
        case 'abs':
          result = Math.abs(val);
          currentInput = String(result);
          expression = `|${val}| =`;
          shouldResetInput = true;
          break;
        case 'inverse':
          if (val === 0) {
            currentInput = 'Error';
          } else {
            result = 1 / val;
            currentInput = String(parseFloat(result.toPrecision(12)));
          }
          expression = `1/(${val}) =`;
          shouldResetInput = true;
          break;
        case 'pi':
          currentInput = String(Math.PI);
          shouldResetInput = true;
          break;
        case 'e':
          currentInput = String(Math.E);
          shouldResetInput = true;
          break;
        case 'lparen':
          expression += '(';
          shouldResetInput = true;
          break;
        case 'rparen':
          expression += currentInput + ')';
          shouldResetInput = true;
          break;

        // Memory
        case 'mc':
          memory = 0;
          hasMemory = false;
          break;
        case 'mr':
          if (hasMemory) {
            currentInput = String(memory);
            shouldResetInput = true;
          }
          break;
        case 'mplus':
          memory += val;
          hasMemory = true;
          break;
        case 'mminus':
          memory -= val;
          hasMemory = true;
          break;
      }

      // Handle power operator in expression evaluation
      if (action === 'power') {
        // Override the evaluate to handle ^
        const origEval = evaluateExpression;
        // We handle ^ in equals
      }

      updateDisplay();
    };

    // Override evaluateExpression to handle ^
    const origEval = evaluateExpression;

    // Button clicks
    document.getElementById('sc-buttons').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      handleAction(btn.dataset.action);
    });

    // Keyboard support
    const keyHandler = (e) => {
      // Only handle when calculator is visible
      if (document.getElementById('tool-page').style.display === 'none') return;

      const keyMap = {
        '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
        '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
        '.': 'decimal', '+': 'add', '-': 'subtract',
        '*': 'multiply', '/': 'divide', 'Enter': 'equals',
        '=': 'equals', 'Backspace': 'backspace', 'Escape': 'clear',
        '(': 'lparen', ')': 'rparen', '%': 'percent'
      };

      if (keyMap[e.key]) {
        e.preventDefault();
        handleAction(keyMap[e.key]);
      }
    };

    document.addEventListener('keydown', keyHandler);

    // Cleanup
    const cleanup = () => {
      document.removeEventListener('keydown', keyHandler);
      window.removeEventListener('hashchange', cleanup);
    };
    window.addEventListener('hashchange', cleanup);

    updateDisplay();
  }
});


// ----------------------------------------
// 6. Text Scratchpad
// ----------------------------------------
App.registerTool({
  id: 'text-scratchpad',
  name: '文本便签',
  description: 'Transform, clean and manipulate text with various operations',
  category: '其他',
  icon: '\u{1F4CB}',

  render() {
    return `
      <div class="tool-section">
        <div class="tool-section-title">Case</div>
        <div class="tool-btn-group" id="ts-case-btns">
          <button class="tool-btn tool-btn-sm" data-op="uppercase">UPPER</button>
          <button class="tool-btn tool-btn-sm" data-op="lowercase">lower</button>
          <button class="tool-btn tool-btn-sm" data-op="titlecase">Title Case</button>
          <button class="tool-btn tool-btn-sm" data-op="sentencecase">Sentence case</button>
        </div>
      </div>
      <div class="tool-section">
        <div class="tool-section-title">Clean</div>
        <div class="tool-btn-group" id="ts-clean-btns">
          <button class="tool-btn tool-btn-sm" data-op="trim-lines">Trim Lines</button>
          <button class="tool-btn tool-btn-sm" data-op="remove-extra-spaces">Remove Extra Spaces</button>
          <button class="tool-btn tool-btn-sm" data-op="remove-linebreaks">Remove Line Breaks</button>
          <button class="tool-btn tool-btn-sm" data-op="remove-duplicates">Remove Duplicates</button>
        </div>
      </div>
      <div class="tool-section">
        <div class="tool-section-title">Sort &amp; Transform</div>
        <div class="tool-btn-group" id="ts-sort-btns">
          <button class="tool-btn tool-btn-sm" data-op="sort-az">Sort A-Z</button>
          <button class="tool-btn tool-btn-sm" data-op="sort-za">Sort Z-A</button>
          <button class="tool-btn tool-btn-sm" data-op="reverse-text">Reverse Text</button>
          <button class="tool-btn tool-btn-sm" data-op="reverse-lines">Reverse Lines</button>
          <button class="tool-btn tool-btn-sm" data-op="add-line-numbers">Add Line Numbers</button>
        </div>
      </div>
      <div class="tool-section">
        <div class="tool-section-title">Encode / Decode</div>
        <div class="tool-btn-group" id="ts-encode-btns">
          <button class="tool-btn tool-btn-sm" data-op="url-encode">URL Encode</button>
          <button class="tool-btn tool-btn-sm" data-op="url-decode">URL Decode</button>
        </div>
      </div>
      <div class="tool-section">
        <div class="tool-section-title">Find &amp; Replace</div>
        <div class="tool-row" style="align-items:flex-end;gap:8px">
          <div class="tool-col" style="flex:1">
            <label class="tool-label">Find</label>
            <input type="text" id="ts-find" class="tool-input" placeholder="Search for...">
          </div>
          <div class="tool-col" style="flex:1">
            <label class="tool-label">Replace</label>
            <input type="text" id="ts-replace" class="tool-input" placeholder="Replace with...">
          </div>
          <button class="tool-btn tool-btn-sm tool-btn-primary" id="ts-replace-btn">Replace All</button>
        </div>
      </div>
      <div class="tool-section" style="display:flex;align-items:center;gap:12px">
        <label class="tool-label" style="margin:0;display:flex;align-items:center;gap:6px">
          <input type="checkbox" id="ts-wrap" checked> Word wrap
        </label>
        <button class="tool-btn tool-btn-sm" id="ts-undo-btn">Undo</button>
        <button class="tool-btn tool-btn-sm" id="ts-copy-btn">Copy All</button>
      </div>
      <textarea id="ts-textarea" class="tool-textarea" rows="16" placeholder="Paste or type your text here..." style="margin-top:8px"></textarea>
      <div id="ts-stats" style="font-size:12px;color:var(--text-dim);margin-top:8px;display:flex;gap:16px">
        <span id="ts-chars">0 characters</span>
        <span id="ts-words">0 words</span>
        <span id="ts-lines">0 lines</span>
      </div>
    `;
  },

  init() {
    const textarea = document.getElementById('ts-textarea');
    const charsEl = document.getElementById('ts-chars');
    const wordsEl = document.getElementById('ts-words');
    const linesEl = document.getElementById('ts-lines');
    const wrapToggle = document.getElementById('ts-wrap');

    const undoStack = [];
    const MAX_UNDO = 10;

    const pushUndo = () => {
      undoStack.push(textarea.value);
      if (undoStack.length > MAX_UNDO) undoStack.shift();
    };

    const updateStats = () => {
      const text = textarea.value;
      const chars = text.length;
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      const lines = text ? text.split('\n').length : 0;
      charsEl.textContent = `${App.utils.formatNumber(chars)} character${chars !== 1 ? 's' : ''}`;
      wordsEl.textContent = `${App.utils.formatNumber(words)} word${words !== 1 ? 's' : ''}`;
      linesEl.textContent = `${App.utils.formatNumber(lines)} line${lines !== 1 ? 's' : ''}`;
    };

    textarea.addEventListener('input', updateStats);

    wrapToggle.addEventListener('change', () => {
      textarea.style.whiteSpace = wrapToggle.checked ? 'pre-wrap' : 'pre';
      textarea.style.overflowX = wrapToggle.checked ? 'hidden' : 'auto';
    });

    const operations = {
      'uppercase': (t) => t.toUpperCase(),
      'lowercase': (t) => t.toLowerCase(),
      'titlecase': (t) => t.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()),
      'sentencecase': (t) => t.toLowerCase().replace(/(^\s*|[.!?]\s+)(\w)/g, (m, p, c) => p + c.toUpperCase()),
      'trim-lines': (t) => t.split('\n').map(l => l.trim()).join('\n'),
      'remove-extra-spaces': (t) => t.replace(/[^\S\n]+/g, ' ').replace(/\n{3,}/g, '\n\n'),
      'remove-linebreaks': (t) => t.replace(/\n+/g, ' '),
      'remove-duplicates': (t) => [...new Set(t.split('\n'))].join('\n'),
      'sort-az': (t) => t.split('\n').sort((a, b) => a.localeCompare(b)).join('\n'),
      'sort-za': (t) => t.split('\n').sort((a, b) => b.localeCompare(a)).join('\n'),
      'reverse-text': (t) => [...t].reverse().join(''),
      'reverse-lines': (t) => t.split('\n').reverse().join('\n'),
      'add-line-numbers': (t) => t.split('\n').map((l, i) => `${i + 1}. ${l}`).join('\n'),
      'url-encode': (t) => encodeURIComponent(t),
      'url-decode': (t) => { try { return decodeURIComponent(t); } catch (e) { return t; } }
    };

    // Delegate button clicks
    document.querySelectorAll('[data-op]').forEach(btn => {
      btn.addEventListener('click', () => {
        const op = btn.dataset.op;
        if (operations[op]) {
          pushUndo();
          textarea.value = operations[op](textarea.value);
          updateStats();
        }
      });
    });

    // Find & Replace
    document.getElementById('ts-replace-btn').addEventListener('click', () => {
      const find = document.getElementById('ts-find').value;
      if (!find) return;
      const replace = document.getElementById('ts-replace').value;
      pushUndo();
      // Use split/join for global replace (avoids regex special chars issues)
      textarea.value = textarea.value.split(find).join(replace);
      updateStats();
      const count = textarea.value.split(replace).length - 1;
      App.utils.toast(`Replaced occurrences`);
    });

    // Undo
    document.getElementById('ts-undo-btn').addEventListener('click', () => {
      if (undoStack.length > 0) {
        textarea.value = undoStack.pop();
        updateStats();
      } else {
        App.utils.toast('Nothing to undo');
      }
    });

    // Copy
    document.getElementById('ts-copy-btn').addEventListener('click', () => {
      if (textarea.value) {
        App.utils.copyToClipboard(textarea.value);
      }
    });

    updateStats();
  }
});


// ----------------------------------------
// 7. Paper Sizes
// ----------------------------------------
App.registerTool({
  id: 'paper-sizes',
  name: '纸张尺寸',
  description: 'Reference chart for standard paper sizes (A, B, C, US)',
  category: '其他',
  icon: '\u{1F4C4}',

  render() {
    return `
      <div class="tool-section" style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
        <div class="tool-tabs" id="ps-tabs">
          <button class="tool-tab active" data-ps-tab="A">A Series</button>
          <button class="tool-tab" data-ps-tab="B">B Series</button>
          <button class="tool-tab" data-ps-tab="C">C Series</button>
          <button class="tool-tab" data-ps-tab="US">US Sizes</button>
        </div>
        <label class="tool-label" style="margin:0;display:flex;align-items:center;gap:6px">
          <input type="checkbox" id="ps-inches"> Show inches
        </label>
      </div>
      <div class="tool-row" style="margin-top:16px;align-items:flex-start">
        <div class="tool-col" style="flex:1.5;overflow-x:auto">
          <table class="tool-table" id="ps-table">
            <thead>
              <tr>
                <th>Size</th>
                <th id="ps-dim-header">Dimensions (mm)</th>
              </tr>
            </thead>
            <tbody id="ps-table-body"></tbody>
          </table>
        </div>
        <div class="tool-col" style="flex:1">
          <div class="tool-preview" id="ps-visual" style="padding:16px;min-height:400px;position:relative;display:flex;align-items:flex-end;justify-content:flex-start;gap:4px;flex-wrap:wrap"></div>
        </div>
      </div>
    `;
  },

  init() {
    const paperData = {
      A: [
        { name: 'A0', w: 841, h: 1189, common: false },
        { name: 'A1', w: 594, h: 841, common: false },
        { name: 'A2', w: 420, h: 594, common: false },
        { name: 'A3', w: 297, h: 420, common: false },
        { name: 'A4', w: 210, h: 297, common: true },
        { name: 'A5', w: 148, h: 210, common: false },
        { name: 'A6', w: 105, h: 148, common: false },
        { name: 'A7', w: 74, h: 105, common: false },
        { name: 'A8', w: 52, h: 74, common: false },
        { name: 'A9', w: 37, h: 52, common: false },
        { name: 'A10', w: 26, h: 37, common: false }
      ],
      B: [
        { name: 'B0', w: 1000, h: 1414, common: false },
        { name: 'B1', w: 707, h: 1000, common: false },
        { name: 'B2', w: 500, h: 707, common: false },
        { name: 'B3', w: 353, h: 500, common: false },
        { name: 'B4', w: 250, h: 353, common: false },
        { name: 'B5', w: 176, h: 250, common: false }
      ],
      C: [
        { name: 'C0', w: 917, h: 1297, common: false },
        { name: 'C1', w: 648, h: 917, common: false },
        { name: 'C2', w: 458, h: 648, common: false },
        { name: 'C3', w: 324, h: 458, common: false },
        { name: 'C4', w: 229, h: 324, common: false },
        { name: 'C5', w: 162, h: 229, common: false },
        { name: 'C6', w: 114, h: 162, common: false }
      ],
      US: [
        { name: 'Letter', w: 216, h: 279, common: true },
        { name: 'Legal', w: 216, h: 356, common: false },
        { name: 'Tabloid', w: 279, h: 432, common: false },
        { name: 'Executive', w: 184, h: 267, common: false }
      ]
    };

    let currentSeries = 'A';
    let showInches = false;

    const mmToIn = (mm) => (mm / 25.4).toFixed(2);

    const render = () => {
      const data = paperData[currentSeries];
      const tbody = document.getElementById('ps-table-body');
      const dimHeader = document.getElementById('ps-dim-header');
      const visual = document.getElementById('ps-visual');

      dimHeader.textContent = showInches ? 'Dimensions (inches)' : 'Dimensions (mm)';

      tbody.innerHTML = data.map(p => {
        const dims = showInches
          ? `${mmToIn(p.w)} \u00D7 ${mmToIn(p.h)}`
          : `${p.w} \u00D7 ${p.h}`;
        const highlight = p.common ? 'style="color:var(--primary);font-weight:600"' : '';
        return `<tr ${highlight}><td>${p.name}${p.common ? ' \u2605' : ''}</td><td>${dims}</td></tr>`;
      }).join('');

      // Visual comparison - scale to fit
      const maxH = data[0].h;
      const scaleFactor = 360 / maxH;

      // Generate distinct hue-shifted colours
      const colours = [
        'rgba(0,255,136,0.25)', 'rgba(0,170,255,0.25)', 'rgba(255,170,0,0.25)',
        'rgba(255,68,68,0.25)', 'rgba(170,0,255,0.25)', 'rgba(255,255,0,0.25)',
        'rgba(0,255,255,0.25)', 'rgba(255,0,170,0.25)', 'rgba(136,255,0,0.25)',
        'rgba(0,136,255,0.25)', 'rgba(255,136,0,0.25)'
      ];

      visual.innerHTML = data.map((p, i) => {
        const w = Math.max(Math.round(p.w * scaleFactor), 14);
        const h = Math.max(Math.round(p.h * scaleFactor), 14);
        const borderColor = p.common ? 'var(--primary)' : 'var(--border-hover)';
        const bg = colours[i % colours.length];
        return `
          <div style="width:${w}px;height:${h}px;border:1px solid ${borderColor};background:${bg};
            display:flex;align-items:center;justify-content:center;font-size:${Math.max(9, Math.min(12, w / 4))}px;
            color:var(--text-dim);flex-shrink:0;border-radius:2px" title="${p.name}: ${p.w}\u00D7${p.h}mm">
            ${p.name}
          </div>
        `;
      }).join('');
    };

    document.getElementById('ps-tabs').addEventListener('click', (e) => {
      const tab = e.target.closest('[data-ps-tab]');
      if (!tab) return;
      document.querySelectorAll('[data-ps-tab]').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentSeries = tab.dataset.psTab;
      render();
    });

    document.getElementById('ps-inches').addEventListener('change', (e) => {
      showInches = e.target.checked;
      render();
    });

    render();
  }
});


// ----------------------------------------
// 8. Glyph Browser
// ----------------------------------------
App.registerTool({
  id: 'glyph-browser',
  name: '字符浏览器',
  description: 'Browse and copy Unicode characters by category',
  category: '其他',
  icon: '\u{2726}',

  render() {
    const categories = [
      'Arrows', 'Math Symbols', 'Box Drawing', 'Block Elements', 'Geometric Shapes',
      'Misc Symbols', 'Dingbats', 'Currency', 'Punctuation', 'Latin Extended',
      'Greek', 'Cyrillic'
    ];
    const tabs = categories.map((c, i) =>
      `<button class="tool-tab${i === 0 ? ' active' : ''}" data-gl-tab="${c}">${c}</button>`
    ).join('');

    return `
      <div class="tool-section">
        <label class="tool-label">Search</label>
        <input type="text" id="gl-search" class="tool-input" placeholder="Search by character or code point (e.g. U+2190)...">
      </div>
      <div class="tool-tabs" id="gl-tabs" style="flex-wrap:wrap">${tabs}</div>
      <div class="tool-row" style="margin-top:16px;align-items:flex-start">
        <div class="tool-col" style="flex:3">
          <div id="gl-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(42px,1fr));gap:4px"></div>
        </div>
        <div class="tool-col" style="flex:1;min-width:180px">
          <div class="tool-preview" id="gl-detail" style="text-align:center;padding:20px;min-height:200px;display:flex;flex-direction:column;align-items:center;justify-content:center">
            <div style="font-size:13px;color:var(--text-dim)">Click a character to see details</div>
          </div>
        </div>
      </div>
    `;
  },

  init() {
    const ranges = {
      'Arrows': [0x2190, 0x21FF],
      'Math Symbols': [0x2200, 0x22FF],
      'Box Drawing': [0x2500, 0x257F],
      'Block Elements': [0x2580, 0x259F],
      'Geometric Shapes': [0x25A0, 0x25FF],
      'Misc Symbols': [0x2600, 0x26FF],
      'Dingbats': [0x2700, 0x27BF],
      'Currency': [0x20A0, 0x20CF],
      'Punctuation': [0x2000, 0x206F],
      'Latin Extended': [0x0100, 0x017F],
      'Greek': [0x0370, 0x03FF],
      'Cyrillic': [0x0400, 0x04FF]
    };

    // Unicode character names (common ones)
    const getCharName = (cp) => {
      // We provide descriptive names for well-known ranges
      // For a full implementation you'd need a complete database
      // We'll generate approximate names from the range
      const rangeNames = {
        'Arrows': 'Arrow',
        'Math Symbols': 'Mathematical Symbol',
        'Box Drawing': 'Box Drawing',
        'Block Elements': 'Block Element',
        'Geometric Shapes': 'Geometric Shape',
        'Misc Symbols': 'Miscellaneous Symbol',
        'Dingbats': 'Dingbat',
        'Currency': 'Currency Symbol',
        'Punctuation': 'General Punctuation',
        'Latin Extended': 'Latin Extended Letter',
        'Greek': 'Greek Letter',
        'Cyrillic': 'Cyrillic Letter'
      };
      for (const [cat, range] of Object.entries(ranges)) {
        if (cp >= range[0] && cp <= range[1]) {
          return rangeNames[cat] || 'Unicode Character';
        }
      }
      return 'Unicode Character';
    };

    let currentCategory = 'Arrows';
    const gridEl = document.getElementById('gl-grid');
    const detailEl = document.getElementById('gl-detail');
    const searchEl = document.getElementById('gl-search');

    const generateChars = (start, end) => {
      const chars = [];
      for (let cp = start; cp <= end; cp++) {
        try {
          const char = String.fromCodePoint(cp);
          // Filter out control/unassigned characters
          if (char.trim() || cp >= 0x2500) {
            chars.push({ char, cp });
          }
        } catch (e) {
          // Skip invalid code points
        }
      }
      return chars;
    };

    const renderGrid = (chars) => {
      gridEl.innerHTML = chars.map(({ char, cp }) => {
        const hex = cp.toString(16).toUpperCase().padStart(4, '0');
        return `
          <div class="gl-cell" data-cp="${cp}" data-char="${App.utils.escapeHtml(char)}"
            style="width:42px;height:42px;display:flex;align-items:center;justify-content:center;
            font-size:20px;cursor:pointer;border:1px solid var(--border);border-radius:var(--radius-sm);
            transition:var(--transition);background:var(--bg-input)"
            title="U+${hex}">${char}</div>
        `;
      }).join('');
    };

    const showDetail = (char, cp) => {
      const hex = cp.toString(16).toUpperCase().padStart(4, '0');
      const htmlEntity = `&#x${hex};`;
      const name = getCharName(cp);

      detailEl.innerHTML = `
        <div style="font-size:64px;margin-bottom:12px;line-height:1">${char}</div>
        <div style="font-size:11px;color:var(--text-dim);margin-bottom:8px">${name}</div>
        <table style="font-size:12px;width:100%;text-align:left">
          <tr><td style="color:var(--text-dim);padding:4px 8px 4px 0">Character</td><td style="color:var(--text);padding:4px 0">${char}</td></tr>
          <tr><td style="color:var(--text-dim);padding:4px 8px 4px 0">Code Point</td><td style="color:var(--text);padding:4px 0">U+${hex}</td></tr>
          <tr><td style="color:var(--text-dim);padding:4px 8px 4px 0">Decimal</td><td style="color:var(--text);padding:4px 0">${cp}</td></tr>
          <tr><td style="color:var(--text-dim);padding:4px 8px 4px 0">HTML</td><td style="color:var(--text);padding:4px 0">${App.utils.escapeHtml(htmlEntity)}</td></tr>
          <tr><td style="color:var(--text-dim);padding:4px 8px 4px 0">CSS</td><td style="color:var(--text);padding:4px 0">\\${hex}</td></tr>
          <tr><td style="color:var(--text-dim);padding:4px 8px 4px 0">JS</td><td style="color:var(--text);padding:4px 0">\\u{${hex}}</td></tr>
        </table>
        <div class="tool-btn-group" style="margin-top:12px">
          <button class="tool-btn tool-btn-sm tool-btn-primary" id="gl-copy-char">Copy Character</button>
          <button class="tool-btn tool-btn-sm" id="gl-copy-html">Copy HTML</button>
        </div>
      `;

      document.getElementById('gl-copy-char').addEventListener('click', () => {
        App.utils.copyToClipboard(char);
      });
      document.getElementById('gl-copy-html').addEventListener('click', () => {
        App.utils.copyToClipboard(htmlEntity);
      });
    };

    const renderCategory = (category) => {
      const range = ranges[category];
      if (!range) return;
      const chars = generateChars(range[0], range[1]);
      renderGrid(chars);
    };

    // Grid click - copy and show detail
    gridEl.addEventListener('click', (e) => {
      const cell = e.target.closest('.gl-cell');
      if (!cell) return;
      const cp = parseInt(cell.dataset.cp);
      const char = String.fromCodePoint(cp);
      App.utils.copyToClipboard(char);
      showDetail(char, cp);

      // Highlight selected
      gridEl.querySelectorAll('.gl-cell').forEach(c => c.style.borderColor = 'var(--border)');
      cell.style.borderColor = 'var(--primary)';
    });

    // Hover effect
    gridEl.addEventListener('mouseover', (e) => {
      const cell = e.target.closest('.gl-cell');
      if (cell) cell.style.background = 'var(--bg-card-hover)';
    });
    gridEl.addEventListener('mouseout', (e) => {
      const cell = e.target.closest('.gl-cell');
      if (cell) cell.style.background = 'var(--bg-input)';
    });

    // Tab switching
    document.getElementById('gl-tabs').addEventListener('click', (e) => {
      const tab = e.target.closest('[data-gl-tab]');
      if (!tab) return;
      document.querySelectorAll('[data-gl-tab]').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCategory = tab.dataset.glTab;
      searchEl.value = '';
      renderCategory(currentCategory);
    });

    // Search
    searchEl.addEventListener('input', App.utils.debounce(() => {
      const query = searchEl.value.trim().toLowerCase();
      if (!query) {
        renderCategory(currentCategory);
        return;
      }

      // Search across all categories
      let allChars = [];
      for (const [cat, range] of Object.entries(ranges)) {
        const chars = generateChars(range[0], range[1]);
        allChars = allChars.concat(chars);
      }

      // Check if searching by code point
      let filtered;
      if (query.startsWith('u+') || query.startsWith('0x')) {
        const hex = query.replace(/^u\+|^0x/, '');
        const targetCp = parseInt(hex, 16);
        if (!isNaN(targetCp)) {
          filtered = allChars.filter(c => c.cp === targetCp);
        } else {
          filtered = [];
        }
      } else {
        // Search by character match
        filtered = allChars.filter(c => c.char.includes(query) || c.cp.toString(16).includes(query));
      }

      renderGrid(filtered);
    }, 200));

    renderCategory(currentCategory);
  }
});
