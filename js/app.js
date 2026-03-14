/* ========================================
   MY TOOLBOX - Core Application
   ======================================== */

const App = {
  tools: [],
  categories: {},

  // Register a tool
  registerTool(tool) {
    this.tools.push(tool);
    if (!this.categories[tool.category]) {
      this.categories[tool.category] = [];
    }
    this.categories[tool.category].push(tool);
  },

  // Initialize the app
  init() {
    this.setupRouting();
    this.setupSearch();
    this.renderGrid();
    this.handleRoute();
  },

  // Hash-based routing
  setupRouting() {
    window.addEventListener('hashchange', () => this.handleRoute());
  },

  handleRoute() {
    const hash = location.hash.slice(1);
    if (hash) {
      const tool = this.tools.find(t => t.id === hash);
      if (tool) {
        this.showTool(tool);
        return;
      }
    }
    this.showHome();
  },

  showHome() {
    document.getElementById('home-page').style.display = '';
    document.getElementById('tool-page').style.display = 'none';
    document.title = 'My Toolbox';
  },

  showTool(tool) {
    document.getElementById('home-page').style.display = 'none';
    const toolPage = document.getElementById('tool-page');
    toolPage.style.display = '';
    document.getElementById('tool-title').textContent = tool.name;
    document.getElementById('tool-description').textContent = tool.description;
    document.title = `${tool.name} - My Toolbox`;

    const content = document.getElementById('tool-content');
    content.innerHTML = tool.render();
    content.className = 'fade-in';

    if (tool.init) {
      // Small delay to ensure DOM is ready
      requestAnimationFrame(() => tool.init());
    }
    window.scrollTo(0, 0);
  },

  // Search
  setupSearch() {
    const input = document.getElementById('search-input');
    input.addEventListener('input', App.utils.debounce(() => {
      this.filterTools(input.value.trim().toLowerCase());
    }, 150));

    // Cmd+K shortcut
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        input.focus();
        input.select();
      }
      if (e.key === 'Escape' && document.activeElement === input) {
        input.value = '';
        input.blur();
        this.filterTools('');
      }
    });
  },

  filterTools(query) {
    const cards = document.querySelectorAll('.tool-card');
    const sections = document.querySelectorAll('.category-section');

    cards.forEach(card => {
      const name = card.dataset.name.toLowerCase();
      const desc = card.dataset.desc.toLowerCase();
      const cat = card.dataset.category.toLowerCase();
      const match = !query || name.includes(query) || desc.includes(query) || cat.includes(query);
      card.style.display = match ? '' : 'none';
    });

    // Hide empty sections
    sections.forEach(section => {
      const visibleCards = section.querySelectorAll('.tool-card:not([style*="display: none"])');
      section.style.display = visibleCards.length ? '' : 'none';
    });
  },

  // Render the tool grid on the home page
  renderGrid() {
    const grid = document.getElementById('tools-grid');
    const categoryOrder = ['Colour', 'Typography', 'Image', 'Social Media', 'Developer', 'Other'];
    const categoryIcons = {
      'Colour': '🎨', 'Typography': '🔤', 'Image': '🖼️',
      'Social Media': '📱', 'Developer': '⚡', 'Other': '🔧'
    };

    let html = '';
    categoryOrder.forEach(cat => {
      const tools = this.categories[cat];
      if (!tools) return;
      html += `<section class="category-section">
        <h2 class="category-title">${cat}</h2>
        <div class="tools-row">`;
      tools.forEach(tool => {
        html += `<a href="#${tool.id}" class="tool-card" data-name="${tool.name}" data-desc="${tool.description}" data-category="${cat}">
          <div class="tool-card-icon">${tool.icon || categoryIcons[cat] || '⚡'}</div>
          <div class="tool-card-info">
            <div class="tool-card-name">${tool.name}</div>
            <div class="tool-card-desc">${tool.description}</div>
          </div>
          <span class="tool-card-arrow">→</span>
        </a>`;
      });
      html += '</div></section>';
    });
    grid.innerHTML = html;
  },

  // Utility functions
  utils: {
    // DOM helpers
    $(selector) { return document.querySelector(selector); },
    $$(selector) { return document.querySelectorAll(selector); },

    // Debounce
    debounce(fn, delay) {
      let timer;
      return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
      };
    },

    // Copy to clipboard
    copyToClipboard(text) {
      navigator.clipboard.writeText(text).then(() => {
        App.utils.toast('Copied!');
      });
    },

    // Toast notification
    toast(message) {
      const el = document.getElementById('toast');
      el.textContent = message;
      el.classList.add('show');
      setTimeout(() => el.classList.remove('show'), 2000);
    },

    // Download a single file
    downloadFile(data, filename, mimeType) {
      const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType || 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    },

    // Download multiple files as ZIP
    async downloadZip(files, zipName) {
      const zip = new JSZip();
      files.forEach(f => zip.file(f.name, f.data));
      const blob = await zip.generateAsync({ type: 'blob' });
      App.utils.downloadFile(blob, zipName, 'application/zip');
    },

    // Read file helpers
    readFileAs(file, method) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        if (method === 'dataurl') reader.readAsDataURL(file);
        else if (method === 'text') reader.readAsText(file);
        else if (method === 'arraybuffer') reader.readAsArrayBuffer(file);
      });
    },

    // Load image from src
    loadImage(src) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    },

    // Canvas to blob
    canvasToBlob(canvas, type = 'image/png', quality = 0.92) {
      return new Promise(resolve => canvas.toBlob(resolve, type, quality));
    },

    // ========================================
    // Color Conversion Utilities
    // ========================================

    // Parse any color string to RGB
    parseColor(str) {
      str = str.trim();
      // HEX
      if (str.startsWith('#')) {
        return App.utils.hexToRgb(str);
      }
      // RGB
      const rgbMatch = str.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
      if (rgbMatch) return { r: +rgbMatch[1], g: +rgbMatch[2], b: +rgbMatch[3] };
      // HSL
      const hslMatch = str.match(/hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%?\s*,\s*([\d.]+)%?/);
      if (hslMatch) return App.utils.hslToRgb(+hslMatch[1], +hslMatch[2], +hslMatch[3]);
      return null;
    },

    hexToRgb(hex) {
      hex = hex.replace('#', '');
      if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
      return {
        r: parseInt(hex.substring(0, 2), 16),
        g: parseInt(hex.substring(2, 4), 16),
        b: parseInt(hex.substring(4, 6), 16)
      };
    },

    rgbToHex(r, g, b) {
      return '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
    },

    rgbToHsl(r, g, b) {
      r /= 255; g /= 255; b /= 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;
      if (max === min) { h = s = 0; }
      else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
          case g: h = ((b - r) / d + 2) / 6; break;
          case b: h = ((r - g) / d + 4) / 6; break;
        }
      }
      return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
    },

    hslToRgb(h, s, l) {
      h /= 360; s /= 100; l /= 100;
      let r, g, b;
      if (s === 0) { r = g = b = l; }
      else {
        const hue2rgb = (p, q, t) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1 / 6) return p + (q - p) * 6 * t;
          if (t < 1 / 2) return q;
          if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
          return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
      }
      return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
    },

    rgbToHsv(r, g, b) {
      r /= 255; g /= 255; b /= 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h, s, v = max;
      const d = max - min;
      s = max === 0 ? 0 : d / max;
      if (max === min) { h = 0; }
      else {
        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
          case g: h = ((b - r) / d + 2) / 6; break;
          case b: h = ((r - g) / d + 4) / 6; break;
        }
      }
      return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) };
    },

    hsvToRgb(h, s, v) {
      h /= 360; s /= 100; v /= 100;
      let r, g, b;
      const i = Math.floor(h * 6);
      const f = h * 6 - i;
      const p = v * (1 - s);
      const q = v * (1 - f * s);
      const t = v * (1 - (1 - f) * s);
      switch (i % 6) {
        case 0: r = v; g = t; b = p; break;
        case 1: r = q; g = v; b = p; break;
        case 2: r = p; g = v; b = t; break;
        case 3: r = p; g = q; b = v; break;
        case 4: r = t; g = p; b = v; break;
        case 5: r = v; g = p; b = q; break;
      }
      return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
    },

    rgbToCmyk(r, g, b) {
      r /= 255; g /= 255; b /= 255;
      const k = 1 - Math.max(r, g, b);
      if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
      return {
        c: Math.round(((1 - r - k) / (1 - k)) * 100),
        m: Math.round(((1 - g - k) / (1 - k)) * 100),
        y: Math.round(((1 - b - k) / (1 - k)) * 100),
        k: Math.round(k * 100)
      };
    },

    cmykToRgb(c, m, y, k) {
      c /= 100; m /= 100; y /= 100; k /= 100;
      return {
        r: Math.round(255 * (1 - c) * (1 - k)),
        g: Math.round(255 * (1 - m) * (1 - k)),
        b: Math.round(255 * (1 - y) * (1 - k))
      };
    },

    // Relative luminance (WCAG)
    relativeLuminance(r, g, b) {
      const [rs, gs, bs] = [r, g, b].map(v => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    },

    // Contrast ratio
    contrastRatio(rgb1, rgb2) {
      const l1 = App.utils.relativeLuminance(rgb1.r, rgb1.g, rgb1.b);
      const l2 = App.utils.relativeLuminance(rgb2.r, rgb2.g, rgb2.b);
      const lighter = Math.max(l1, l2);
      const darker = Math.min(l1, l2);
      return (lighter + 0.05) / (darker + 0.05);
    },

    // Setup file upload area with drag & drop
    setupUpload(areaId, inputId, callback) {
      const area = document.getElementById(areaId);
      const input = document.getElementById(inputId);
      if (!area || !input) return;

      area.addEventListener('click', () => input.click());
      input.addEventListener('change', (e) => {
        if (e.target.files[0]) callback(e.target.files[0]);
      });

      area.addEventListener('dragover', (e) => { e.preventDefault(); area.classList.add('drag-over'); });
      area.addEventListener('dragleave', () => area.classList.remove('drag-over'));
      area.addEventListener('drop', (e) => {
        e.preventDefault();
        area.classList.remove('drag-over');
        if (e.dataTransfer.files[0]) callback(e.dataTransfer.files[0]);
      });
    },

    // Clamp number
    clamp(val, min, max) {
      return Math.min(Math.max(val, min), max);
    },

    // Escape HTML
    escapeHtml(str) {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    },

    // Format number with commas
    formatNumber(n) {
      return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
  }
};

// Back button handler
document.getElementById('back-btn').addEventListener('click', (e) => {
  e.preventDefault();
  location.hash = '';
});

// Initialize when all scripts are loaded
window.addEventListener('load', () => App.init());
