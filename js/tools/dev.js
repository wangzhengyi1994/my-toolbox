/* ========================================
   DEVELOPER TOOLS
   ======================================== */

// ----------------------------------------
// 1. Base Converter
// ----------------------------------------
App.registerTool({
  id: 'base-converter',
  name: 'Base Converter',
  description: 'Convert numbers between binary, octal, decimal and hexadecimal',
  category: 'Developer',
  icon: '\u{1F522}',

  render() {
    return `
      <div class="tool-section">
        <div class="tool-row">
          <div class="tool-col">
            <label class="tool-label">Number</label>
            <input type="text" id="bc-input" class="tool-input" placeholder="Enter a number..." spellcheck="false" autocomplete="off">
          </div>
          <div class="tool-col" style="max-width:200px">
            <label class="tool-label">Input Base</label>
            <select id="bc-base" class="tool-select">
              <option value="2">Binary (2)</option>
              <option value="8">Octal (8)</option>
              <option value="10" selected>Decimal (10)</option>
              <option value="16">Hexadecimal (16)</option>
            </select>
          </div>
        </div>
        <div id="bc-error" style="color:var(--danger);font-size:12px;margin-top:4px;min-height:18px"></div>
      </div>

      <div class="result-grid" style="grid-template-columns:repeat(auto-fill,minmax(280px,1fr))" id="bc-results">
        <div class="result-card">
          <div class="result-label">Binary (Base 2)</div>
          <div class="result-value" id="bc-bin" style="font-size:16px;word-break:break-all">0b0</div>
          <button class="tool-btn tool-btn-sm" style="margin-top:8px" onclick="App.utils.copyToClipboard(document.getElementById('bc-bin').textContent)">Copy</button>
        </div>
        <div class="result-card">
          <div class="result-label">Octal (Base 8)</div>
          <div class="result-value" id="bc-oct" style="font-size:16px;word-break:break-all">0o0</div>
          <button class="tool-btn tool-btn-sm" style="margin-top:8px" onclick="App.utils.copyToClipboard(document.getElementById('bc-oct').textContent)">Copy</button>
        </div>
        <div class="result-card">
          <div class="result-label">Decimal (Base 10)</div>
          <div class="result-value" id="bc-dec" style="font-size:16px;word-break:break-all">0</div>
          <button class="tool-btn tool-btn-sm" style="margin-top:8px" onclick="App.utils.copyToClipboard(document.getElementById('bc-dec').textContent)">Copy</button>
        </div>
        <div class="result-card">
          <div class="result-label">Hexadecimal (Base 16)</div>
          <div class="result-value" id="bc-hex" style="font-size:16px;word-break:break-all">0x0</div>
          <button class="tool-btn tool-btn-sm" style="margin-top:8px" onclick="App.utils.copyToClipboard(document.getElementById('bc-hex').textContent)">Copy</button>
        </div>
      </div>
    `;
  },

  init() {
    const input = document.getElementById('bc-input');
    const baseSelect = document.getElementById('bc-base');
    const errorEl = document.getElementById('bc-error');
    const binEl = document.getElementById('bc-bin');
    const octEl = document.getElementById('bc-oct');
    const decEl = document.getElementById('bc-dec');
    const hexEl = document.getElementById('bc-hex');

    const validChars = {
      2: /^[01]+$/,
      8: /^[0-7]+$/,
      10: /^[0-9]+$/,
      16: /^[0-9a-fA-F]+$/
    };

    function convert() {
      const raw = input.value.trim();
      errorEl.textContent = '';

      if (!raw) {
        binEl.textContent = '0b0';
        octEl.textContent = '0o0';
        decEl.textContent = '0';
        hexEl.textContent = '0x0';
        return;
      }

      const base = parseInt(baseSelect.value);

      // Strip common prefixes
      let cleaned = raw;
      if (base === 16) cleaned = cleaned.replace(/^0x/i, '');
      if (base === 2) cleaned = cleaned.replace(/^0b/i, '');
      if (base === 8) cleaned = cleaned.replace(/^0o/i, '');

      if (!cleaned || !validChars[base].test(cleaned)) {
        errorEl.textContent = `Invalid character for base ${base}. Allowed: ${base === 2 ? '0-1' : base === 8 ? '0-7' : base === 10 ? '0-9' : '0-9, A-F'}`;
        return;
      }

      try {
        // Use BigInt for large number support
        let decValue;
        if (base === 10) {
          decValue = BigInt(cleaned);
        } else if (base === 16) {
          decValue = BigInt('0x' + cleaned);
        } else if (base === 8) {
          decValue = BigInt('0o' + cleaned);
        } else if (base === 2) {
          decValue = BigInt('0b' + cleaned);
        }

        binEl.textContent = '0b' + decValue.toString(2);
        octEl.textContent = '0o' + decValue.toString(8);
        decEl.textContent = decValue.toString(10);
        hexEl.textContent = '0x' + decValue.toString(16).toUpperCase();
      } catch (e) {
        errorEl.textContent = 'Error converting number: ' + e.message;
      }
    }

    input.addEventListener('input', convert);
    baseSelect.addEventListener('change', convert);
  }
});


// ----------------------------------------
// 2. Encoding Tools
// ----------------------------------------
App.registerTool({
  id: 'encoding-tools',
  name: 'Encoding Tools',
  description: 'Base64, URL, HTML entity encoding and hash generation',
  category: 'Developer',
  icon: '\u{1F510}',

  render() {
    return `
      <div class="tool-tabs" id="enc-tabs">
        <button class="tool-tab active" data-tab="enc-base64">Base64</button>
        <button class="tool-tab" data-tab="enc-url">URL</button>
        <button class="tool-tab" data-tab="enc-html">HTML Entities</button>
        <button class="tool-tab" data-tab="enc-hash">Hash</button>
      </div>

      <!-- Base64 Tab -->
      <div class="tool-tab-content active" id="enc-base64">
        <div class="tool-section">
          <label class="tool-label">Input</label>
          <textarea id="enc-b64-input" class="tool-textarea" rows="5" placeholder="Enter text to encode/decode..."></textarea>
          <div class="tool-btn-group" style="margin-top:8px">
            <button class="tool-btn tool-btn-primary" id="enc-b64-encode">Encode</button>
            <button class="tool-btn" id="enc-b64-decode">Decode</button>
          </div>
        </div>
        <div class="tool-section">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <label class="tool-label">Output</label>
            <button class="tool-btn tool-btn-sm" id="enc-b64-copy">Copy</button>
          </div>
          <div class="tool-output" id="enc-b64-output" style="min-height:80px;white-space:pre-wrap;word-break:break-all"></div>
        </div>
      </div>

      <!-- URL Tab -->
      <div class="tool-tab-content" id="enc-url">
        <div class="tool-section">
          <label class="tool-label">Input</label>
          <textarea id="enc-url-input" class="tool-textarea" rows="5" placeholder="Enter text or URL to encode/decode..."></textarea>
          <div class="tool-btn-group" style="margin-top:8px">
            <button class="tool-btn tool-btn-primary" id="enc-url-encode">Encode</button>
            <button class="tool-btn" id="enc-url-decode">Decode</button>
          </div>
        </div>
        <div class="tool-section">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <label class="tool-label">Output</label>
            <button class="tool-btn tool-btn-sm" id="enc-url-copy">Copy</button>
          </div>
          <div class="tool-output" id="enc-url-output" style="min-height:80px;white-space:pre-wrap;word-break:break-all"></div>
        </div>
      </div>

      <!-- HTML Entities Tab -->
      <div class="tool-tab-content" id="enc-html">
        <div class="tool-section">
          <label class="tool-label">Input</label>
          <textarea id="enc-html-input" class="tool-textarea" rows="5" placeholder="Enter HTML or text to encode/decode..."></textarea>
          <div class="tool-btn-group" style="margin-top:8px">
            <button class="tool-btn tool-btn-primary" id="enc-html-encode">Encode</button>
            <button class="tool-btn" id="enc-html-decode">Decode</button>
          </div>
        </div>
        <div class="tool-section">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <label class="tool-label">Output</label>
            <button class="tool-btn tool-btn-sm" id="enc-html-copy">Copy</button>
          </div>
          <div class="tool-output" id="enc-html-output" style="min-height:80px;white-space:pre-wrap;word-break:break-all"></div>
        </div>
      </div>

      <!-- Hash Tab -->
      <div class="tool-tab-content" id="enc-hash">
        <div class="tool-section">
          <label class="tool-label">Input</label>
          <textarea id="enc-hash-input" class="tool-textarea" rows="5" placeholder="Enter text to hash..."></textarea>
          <div class="tool-btn-group" style="margin-top:8px">
            <button class="tool-btn tool-btn-primary" id="enc-hash-generate">Generate Hashes</button>
          </div>
        </div>
        <div class="tool-section" id="enc-hash-results">
          <div class="tool-section-title">Hash Results</div>
          <div style="display:flex;flex-direction:column;gap:12px">
            <div>
              <div style="display:flex;justify-content:space-between;align-items:center">
                <label class="tool-label">MD5</label>
                <button class="tool-btn tool-btn-sm" onclick="App.utils.copyToClipboard(document.getElementById('enc-hash-md5').textContent)">Copy</button>
              </div>
              <div class="tool-output" id="enc-hash-md5" style="word-break:break-all">-</div>
            </div>
            <div>
              <div style="display:flex;justify-content:space-between;align-items:center">
                <label class="tool-label">SHA-1</label>
                <button class="tool-btn tool-btn-sm" onclick="App.utils.copyToClipboard(document.getElementById('enc-hash-sha1').textContent)">Copy</button>
              </div>
              <div class="tool-output" id="enc-hash-sha1" style="word-break:break-all">-</div>
            </div>
            <div>
              <div style="display:flex;justify-content:space-between;align-items:center">
                <label class="tool-label">SHA-256</label>
                <button class="tool-btn tool-btn-sm" onclick="App.utils.copyToClipboard(document.getElementById('enc-hash-sha256').textContent)">Copy</button>
              </div>
              <div class="tool-output" id="enc-hash-sha256" style="word-break:break-all">-</div>
            </div>
            <div>
              <div style="display:flex;justify-content:space-between;align-items:center">
                <label class="tool-label">SHA-512</label>
                <button class="tool-btn tool-btn-sm" onclick="App.utils.copyToClipboard(document.getElementById('enc-hash-sha512').textContent)">Copy</button>
              </div>
              <div class="tool-output" id="enc-hash-sha512" style="word-break:break-all">-</div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  init() {
    // Tab switching
    const tabs = document.querySelectorAll('#enc-tabs .tool-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        document.querySelectorAll('#encoding-tools .tool-tab-content, #enc-base64, #enc-url, #enc-html, #enc-hash').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        const target = document.getElementById(tab.dataset.tab);
        if (target) target.classList.add('active');
      });
    });

    // --- Base64 ---
    document.getElementById('enc-b64-encode').addEventListener('click', () => {
      const input = document.getElementById('enc-b64-input').value;
      try {
        // Handle Unicode properly
        const encoded = btoa(unescape(encodeURIComponent(input)));
        document.getElementById('enc-b64-output').textContent = encoded;
      } catch (e) {
        document.getElementById('enc-b64-output').textContent = 'Error: ' + e.message;
      }
    });

    document.getElementById('enc-b64-decode').addEventListener('click', () => {
      const input = document.getElementById('enc-b64-input').value;
      try {
        const decoded = decodeURIComponent(escape(atob(input)));
        document.getElementById('enc-b64-output').textContent = decoded;
      } catch (e) {
        document.getElementById('enc-b64-output').textContent = 'Error: Invalid Base64 string';
      }
    });

    document.getElementById('enc-b64-copy').addEventListener('click', () => {
      App.utils.copyToClipboard(document.getElementById('enc-b64-output').textContent);
    });

    // --- URL ---
    document.getElementById('enc-url-encode').addEventListener('click', () => {
      const input = document.getElementById('enc-url-input').value;
      document.getElementById('enc-url-output').textContent = encodeURIComponent(input);
    });

    document.getElementById('enc-url-decode').addEventListener('click', () => {
      const input = document.getElementById('enc-url-input').value;
      try {
        document.getElementById('enc-url-output').textContent = decodeURIComponent(input);
      } catch (e) {
        document.getElementById('enc-url-output').textContent = 'Error: Invalid URL-encoded string';
      }
    });

    document.getElementById('enc-url-copy').addEventListener('click', () => {
      App.utils.copyToClipboard(document.getElementById('enc-url-output').textContent);
    });

    // --- HTML Entities ---
    const htmlEntityMap = {
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
      '\u00A0': '&nbsp;', '\u00A9': '&copy;', '\u00AE': '&reg;', '\u2122': '&trade;',
      '\u20AC': '&euro;', '\u00A3': '&pound;', '\u00A5': '&yen;',
      '\u2018': '&lsquo;', '\u2019': '&rsquo;', '\u201C': '&ldquo;', '\u201D': '&rdquo;',
      '\u2013': '&ndash;', '\u2014': '&mdash;', '\u2026': '&hellip;'
    };

    document.getElementById('enc-html-encode').addEventListener('click', () => {
      const input = document.getElementById('enc-html-input').value;
      let encoded = '';
      for (let i = 0; i < input.length; i++) {
        const ch = input[i];
        if (htmlEntityMap[ch]) {
          encoded += htmlEntityMap[ch];
        } else if (ch.charCodeAt(0) > 127) {
          encoded += '&#' + ch.charCodeAt(0) + ';';
        } else {
          encoded += ch;
        }
      }
      document.getElementById('enc-html-output').textContent = encoded;
    });

    document.getElementById('enc-html-decode').addEventListener('click', () => {
      const input = document.getElementById('enc-html-input').value;
      const textarea = document.createElement('textarea');
      textarea.innerHTML = input;
      document.getElementById('enc-html-output').textContent = textarea.value;
    });

    document.getElementById('enc-html-copy').addEventListener('click', () => {
      App.utils.copyToClipboard(document.getElementById('enc-html-output').textContent);
    });

    // --- Hash ---
    // Simple MD5 implementation
    function md5(string) {
      function md5cycle(x, k) {
        let a = x[0], b = x[1], c = x[2], d = x[3];
        a = ff(a, b, c, d, k[0], 7, -680876936);
        d = ff(d, a, b, c, k[1], 12, -389564586);
        c = ff(c, d, a, b, k[2], 17, 606105819);
        b = ff(b, c, d, a, k[3], 22, -1044525330);
        a = ff(a, b, c, d, k[4], 7, -176418897);
        d = ff(d, a, b, c, k[5], 12, 1200080426);
        c = ff(c, d, a, b, k[6], 17, -1473231341);
        b = ff(b, c, d, a, k[7], 22, -45705983);
        a = ff(a, b, c, d, k[8], 7, 1770035416);
        d = ff(d, a, b, c, k[9], 12, -1958414417);
        c = ff(c, d, a, b, k[10], 17, -42063);
        b = ff(b, c, d, a, k[11], 22, -1990404162);
        a = ff(a, b, c, d, k[12], 7, 1804603682);
        d = ff(d, a, b, c, k[13], 12, -40341101);
        c = ff(c, d, a, b, k[14], 17, -1502002290);
        b = ff(b, c, d, a, k[15], 22, 1236535329);
        a = gg(a, b, c, d, k[1], 5, -165796510);
        d = gg(d, a, b, c, k[6], 9, -1069501632);
        c = gg(c, d, a, b, k[11], 14, 643717713);
        b = gg(b, c, d, a, k[0], 20, -373897302);
        a = gg(a, b, c, d, k[5], 5, -701558691);
        d = gg(d, a, b, c, k[10], 9, 38016083);
        c = gg(c, d, a, b, k[15], 14, -660478335);
        b = gg(b, c, d, a, k[4], 20, -405537848);
        a = gg(a, b, c, d, k[9], 5, 568446438);
        d = gg(d, a, b, c, k[14], 9, -1019803690);
        c = gg(c, d, a, b, k[3], 14, -187363961);
        b = gg(b, c, d, a, k[8], 20, 1163531501);
        a = gg(a, b, c, d, k[13], 5, -1444681467);
        d = gg(d, a, b, c, k[2], 9, -51403784);
        c = gg(c, d, a, b, k[7], 14, 1735328473);
        b = gg(b, c, d, a, k[12], 20, -1926607734);
        a = hh(a, b, c, d, k[5], 4, -378558);
        d = hh(d, a, b, c, k[8], 11, -2022574463);
        c = hh(c, d, a, b, k[11], 16, 1839030562);
        b = hh(b, c, d, a, k[14], 23, -35309556);
        a = hh(a, b, c, d, k[1], 4, -1530992060);
        d = hh(d, a, b, c, k[4], 11, 1272893353);
        c = hh(c, d, a, b, k[7], 16, -155497632);
        b = hh(b, c, d, a, k[10], 23, -1094730640);
        a = hh(a, b, c, d, k[13], 4, 681279174);
        d = hh(d, a, b, c, k[0], 11, -358537222);
        c = hh(c, d, a, b, k[3], 16, -722521979);
        b = hh(b, c, d, a, k[6], 23, 76029189);
        a = hh(a, b, c, d, k[9], 4, -640364487);
        d = hh(d, a, b, c, k[12], 11, -421815835);
        c = hh(c, d, a, b, k[15], 16, 530742520);
        b = hh(b, c, d, a, k[2], 23, -995338651);
        a = ii(a, b, c, d, k[0], 6, -198630844);
        d = ii(d, a, b, c, k[7], 10, 1126891415);
        c = ii(c, d, a, b, k[14], 15, -1416354905);
        b = ii(b, c, d, a, k[5], 21, -57434055);
        a = ii(a, b, c, d, k[12], 6, 1700485571);
        d = ii(d, a, b, c, k[3], 10, -1894986606);
        c = ii(c, d, a, b, k[10], 15, -1051523);
        b = ii(b, c, d, a, k[1], 21, -2054922799);
        a = ii(a, b, c, d, k[8], 6, 1873313359);
        d = ii(d, a, b, c, k[15], 10, -30611744);
        c = ii(c, d, a, b, k[6], 15, -1560198380);
        b = ii(b, c, d, a, k[13], 21, 1309151649);
        a = ii(a, b, c, d, k[4], 6, -145523070);
        d = ii(d, a, b, c, k[11], 10, -1120210379);
        c = ii(c, d, a, b, k[2], 15, 718787259);
        b = ii(b, c, d, a, k[9], 21, -343485551);
        x[0] = add32(a, x[0]);
        x[1] = add32(b, x[1]);
        x[2] = add32(c, x[2]);
        x[3] = add32(d, x[3]);
      }
      function cmn(q, a, b, x, s, t) {
        a = add32(add32(a, q), add32(x, t));
        return add32((a << s) | (a >>> (32 - s)), b);
      }
      function ff(a, b, c, d, x, s, t) { return cmn((b & c) | ((~b) & d), a, b, x, s, t); }
      function gg(a, b, c, d, x, s, t) { return cmn((b & d) | (c & (~d)), a, b, x, s, t); }
      function hh(a, b, c, d, x, s, t) { return cmn(b ^ c ^ d, a, b, x, s, t); }
      function ii(a, b, c, d, x, s, t) { return cmn(c ^ (b | (~d)), a, b, x, s, t); }
      function md5blk(s) {
        const md5blks = [];
        for (let i = 0; i < 64; i += 4) {
          md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24);
        }
        return md5blks;
      }
      function md5blk_array(a) {
        const md5blks = [];
        for (let i = 0; i < 64; i += 4) {
          md5blks[i >> 2] = a[i] + (a[i + 1] << 8) + (a[i + 2] << 16) + (a[i + 3] << 24);
        }
        return md5blks;
      }
      function rhex(n) {
        const hex_chr = '0123456789abcdef';
        let s = '';
        for (let j = 0; j < 4; j++) {
          s += hex_chr.charAt((n >> (j * 8 + 4)) & 0x0F) + hex_chr.charAt((n >> (j * 8)) & 0x0F);
        }
        return s;
      }
      function hex(x) {
        for (let i = 0; i < x.length; i++) x[i] = rhex(x[i]);
        return x.join('');
      }
      function add32(a, b) {
        return (a + b) & 0xFFFFFFFF;
      }

      // Convert string to UTF-8 byte array
      const encoder = new TextEncoder();
      const data = encoder.encode(string);
      const n = data.length;
      const state = [1732584193, -271733879, -1732584194, 271733878];
      let i;

      // Process 64-byte chunks
      const tail = new Uint8Array(64);
      for (i = 64; i <= n; i += 64) {
        const chunk = data.slice(i - 64, i);
        md5cycle(state, md5blk_array(chunk));
      }

      // Handle remaining bytes
      const remaining = data.slice(i - 64);
      tail.fill(0);
      for (let j = 0; j < remaining.length; j++) tail[j] = remaining[j];
      tail[remaining.length] = 0x80;

      if (remaining.length > 55) {
        md5cycle(state, md5blk_array(tail));
        tail.fill(0);
      }

      // Append length in bits as 64-bit little-endian
      const bitLen = n * 8;
      tail[56] = bitLen & 0xFF;
      tail[57] = (bitLen >> 8) & 0xFF;
      tail[58] = (bitLen >> 16) & 0xFF;
      tail[59] = (bitLen >> 24) & 0xFF;
      // For files > 512MB we'd need the high 32 bits, but for typical text input this suffices
      tail[60] = 0;
      tail[61] = 0;
      tail[62] = 0;
      tail[63] = 0;

      md5cycle(state, md5blk_array(tail));
      return hex(state);
    }

    async function computeHash(algorithm, text) {
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      const hashBuffer = await crypto.subtle.digest(algorithm, data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    document.getElementById('enc-hash-generate').addEventListener('click', async () => {
      const input = document.getElementById('enc-hash-input').value;
      if (!input) {
        App.utils.toast('Please enter text to hash');
        return;
      }

      // MD5 (synchronous implementation)
      document.getElementById('enc-hash-md5').textContent = md5(input);

      // SHA hashes via Web Crypto API
      try {
        const [sha1, sha256, sha512] = await Promise.all([
          computeHash('SHA-1', input),
          computeHash('SHA-256', input),
          computeHash('SHA-512', input)
        ]);
        document.getElementById('enc-hash-sha1').textContent = sha1;
        document.getElementById('enc-hash-sha256').textContent = sha256;
        document.getElementById('enc-hash-sha512').textContent = sha512;
      } catch (e) {
        App.utils.toast('Error computing hashes: ' + e.message);
      }
    });
  }
});


// ----------------------------------------
// 3. Regex Tester
// ----------------------------------------
App.registerTool({
  id: 'regex-tester',
  name: 'Regex Tester',
  description: 'Test regular expressions with real-time match highlighting',
  category: 'Developer',
  icon: '\u{1F50D}',

  render() {
    return `
      <div class="tool-section">
        <label class="tool-label">Pattern</label>
        <div class="tool-row" style="align-items:center;gap:8px">
          <span style="font-size:18px;color:var(--text-dim)">/</span>
          <div class="tool-col">
            <input type="text" id="rx-pattern" class="tool-input" placeholder="Enter regex pattern..." spellcheck="false" autocomplete="off">
          </div>
          <span style="font-size:18px;color:var(--text-dim)">/</span>
          <div id="rx-flags" style="display:flex;gap:8px;flex-shrink:0">
            <label style="display:flex;align-items:center;gap:4px;cursor:pointer;font-size:13px;color:var(--text-muted)">
              <input type="checkbox" id="rx-flag-g" checked> g
            </label>
            <label style="display:flex;align-items:center;gap:4px;cursor:pointer;font-size:13px;color:var(--text-muted)">
              <input type="checkbox" id="rx-flag-i"> i
            </label>
            <label style="display:flex;align-items:center;gap:4px;cursor:pointer;font-size:13px;color:var(--text-muted)">
              <input type="checkbox" id="rx-flag-m"> m
            </label>
            <label style="display:flex;align-items:center;gap:4px;cursor:pointer;font-size:13px;color:var(--text-muted)">
              <input type="checkbox" id="rx-flag-s"> s
            </label>
          </div>
        </div>
        <div id="rx-error" style="color:var(--danger);font-size:12px;margin-top:4px;min-height:18px"></div>
      </div>

      <div class="tool-section">
        <label class="tool-label">Quick Patterns</label>
        <div class="tool-btn-group" id="rx-quick-btns" style="flex-wrap:wrap">
          <button class="tool-btn tool-btn-sm" data-pattern="[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}">Email</button>
          <button class="tool-btn tool-btn-sm" data-pattern="https?:\\/\\/[^\\s/$.?#].[^\\s]*">URL</button>
          <button class="tool-btn tool-btn-sm" data-pattern="\\+?\\d{1,4}[\\s\\-]?\\(?\\d{1,3}\\)?[\\s\\-]?\\d{1,4}[\\s\\-]?\\d{1,4}[\\s\\-]?\\d{0,4}">Phone</button>
          <button class="tool-btn tool-btn-sm" data-pattern="(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)">IP Address</button>
          <button class="tool-btn tool-btn-sm" data-pattern="\\d{4}[\\-\\/]\\d{1,2}[\\-\\/]\\d{1,2}">Date (YYYY-MM-DD)</button>
        </div>
      </div>

      <div class="tool-section">
        <label class="tool-label">Test String</label>
        <textarea id="rx-input" class="tool-textarea" rows="6" placeholder="Enter text to test against..." spellcheck="false"></textarea>
      </div>

      <div class="tool-section">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <label class="tool-label">Match Highlighting</label>
          <span id="rx-match-count" class="badge" style="font-size:12px">0 matches</span>
        </div>
        <div id="rx-highlight" class="tool-output" style="min-height:80px;white-space:pre-wrap;word-break:break-word;line-height:1.8"></div>
      </div>

      <div class="tool-section">
        <div class="tool-section-title">Match Details</div>
        <div id="rx-details" style="font-size:13px;color:var(--text-muted)">No matches</div>
      </div>
    `;
  },

  init() {
    const patternInput = document.getElementById('rx-pattern');
    const testInput = document.getElementById('rx-input');
    const errorEl = document.getElementById('rx-error');
    const highlightEl = document.getElementById('rx-highlight');
    const countEl = document.getElementById('rx-match-count');
    const detailsEl = document.getElementById('rx-details');
    const flagG = document.getElementById('rx-flag-g');
    const flagI = document.getElementById('rx-flag-i');
    const flagM = document.getElementById('rx-flag-m');
    const flagS = document.getElementById('rx-flag-s');

    const matchColors = [
      'rgba(255,200,50,0.35)',
      'rgba(100,200,255,0.35)',
      'rgba(255,100,150,0.35)',
      'rgba(100,255,150,0.35)',
      'rgba(200,150,255,0.35)'
    ];

    function getFlags() {
      let f = '';
      if (flagG.checked) f += 'g';
      if (flagI.checked) f += 'i';
      if (flagM.checked) f += 'm';
      if (flagS.checked) f += 's';
      return f;
    }

    function update() {
      const pattern = patternInput.value;
      const text = testInput.value;
      errorEl.textContent = '';

      if (!pattern || !text) {
        highlightEl.innerHTML = App.utils.escapeHtml(text || '');
        countEl.textContent = '0 matches';
        countEl.className = 'badge';
        detailsEl.innerHTML = 'No matches';
        return;
      }

      let regex;
      try {
        regex = new RegExp(pattern, getFlags());
      } catch (e) {
        errorEl.textContent = e.message;
        highlightEl.innerHTML = App.utils.escapeHtml(text);
        countEl.textContent = 'Error';
        countEl.className = 'badge badge-fail';
        detailsEl.innerHTML = 'Invalid regex';
        return;
      }

      // Collect all matches
      const matches = [];
      if (regex.global) {
        let match;
        // Safety limit to prevent infinite loops with zero-length matches
        let safety = 0;
        while ((match = regex.exec(text)) !== null && safety < 10000) {
          matches.push({ index: match.index, value: match[0], groups: match.slice(1), fullMatch: match });
          if (match[0].length === 0) {
            regex.lastIndex++;
          }
          safety++;
        }
      } else {
        const match = regex.exec(text);
        if (match) {
          matches.push({ index: match.index, value: match[0], groups: match.slice(1), fullMatch: match });
        }
      }

      // Update count
      countEl.textContent = matches.length + ' match' + (matches.length !== 1 ? 'es' : '');
      countEl.className = matches.length > 0 ? 'badge badge-pass' : 'badge';

      // Highlight matches in the text
      if (matches.length === 0) {
        highlightEl.innerHTML = App.utils.escapeHtml(text);
        detailsEl.innerHTML = 'No matches';
        return;
      }

      let highlighted = '';
      let lastIndex = 0;
      matches.forEach((m, i) => {
        const colorIdx = i % matchColors.length;
        // Add text before the match
        highlighted += App.utils.escapeHtml(text.slice(lastIndex, m.index));
        // Add the match with highlighting
        highlighted += '<span style="background:' + matchColors[colorIdx] + ';border-radius:2px;padding:1px 0">' + App.utils.escapeHtml(m.value) + '</span>';
        lastIndex = m.index + m.value.length;
      });
      highlighted += App.utils.escapeHtml(text.slice(lastIndex));
      highlightEl.innerHTML = highlighted;

      // Match details
      let detailsHtml = '<div style="overflow-x:auto"><table class="tool-table"><thead><tr><th>#</th><th>Match</th><th>Index</th><th>Length</th><th>Groups</th></tr></thead><tbody>';
      matches.forEach((m, i) => {
        const groupsStr = m.groups.length > 0
          ? m.groups.map((g, gi) => '<span style="color:var(--primary)">$' + (gi + 1) + ':</span> ' + App.utils.escapeHtml(g || '(empty)')).join(', ')
          : '<span style="color:var(--text-dim)">none</span>';
        detailsHtml += '<tr><td>' + (i + 1) + '</td><td style="font-family:var(--font-mono);word-break:break-all">' + App.utils.escapeHtml(m.value) + '</td><td>' + m.index + '</td><td>' + m.value.length + '</td><td>' + groupsStr + '</td></tr>';
      });
      detailsHtml += '</tbody></table></div>';
      detailsEl.innerHTML = detailsHtml;
    }

    const debouncedUpdate = App.utils.debounce(update, 100);

    patternInput.addEventListener('input', debouncedUpdate);
    testInput.addEventListener('input', debouncedUpdate);
    flagG.addEventListener('change', update);
    flagI.addEventListener('change', update);
    flagM.addEventListener('change', update);
    flagS.addEventListener('change', update);

    // Quick pattern buttons
    document.getElementById('rx-quick-btns').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-pattern]');
      if (btn) {
        patternInput.value = btn.dataset.pattern;
        update();
      }
    });
  }
});


// ----------------------------------------
// 4. Meta Tag Generator
// ----------------------------------------
App.registerTool({
  id: 'meta-tag-gen',
  name: 'Meta Tag Generator',
  description: 'Generate SEO-optimized meta tags for your web pages',
  category: 'Developer',
  icon: '\u{1F3F7}\u{FE0F}',

  render() {
    return `
      <div class="tool-row" style="align-items:flex-start">
        <div class="tool-col" style="min-width:0">
          <div class="tool-section">
            <div class="tool-section-title">Basic Meta Tags</div>
            <div style="display:flex;flex-direction:column;gap:12px">
              <div>
                <label class="tool-label">Title</label>
                <input type="text" id="meta-title" class="tool-input" placeholder="Page Title" maxlength="70">
                <div style="font-size:11px;color:var(--text-dim);margin-top:2px"><span id="meta-title-count">0</span>/70 characters</div>
              </div>
              <div>
                <label class="tool-label">Description</label>
                <textarea id="meta-desc" class="tool-textarea" rows="3" placeholder="Page description..." maxlength="320"></textarea>
                <div style="font-size:11px;margin-top:2px"><span id="meta-desc-count" style="color:var(--text-dim)">0</span><span style="color:var(--text-dim)">/320 characters (recommended: 150-160)</span></div>
              </div>
              <div>
                <label class="tool-label">Keywords</label>
                <input type="text" id="meta-keywords" class="tool-input" placeholder="keyword1, keyword2, keyword3">
              </div>
              <div>
                <label class="tool-label">Author</label>
                <input type="text" id="meta-author" class="tool-input" placeholder="Author Name">
              </div>
              <div>
                <label class="tool-label">Viewport</label>
                <input type="text" id="meta-viewport" class="tool-input" value="width=device-width, initial-scale=1.0">
              </div>
              <div class="tool-row">
                <div class="tool-col">
                  <label class="tool-label">Robots - Indexing</label>
                  <select id="meta-robots-index" class="tool-select">
                    <option value="index">index</option>
                    <option value="noindex">noindex</option>
                  </select>
                </div>
                <div class="tool-col">
                  <label class="tool-label">Robots - Following</label>
                  <select id="meta-robots-follow" class="tool-select">
                    <option value="follow">follow</option>
                    <option value="nofollow">nofollow</option>
                  </select>
                </div>
              </div>
              <div>
                <label class="tool-label">Canonical URL</label>
                <input type="text" id="meta-canonical" class="tool-input" placeholder="https://example.com/page">
              </div>
            </div>
          </div>

          <div class="tool-section">
            <div class="tool-section-title">Open Graph (Facebook/LinkedIn)</div>
            <div style="display:flex;flex-direction:column;gap:12px">
              <div>
                <label class="tool-label">OG Title</label>
                <input type="text" id="meta-og-title" class="tool-input" placeholder="Open Graph Title (defaults to Title)">
              </div>
              <div>
                <label class="tool-label">OG Description</label>
                <textarea id="meta-og-desc" class="tool-textarea" rows="2" placeholder="OG description (defaults to Description)"></textarea>
              </div>
              <div>
                <label class="tool-label">OG Image URL</label>
                <input type="text" id="meta-og-image" class="tool-input" placeholder="https://example.com/image.jpg">
              </div>
              <div>
                <label class="tool-label">OG Type</label>
                <select id="meta-og-type" class="tool-select">
                  <option value="website">website</option>
                  <option value="article">article</option>
                  <option value="product">product</option>
                  <option value="profile">profile</option>
                  <option value="book">book</option>
                  <option value="video.movie">video.movie</option>
                  <option value="music.song">music.song</option>
                </select>
              </div>
            </div>
          </div>

          <div class="tool-section">
            <div class="tool-section-title">Twitter Card</div>
            <div style="display:flex;flex-direction:column;gap:12px">
              <div>
                <label class="tool-label">Card Type</label>
                <select id="meta-tw-card" class="tool-select">
                  <option value="summary">summary</option>
                  <option value="summary_large_image">summary_large_image</option>
                </select>
              </div>
              <div>
                <label class="tool-label">Twitter Site Handle</label>
                <input type="text" id="meta-tw-site" class="tool-input" placeholder="@username">
              </div>
            </div>
          </div>

          <div class="tool-section">
            <div class="tool-section-title">Additional</div>
            <div style="display:flex;flex-direction:column;gap:12px">
              <div>
                <label class="tool-label">Theme Color</label>
                <div style="display:flex;align-items:center;gap:8px">
                  <input type="color" id="meta-theme-color" value="#ffffff" style="width:40px;height:32px;border:none;background:none;cursor:pointer">
                  <input type="text" id="meta-theme-color-text" class="tool-input" value="#ffffff" style="max-width:120px">
                </div>
              </div>
              <div>
                <label class="tool-label">Favicon URL</label>
                <input type="text" id="meta-favicon" class="tool-input" placeholder="https://example.com/favicon.ico">
              </div>
            </div>
          </div>
        </div>

        <div class="tool-col" style="min-width:0">
          <div class="tool-section" style="position:sticky;top:16px">
            <div class="tool-section-title">Google Search Preview</div>
            <div id="meta-preview" style="background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-sm);padding:16px;margin-bottom:16px">
              <div id="meta-preview-title" style="font-size:18px;color:#1a0dab;font-family:Arial,sans-serif;cursor:pointer;line-height:1.3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">Page Title</div>
              <div id="meta-preview-url" style="font-size:13px;color:#006621;font-family:Arial,sans-serif;margin-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">https://example.com</div>
              <div id="meta-preview-desc" style="font-size:13px;color:#545454;font-family:Arial,sans-serif;margin-top:4px;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">Page description will appear here. Keep it between 150-160 characters for optimal display in search results.</div>
            </div>

            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
              <div class="tool-section-title" style="margin-bottom:0">Generated HTML</div>
              <button class="tool-btn tool-btn-primary tool-btn-sm" id="meta-copy-all">Copy All</button>
            </div>
            <div class="tool-output" id="meta-output" style="max-height:500px;overflow-y:auto;white-space:pre-wrap;word-break:break-all;font-size:12px"></div>
          </div>
        </div>
      </div>
    `;
  },

  init() {
    const fields = {
      title: document.getElementById('meta-title'),
      desc: document.getElementById('meta-desc'),
      keywords: document.getElementById('meta-keywords'),
      author: document.getElementById('meta-author'),
      viewport: document.getElementById('meta-viewport'),
      robotsIndex: document.getElementById('meta-robots-index'),
      robotsFollow: document.getElementById('meta-robots-follow'),
      canonical: document.getElementById('meta-canonical'),
      ogTitle: document.getElementById('meta-og-title'),
      ogDesc: document.getElementById('meta-og-desc'),
      ogImage: document.getElementById('meta-og-image'),
      ogType: document.getElementById('meta-og-type'),
      twCard: document.getElementById('meta-tw-card'),
      twSite: document.getElementById('meta-tw-site'),
      themeColor: document.getElementById('meta-theme-color'),
      themeColorText: document.getElementById('meta-theme-color-text'),
      favicon: document.getElementById('meta-favicon')
    };

    const titleCount = document.getElementById('meta-title-count');
    const descCount = document.getElementById('meta-desc-count');
    const previewTitle = document.getElementById('meta-preview-title');
    const previewUrl = document.getElementById('meta-preview-url');
    const previewDesc = document.getElementById('meta-preview-desc');
    const output = document.getElementById('meta-output');

    function escAttr(str) {
      return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function generate() {
      const title = fields.title.value;
      const desc = fields.desc.value;
      const keywords = fields.keywords.value;
      const author = fields.author.value;
      const viewport = fields.viewport.value;
      const robots = fields.robotsIndex.value + ', ' + fields.robotsFollow.value;
      const canonical = fields.canonical.value;
      const ogTitle = fields.ogTitle.value || title;
      const ogDesc = fields.ogDesc.value || desc;
      const ogImage = fields.ogImage.value;
      const ogType = fields.ogType.value;
      const twCard = fields.twCard.value;
      const twSite = fields.twSite.value;
      const themeColor = fields.themeColorText.value;
      const favicon = fields.favicon.value;

      // Update character counts
      titleCount.textContent = title.length;
      descCount.textContent = desc.length;
      descCount.style.color = (desc.length >= 150 && desc.length <= 160) ? 'var(--success)' : (desc.length > 160) ? 'var(--warning)' : 'var(--text-dim)';

      // Update preview
      previewTitle.textContent = title || 'Page Title';
      previewUrl.textContent = canonical || 'https://example.com';
      previewDesc.textContent = desc || 'Page description will appear here.';

      // Generate HTML
      let html = '<meta charset="UTF-8">\n';
      if (viewport) html += '<meta name="viewport" content="' + escAttr(viewport) + '">\n';
      if (title) html += '<title>' + App.utils.escapeHtml(title) + '</title>\n';
      if (desc) html += '<meta name="description" content="' + escAttr(desc) + '">\n';
      if (keywords) html += '<meta name="keywords" content="' + escAttr(keywords) + '">\n';
      if (author) html += '<meta name="author" content="' + escAttr(author) + '">\n';
      html += '<meta name="robots" content="' + escAttr(robots) + '">\n';
      if (canonical) html += '<link rel="canonical" href="' + escAttr(canonical) + '">\n';
      html += '\n<!-- Open Graph / Facebook -->\n';
      html += '<meta property="og:type" content="' + escAttr(ogType) + '">\n';
      if (ogTitle) html += '<meta property="og:title" content="' + escAttr(ogTitle) + '">\n';
      if (ogDesc) html += '<meta property="og:description" content="' + escAttr(ogDesc) + '">\n';
      if (ogImage) html += '<meta property="og:image" content="' + escAttr(ogImage) + '">\n';
      if (canonical) html += '<meta property="og:url" content="' + escAttr(canonical) + '">\n';
      html += '\n<!-- Twitter -->\n';
      html += '<meta name="twitter:card" content="' + escAttr(twCard) + '">\n';
      if (twSite) html += '<meta name="twitter:site" content="' + escAttr(twSite) + '">\n';
      if (ogTitle) html += '<meta name="twitter:title" content="' + escAttr(ogTitle) + '">\n';
      if (ogDesc) html += '<meta name="twitter:description" content="' + escAttr(ogDesc) + '">\n';
      if (ogImage) html += '<meta name="twitter:image" content="' + escAttr(ogImage) + '">\n';
      if (themeColor) html += '\n<meta name="theme-color" content="' + escAttr(themeColor) + '">\n';
      if (favicon) html += '<link rel="icon" href="' + escAttr(favicon) + '">\n';

      output.textContent = html;
    }

    // Sync color picker and text input
    fields.themeColor.addEventListener('input', () => {
      fields.themeColorText.value = fields.themeColor.value;
      generate();
    });
    fields.themeColorText.addEventListener('input', () => {
      if (/^#[0-9a-fA-F]{6}$/.test(fields.themeColorText.value)) {
        fields.themeColor.value = fields.themeColorText.value;
      }
      generate();
    });

    // Listen on all fields
    const allInputs = document.querySelectorAll('#meta-title, #meta-desc, #meta-keywords, #meta-author, #meta-viewport, #meta-canonical, #meta-og-title, #meta-og-desc, #meta-og-image, #meta-tw-site, #meta-favicon');
    allInputs.forEach(el => el.addEventListener('input', generate));

    const allSelects = document.querySelectorAll('#meta-robots-index, #meta-robots-follow, #meta-og-type, #meta-tw-card');
    allSelects.forEach(el => el.addEventListener('change', generate));

    // Copy all
    document.getElementById('meta-copy-all').addEventListener('click', () => {
      App.utils.copyToClipboard(output.textContent);
    });

    generate();
  }
});


// ----------------------------------------
// 5. Tailwind Cheat Sheet
// ----------------------------------------
App.registerTool({
  id: 'tailwind-cheatsheet',
  name: 'Tailwind Cheat Sheet',
  description: 'Searchable reference for common Tailwind CSS utilities',
  category: 'Developer',
  icon: '\u{1F3A8}',

  render() {
    return `
      <div class="tool-section">
        <label class="tool-label">Search Tailwind Classes</label>
        <input type="text" id="tw-search" class="tool-input" placeholder="Search classes... e.g. flex, p-4, text-lg" spellcheck="false" autocomplete="off">
      </div>
      <div id="tw-sections"></div>
    `;
  },

  init() {
    const searchInput = document.getElementById('tw-search');
    const sectionsContainer = document.getElementById('tw-sections');

    const data = {
      'Spacing': [
        ...([0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 96].flatMap(v => {
          const px = v * 4;
          const label = v === 0.5 ? '0.5' : v === 1.5 ? '1.5' : v === 2.5 ? '2.5' : v === 3.5 ? '3.5' : String(v);
          return [
            { cls: 'p-' + label, val: 'padding: ' + px + 'px' },
            { cls: 'm-' + label, val: 'margin: ' + px + 'px' },
            { cls: 'gap-' + label, val: 'gap: ' + px + 'px' }
          ];
        })),
        { cls: 'p-px', val: 'padding: 1px' },
        { cls: 'm-px', val: 'margin: 1px' },
        { cls: 'm-auto', val: 'margin: auto' },
        { cls: 'mx-auto', val: 'margin-left: auto; margin-right: auto' },
        { cls: 'my-auto', val: 'margin-top: auto; margin-bottom: auto' },
        { cls: 'px-0', val: 'padding-left: 0; padding-right: 0' },
        { cls: 'py-0', val: 'padding-top: 0; padding-bottom: 0' }
      ],
      'Sizing': [
        ...[0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64, 72, 80, 96].flatMap(v => [
          { cls: 'w-' + v, val: 'width: ' + (v * 4) + 'px' },
          { cls: 'h-' + v, val: 'height: ' + (v * 4) + 'px' }
        ]),
        { cls: 'w-auto', val: 'width: auto' },
        { cls: 'w-full', val: 'width: 100%' },
        { cls: 'w-screen', val: 'width: 100vw' },
        { cls: 'w-min', val: 'width: min-content' },
        { cls: 'w-max', val: 'width: max-content' },
        { cls: 'w-fit', val: 'width: fit-content' },
        { cls: 'w-1/2', val: 'width: 50%' },
        { cls: 'w-1/3', val: 'width: 33.333%' },
        { cls: 'w-2/3', val: 'width: 66.667%' },
        { cls: 'w-1/4', val: 'width: 25%' },
        { cls: 'w-3/4', val: 'width: 75%' },
        { cls: 'h-auto', val: 'height: auto' },
        { cls: 'h-full', val: 'height: 100%' },
        { cls: 'h-screen', val: 'height: 100vh' },
        { cls: 'h-min', val: 'height: min-content' },
        { cls: 'h-max', val: 'height: max-content' },
        { cls: 'h-fit', val: 'height: fit-content' },
        { cls: 'min-w-0', val: 'min-width: 0px' },
        { cls: 'min-w-full', val: 'min-width: 100%' },
        { cls: 'min-w-min', val: 'min-width: min-content' },
        { cls: 'min-w-max', val: 'min-width: max-content' },
        { cls: 'max-w-none', val: 'max-width: none' },
        { cls: 'max-w-xs', val: 'max-width: 320px' },
        { cls: 'max-w-sm', val: 'max-width: 384px' },
        { cls: 'max-w-md', val: 'max-width: 448px' },
        { cls: 'max-w-lg', val: 'max-width: 512px' },
        { cls: 'max-w-xl', val: 'max-width: 576px' },
        { cls: 'max-w-2xl', val: 'max-width: 672px' },
        { cls: 'max-w-3xl', val: 'max-width: 768px' },
        { cls: 'max-w-4xl', val: 'max-width: 896px' },
        { cls: 'max-w-5xl', val: 'max-width: 1024px' },
        { cls: 'max-w-6xl', val: 'max-width: 1152px' },
        { cls: 'max-w-7xl', val: 'max-width: 1280px' },
        { cls: 'max-w-full', val: 'max-width: 100%' },
        { cls: 'max-w-screen-sm', val: 'max-width: 640px' },
        { cls: 'max-w-screen-md', val: 'max-width: 768px' },
        { cls: 'max-w-screen-lg', val: 'max-width: 1024px' },
        { cls: 'max-w-screen-xl', val: 'max-width: 1280px' },
        { cls: 'max-w-screen-2xl', val: 'max-width: 1536px' },
        { cls: 'min-h-0', val: 'min-height: 0px' },
        { cls: 'min-h-full', val: 'min-height: 100%' },
        { cls: 'min-h-screen', val: 'min-height: 100vh' },
        { cls: 'max-h-full', val: 'max-height: 100%' },
        { cls: 'max-h-screen', val: 'max-height: 100vh' }
      ],
      'Typography': [
        { cls: 'text-xs', val: 'font-size: 0.75rem (12px); line-height: 1rem (16px)' },
        { cls: 'text-sm', val: 'font-size: 0.875rem (14px); line-height: 1.25rem (20px)' },
        { cls: 'text-base', val: 'font-size: 1rem (16px); line-height: 1.5rem (24px)' },
        { cls: 'text-lg', val: 'font-size: 1.125rem (18px); line-height: 1.75rem (28px)' },
        { cls: 'text-xl', val: 'font-size: 1.25rem (20px); line-height: 1.75rem (28px)' },
        { cls: 'text-2xl', val: 'font-size: 1.5rem (24px); line-height: 2rem (32px)' },
        { cls: 'text-3xl', val: 'font-size: 1.875rem (30px); line-height: 2.25rem (36px)' },
        { cls: 'text-4xl', val: 'font-size: 2.25rem (36px); line-height: 2.5rem (40px)' },
        { cls: 'text-5xl', val: 'font-size: 3rem (48px); line-height: 1' },
        { cls: 'text-6xl', val: 'font-size: 3.75rem (60px); line-height: 1' },
        { cls: 'text-7xl', val: 'font-size: 4.5rem (72px); line-height: 1' },
        { cls: 'text-8xl', val: 'font-size: 6rem (96px); line-height: 1' },
        { cls: 'text-9xl', val: 'font-size: 8rem (128px); line-height: 1' },
        { cls: 'font-thin', val: 'font-weight: 100' },
        { cls: 'font-extralight', val: 'font-weight: 200' },
        { cls: 'font-light', val: 'font-weight: 300' },
        { cls: 'font-normal', val: 'font-weight: 400' },
        { cls: 'font-medium', val: 'font-weight: 500' },
        { cls: 'font-semibold', val: 'font-weight: 600' },
        { cls: 'font-bold', val: 'font-weight: 700' },
        { cls: 'font-extrabold', val: 'font-weight: 800' },
        { cls: 'font-black', val: 'font-weight: 900' },
        { cls: 'leading-none', val: 'line-height: 1' },
        { cls: 'leading-tight', val: 'line-height: 1.25' },
        { cls: 'leading-snug', val: 'line-height: 1.375' },
        { cls: 'leading-normal', val: 'line-height: 1.5' },
        { cls: 'leading-relaxed', val: 'line-height: 1.625' },
        { cls: 'leading-loose', val: 'line-height: 2' },
        { cls: 'tracking-tighter', val: 'letter-spacing: -0.05em' },
        { cls: 'tracking-tight', val: 'letter-spacing: -0.025em' },
        { cls: 'tracking-normal', val: 'letter-spacing: 0em' },
        { cls: 'tracking-wide', val: 'letter-spacing: 0.025em' },
        { cls: 'tracking-wider', val: 'letter-spacing: 0.05em' },
        { cls: 'tracking-widest', val: 'letter-spacing: 0.1em' },
        { cls: 'text-left', val: 'text-align: left' },
        { cls: 'text-center', val: 'text-align: center' },
        { cls: 'text-right', val: 'text-align: right' },
        { cls: 'text-justify', val: 'text-align: justify' },
        { cls: 'uppercase', val: 'text-transform: uppercase' },
        { cls: 'lowercase', val: 'text-transform: lowercase' },
        { cls: 'capitalize', val: 'text-transform: capitalize' },
        { cls: 'normal-case', val: 'text-transform: none' },
        { cls: 'underline', val: 'text-decoration: underline' },
        { cls: 'line-through', val: 'text-decoration: line-through' },
        { cls: 'no-underline', val: 'text-decoration: none' },
        { cls: 'truncate', val: 'overflow: hidden; text-overflow: ellipsis; white-space: nowrap' },
        { cls: 'break-words', val: 'overflow-wrap: break-word' },
        { cls: 'break-all', val: 'word-break: break-all' }
      ],
      'Colors': [
        ...['slate', 'gray', 'zinc', 'neutral', 'stone', 'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose'].flatMap(color => [
          { cls: 'text-' + color + '-500', val: 'color: ' + color + '-500' },
          { cls: 'bg-' + color + '-500', val: 'background-color: ' + color + '-500' },
          { cls: 'border-' + color + '-500', val: 'border-color: ' + color + '-500' }
        ]),
        { cls: 'text-white', val: 'color: #fff' },
        { cls: 'text-black', val: 'color: #000' },
        { cls: 'text-transparent', val: 'color: transparent' },
        { cls: 'bg-white', val: 'background-color: #fff' },
        { cls: 'bg-black', val: 'background-color: #000' },
        { cls: 'bg-transparent', val: 'background-color: transparent' }
      ],
      'Flexbox': [
        { cls: 'flex', val: 'display: flex' },
        { cls: 'inline-flex', val: 'display: inline-flex' },
        { cls: 'flex-row', val: 'flex-direction: row' },
        { cls: 'flex-row-reverse', val: 'flex-direction: row-reverse' },
        { cls: 'flex-col', val: 'flex-direction: column' },
        { cls: 'flex-col-reverse', val: 'flex-direction: column-reverse' },
        { cls: 'flex-wrap', val: 'flex-wrap: wrap' },
        { cls: 'flex-wrap-reverse', val: 'flex-wrap: wrap-reverse' },
        { cls: 'flex-nowrap', val: 'flex-wrap: nowrap' },
        { cls: 'flex-1', val: 'flex: 1 1 0%' },
        { cls: 'flex-auto', val: 'flex: 1 1 auto' },
        { cls: 'flex-initial', val: 'flex: 0 1 auto' },
        { cls: 'flex-none', val: 'flex: none' },
        { cls: 'flex-grow', val: 'flex-grow: 1' },
        { cls: 'flex-grow-0', val: 'flex-grow: 0' },
        { cls: 'flex-shrink', val: 'flex-shrink: 1' },
        { cls: 'flex-shrink-0', val: 'flex-shrink: 0' },
        { cls: 'items-start', val: 'align-items: flex-start' },
        { cls: 'items-end', val: 'align-items: flex-end' },
        { cls: 'items-center', val: 'align-items: center' },
        { cls: 'items-baseline', val: 'align-items: baseline' },
        { cls: 'items-stretch', val: 'align-items: stretch' },
        { cls: 'justify-start', val: 'justify-content: flex-start' },
        { cls: 'justify-end', val: 'justify-content: flex-end' },
        { cls: 'justify-center', val: 'justify-content: center' },
        { cls: 'justify-between', val: 'justify-content: space-between' },
        { cls: 'justify-around', val: 'justify-content: space-around' },
        { cls: 'justify-evenly', val: 'justify-content: space-evenly' },
        { cls: 'self-auto', val: 'align-self: auto' },
        { cls: 'self-start', val: 'align-self: flex-start' },
        { cls: 'self-end', val: 'align-self: flex-end' },
        { cls: 'self-center', val: 'align-self: center' },
        { cls: 'self-stretch', val: 'align-self: stretch' },
        { cls: 'order-first', val: 'order: -9999' },
        { cls: 'order-last', val: 'order: 9999' },
        { cls: 'order-none', val: 'order: 0' }
      ],
      'Grid': [
        ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => ({ cls: 'grid-cols-' + n, val: 'grid-template-columns: repeat(' + n + ', minmax(0, 1fr))' })),
        { cls: 'grid-cols-none', val: 'grid-template-columns: none' },
        ...[1, 2, 3, 4, 5, 6].map(n => ({ cls: 'grid-rows-' + n, val: 'grid-template-rows: repeat(' + n + ', minmax(0, 1fr))' })),
        { cls: 'grid-rows-none', val: 'grid-template-rows: none' },
        ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => ({ cls: 'col-span-' + n, val: 'grid-column: span ' + n + ' / span ' + n })),
        { cls: 'col-span-full', val: 'grid-column: 1 / -1' },
        ...[1, 2, 3, 4, 5, 6].map(n => ({ cls: 'row-span-' + n, val: 'grid-row: span ' + n + ' / span ' + n })),
        { cls: 'row-span-full', val: 'grid-row: 1 / -1' },
        ...[0, 1, 2, 3, 4, 5, 6, 8, 10, 12].map(v => ({ cls: 'gap-' + v, val: 'gap: ' + (v * 4) + 'px' })),
        { cls: 'gap-px', val: 'gap: 1px' }
      ],
      'Borders': [
        { cls: 'border', val: 'border-width: 1px' },
        { cls: 'border-0', val: 'border-width: 0px' },
        { cls: 'border-2', val: 'border-width: 2px' },
        { cls: 'border-4', val: 'border-width: 4px' },
        { cls: 'border-8', val: 'border-width: 8px' },
        { cls: 'border-t', val: 'border-top-width: 1px' },
        { cls: 'border-r', val: 'border-right-width: 1px' },
        { cls: 'border-b', val: 'border-bottom-width: 1px' },
        { cls: 'border-l', val: 'border-left-width: 1px' },
        { cls: 'border-solid', val: 'border-style: solid' },
        { cls: 'border-dashed', val: 'border-style: dashed' },
        { cls: 'border-dotted', val: 'border-style: dotted' },
        { cls: 'border-double', val: 'border-style: double' },
        { cls: 'border-none', val: 'border-style: none' },
        { cls: 'rounded-none', val: 'border-radius: 0px' },
        { cls: 'rounded-sm', val: 'border-radius: 0.125rem (2px)' },
        { cls: 'rounded', val: 'border-radius: 0.25rem (4px)' },
        { cls: 'rounded-md', val: 'border-radius: 0.375rem (6px)' },
        { cls: 'rounded-lg', val: 'border-radius: 0.5rem (8px)' },
        { cls: 'rounded-xl', val: 'border-radius: 0.75rem (12px)' },
        { cls: 'rounded-2xl', val: 'border-radius: 1rem (16px)' },
        { cls: 'rounded-3xl', val: 'border-radius: 1.5rem (24px)' },
        { cls: 'rounded-full', val: 'border-radius: 9999px' },
        { cls: 'divide-x', val: 'border-left-width between children: 1px' },
        { cls: 'divide-y', val: 'border-top-width between children: 1px' }
      ],
      'Effects': [
        { cls: 'shadow-sm', val: 'box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05)' },
        { cls: 'shadow', val: 'box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)' },
        { cls: 'shadow-md', val: 'box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' },
        { cls: 'shadow-lg', val: 'box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' },
        { cls: 'shadow-xl', val: 'box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' },
        { cls: 'shadow-2xl', val: 'box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25)' },
        { cls: 'shadow-inner', val: 'box-shadow: inset 0 2px 4px 0 rgb(0 0 0 / 0.05)' },
        { cls: 'shadow-none', val: 'box-shadow: 0 0 #0000' },
        { cls: 'opacity-0', val: 'opacity: 0' },
        { cls: 'opacity-5', val: 'opacity: 0.05' },
        { cls: 'opacity-10', val: 'opacity: 0.1' },
        { cls: 'opacity-20', val: 'opacity: 0.2' },
        { cls: 'opacity-25', val: 'opacity: 0.25' },
        { cls: 'opacity-30', val: 'opacity: 0.3' },
        { cls: 'opacity-40', val: 'opacity: 0.4' },
        { cls: 'opacity-50', val: 'opacity: 0.5' },
        { cls: 'opacity-60', val: 'opacity: 0.6' },
        { cls: 'opacity-70', val: 'opacity: 0.7' },
        { cls: 'opacity-75', val: 'opacity: 0.75' },
        { cls: 'opacity-80', val: 'opacity: 0.8' },
        { cls: 'opacity-90', val: 'opacity: 0.9' },
        { cls: 'opacity-95', val: 'opacity: 0.95' },
        { cls: 'opacity-100', val: 'opacity: 1' },
        { cls: 'blur-none', val: 'filter: blur(0)' },
        { cls: 'blur-sm', val: 'filter: blur(4px)' },
        { cls: 'blur', val: 'filter: blur(8px)' },
        { cls: 'blur-md', val: 'filter: blur(12px)' },
        { cls: 'blur-lg', val: 'filter: blur(16px)' },
        { cls: 'blur-xl', val: 'filter: blur(24px)' },
        { cls: 'blur-2xl', val: 'filter: blur(40px)' },
        { cls: 'blur-3xl', val: 'filter: blur(64px)' }
      ],
      'Layout': [
        { cls: 'container', val: 'width: 100%; max-width based on breakpoint' },
        { cls: 'block', val: 'display: block' },
        { cls: 'inline-block', val: 'display: inline-block' },
        { cls: 'inline', val: 'display: inline' },
        { cls: 'flex', val: 'display: flex' },
        { cls: 'inline-flex', val: 'display: inline-flex' },
        { cls: 'grid', val: 'display: grid' },
        { cls: 'inline-grid', val: 'display: inline-grid' },
        { cls: 'table', val: 'display: table' },
        { cls: 'hidden', val: 'display: none' },
        { cls: 'overflow-auto', val: 'overflow: auto' },
        { cls: 'overflow-hidden', val: 'overflow: hidden' },
        { cls: 'overflow-visible', val: 'overflow: visible' },
        { cls: 'overflow-scroll', val: 'overflow: scroll' },
        { cls: 'overflow-x-auto', val: 'overflow-x: auto' },
        { cls: 'overflow-y-auto', val: 'overflow-y: auto' },
        { cls: 'overflow-x-hidden', val: 'overflow-x: hidden' },
        { cls: 'overflow-y-hidden', val: 'overflow-y: hidden' },
        { cls: 'visible', val: 'visibility: visible' },
        { cls: 'invisible', val: 'visibility: hidden' },
        { cls: 'z-0', val: 'z-index: 0' },
        { cls: 'z-10', val: 'z-index: 10' },
        { cls: 'z-20', val: 'z-index: 20' },
        { cls: 'z-30', val: 'z-index: 30' },
        { cls: 'z-40', val: 'z-index: 40' },
        { cls: 'z-50', val: 'z-index: 50' },
        { cls: 'z-auto', val: 'z-index: auto' }
      ],
      'Position': [
        { cls: 'static', val: 'position: static' },
        { cls: 'fixed', val: 'position: fixed' },
        { cls: 'absolute', val: 'position: absolute' },
        { cls: 'relative', val: 'position: relative' },
        { cls: 'sticky', val: 'position: sticky' },
        { cls: 'inset-0', val: 'top: 0; right: 0; bottom: 0; left: 0' },
        { cls: 'inset-auto', val: 'top: auto; right: auto; bottom: auto; left: auto' },
        ...[0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24].flatMap(v => [
          { cls: 'top-' + v, val: 'top: ' + (v * 4) + 'px' },
          { cls: 'right-' + v, val: 'right: ' + (v * 4) + 'px' },
          { cls: 'bottom-' + v, val: 'bottom: ' + (v * 4) + 'px' },
          { cls: 'left-' + v, val: 'left: ' + (v * 4) + 'px' }
        ]),
        { cls: 'top-auto', val: 'top: auto' },
        { cls: 'right-auto', val: 'right: auto' },
        { cls: 'bottom-auto', val: 'bottom: auto' },
        { cls: 'left-auto', val: 'left: auto' },
        { cls: 'top-1/2', val: 'top: 50%' },
        { cls: 'left-1/2', val: 'left: 50%' },
        { cls: 'top-full', val: 'top: 100%' },
        { cls: 'right-full', val: 'right: 100%' },
        { cls: 'bottom-full', val: 'bottom: 100%' },
        { cls: 'left-full', val: 'left: 100%' }
      ]
    };

    // Track which sections are collapsed
    const collapsed = {};

    function renderSections(query) {
      const q = (query || '').toLowerCase().trim();
      let html = '';

      Object.keys(data).forEach(section => {
        const items = data[section];
        const filtered = q ? items.filter(item => item.cls.toLowerCase().includes(q) || item.val.toLowerCase().includes(q)) : items;

        if (filtered.length === 0) return;

        const isCollapsed = !q && collapsed[section] === true;
        const displayCount = q ? filtered.length : items.length;

        html += '<div class="tool-section" style="margin-bottom:12px">';
        html += '<div class="tool-section-title" style="cursor:pointer;user-select:none;display:flex;justify-content:space-between;align-items:center" data-tw-section="' + section + '">';
        html += '<span>' + section + ' <span style="font-size:11px;color:var(--text-dim);font-weight:400">(' + displayCount + ')</span></span>';
        html += '<span style="font-size:14px;transition:transform 0.2s">' + (isCollapsed ? '+' : '\u2212') + '</span>';
        html += '</div>';
        html += '<div class="tw-section-body" style="' + (isCollapsed ? 'display:none' : '') + '">';

        filtered.forEach(item => {
          html += '<div class="cheat-item" style="cursor:pointer" data-cls="' + App.utils.escapeHtml(item.cls) + '">';
          html += '<span class="cheat-class">' + App.utils.escapeHtml(item.cls) + '</span>';
          html += '<span class="cheat-value">' + App.utils.escapeHtml(item.val) + '</span>';
          html += '</div>';
        });

        html += '</div></div>';
      });

      if (!html) {
        html = '<div class="tool-section" style="text-align:center;padding:32px;color:var(--text-muted)">No classes match your search.</div>';
      }

      sectionsContainer.innerHTML = html;

      // Attach toggle handlers
      sectionsContainer.querySelectorAll('[data-tw-section]').forEach(titleEl => {
        titleEl.addEventListener('click', () => {
          const section = titleEl.dataset.twSection;
          collapsed[section] = !collapsed[section];
          renderSections(searchInput.value);
        });
      });

      // Copy on click
      sectionsContainer.querySelectorAll('.cheat-item').forEach(item => {
        item.addEventListener('click', () => {
          App.utils.copyToClipboard(item.dataset.cls);
        });
      });
    }

    searchInput.addEventListener('input', App.utils.debounce(() => {
      renderSections(searchInput.value);
    }, 150));

    renderSections('');
  }
});


// ----------------------------------------
// 6. Word Counter
// ----------------------------------------
App.registerTool({
  id: 'word-counter',
  name: 'Word Counter',
  description: 'Count words, characters, sentences and more with reading time estimates',
  category: 'Developer',
  icon: '\u{1F4DD}',

  render() {
    return `
      <div class="tool-section">
        <label class="tool-label">Enter or Paste Your Text</label>
        <textarea id="wc-input" class="tool-textarea" rows="10" placeholder="Start typing or paste text here..." spellcheck="false"></textarea>
      </div>

      <div class="result-grid" style="grid-template-columns:repeat(auto-fill,minmax(170px,1fr))" id="wc-stats">
        <div class="result-card">
          <div class="result-label">Characters (with spaces)</div>
          <div class="result-value" id="wc-chars">0</div>
        </div>
        <div class="result-card">
          <div class="result-label">Characters (no spaces)</div>
          <div class="result-value" id="wc-chars-ns">0</div>
        </div>
        <div class="result-card">
          <div class="result-label">Words</div>
          <div class="result-value" id="wc-words">0</div>
        </div>
        <div class="result-card">
          <div class="result-label">Sentences</div>
          <div class="result-value" id="wc-sentences">0</div>
        </div>
        <div class="result-card">
          <div class="result-label">Paragraphs</div>
          <div class="result-value" id="wc-paragraphs">0</div>
        </div>
        <div class="result-card">
          <div class="result-label">Lines</div>
          <div class="result-value" id="wc-lines">0</div>
        </div>
        <div class="result-card">
          <div class="result-label">Avg Word Length</div>
          <div class="result-value" id="wc-avg-word">0</div>
        </div>
        <div class="result-card">
          <div class="result-label">Reading Time</div>
          <div class="result-value" id="wc-read-time" style="font-size:18px">0 sec</div>
        </div>
        <div class="result-card">
          <div class="result-label">Speaking Time</div>
          <div class="result-value" id="wc-speak-time" style="font-size:18px">0 sec</div>
        </div>
      </div>

      <hr class="tool-separator">

      <div class="tool-row" style="align-items:flex-start">
        <div class="tool-col">
          <div class="tool-section">
            <div class="tool-section-title">Top 10 Words</div>
            <div id="wc-top-words" style="font-size:13px;color:var(--text-muted)">Type something to see word frequency</div>
          </div>
        </div>
        <div class="tool-col">
          <div class="tool-section">
            <div class="tool-section-title">Top 10 Characters</div>
            <div id="wc-top-chars" style="font-size:13px;color:var(--text-muted)">Type something to see character frequency</div>
          </div>
        </div>
      </div>
    `;
  },

  init() {
    const input = document.getElementById('wc-input');

    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'is', 'it', 'as', 'be', 'was', 'were',
      'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
      'would', 'could', 'should', 'may', 'might', 'shall', 'can', 'this',
      'that', 'these', 'those', 'i', 'you', 'he', 'she', 'we', 'they',
      'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'its', 'our',
      'their', 'am', 'are', 'not', 'no', 'so', 'if', 'then', 'than',
      'too', 'very', 'just', 'about', 'up', 'out', 'all', 'also', 'into',
      'what', 'which', 'who', 'whom', 'how', 'when', 'where', 'why',
      'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some',
      'such', 'only', 'own', 'same', 'here', 'there', 'again', 'once'
    ]);

    function formatTime(minutes) {
      if (minutes < 1) {
        const secs = Math.round(minutes * 60);
        return secs + ' sec';
      }
      const mins = Math.floor(minutes);
      const secs = Math.round((minutes - mins) * 60);
      if (mins === 0) return secs + ' sec';
      if (secs === 0) return mins + ' min';
      return mins + ' min ' + secs + ' sec';
    }

    function update() {
      const text = input.value;

      // Characters
      const chars = text.length;
      const charsNoSpaces = text.replace(/\s/g, '').length;

      // Words
      const words = text.trim() ? text.trim().split(/\s+/) : [];
      const wordCount = words.length;

      // Sentences: split on .!? followed by space or end
      const sentences = text.trim() ? text.split(/[.!?]+/).filter(s => s.trim().length > 0) : [];
      const sentenceCount = sentences.length;

      // Paragraphs: non-empty blocks separated by blank lines
      const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter(p => p.trim().length > 0) : [];
      const paragraphCount = paragraphs.length;

      // Lines
      const lines = text ? text.split('\n') : [];
      const lineCount = text ? lines.length : 0;

      // Average word length
      let avgWordLen = 0;
      if (wordCount > 0) {
        const totalChars = words.reduce((sum, w) => sum + w.replace(/[^a-zA-Z0-9]/g, '').length, 0);
        avgWordLen = (totalChars / wordCount).toFixed(1);
      }

      // Reading and speaking time
      const readMinutes = wordCount / 200;
      const speakMinutes = wordCount / 130;

      document.getElementById('wc-chars').textContent = App.utils.formatNumber(chars);
      document.getElementById('wc-chars-ns').textContent = App.utils.formatNumber(charsNoSpaces);
      document.getElementById('wc-words').textContent = App.utils.formatNumber(wordCount);
      document.getElementById('wc-sentences').textContent = App.utils.formatNumber(sentenceCount);
      document.getElementById('wc-paragraphs').textContent = App.utils.formatNumber(paragraphCount);
      document.getElementById('wc-lines').textContent = App.utils.formatNumber(lineCount);
      document.getElementById('wc-avg-word').textContent = avgWordLen;
      document.getElementById('wc-read-time').textContent = formatTime(readMinutes);
      document.getElementById('wc-speak-time').textContent = formatTime(speakMinutes);

      // Top 10 words
      const topWordsEl = document.getElementById('wc-top-words');
      if (wordCount > 0) {
        const wordFreq = {};
        words.forEach(w => {
          const clean = w.toLowerCase().replace(/[^a-zA-Z0-9'-]/g, '');
          if (clean && !stopWords.has(clean) && clean.length > 1) {
            wordFreq[clean] = (wordFreq[clean] || 0) + 1;
          }
        });
        const sorted = Object.entries(wordFreq).sort((a, b) => b[1] - a[1]).slice(0, 10);
        if (sorted.length > 0) {
          const maxCount = sorted[0][1];
          let html = '<table class="tool-table" style="font-size:13px"><thead><tr><th>#</th><th>Word</th><th>Count</th><th></th></tr></thead><tbody>';
          sorted.forEach(([word, count], i) => {
            const barWidth = Math.round((count / maxCount) * 100);
            html += '<tr><td style="color:var(--text-dim)">' + (i + 1) + '</td><td style="font-weight:500">' + App.utils.escapeHtml(word) + '</td><td>' + count + '</td><td style="width:40%"><div style="background:var(--primary);height:6px;border-radius:3px;width:' + barWidth + '%;opacity:0.6"></div></td></tr>';
          });
          html += '</tbody></table>';
          topWordsEl.innerHTML = html;
        } else {
          topWordsEl.innerHTML = '<span style="color:var(--text-dim)">No significant words found</span>';
        }
      } else {
        topWordsEl.innerHTML = '<span style="color:var(--text-dim)">Type something to see word frequency</span>';
      }

      // Top 10 characters
      const topCharsEl = document.getElementById('wc-top-chars');
      if (charsNoSpaces > 0) {
        const charFreq = {};
        for (let i = 0; i < text.length; i++) {
          const ch = text[i];
          if (/\S/.test(ch)) {
            const lower = ch.toLowerCase();
            charFreq[lower] = (charFreq[lower] || 0) + 1;
          }
        }
        const sorted = Object.entries(charFreq).sort((a, b) => b[1] - a[1]).slice(0, 10);
        if (sorted.length > 0) {
          const maxCount = sorted[0][1];
          let html = '<table class="tool-table" style="font-size:13px"><thead><tr><th>#</th><th>Char</th><th>Count</th><th>%</th><th></th></tr></thead><tbody>';
          sorted.forEach(([ch, count], i) => {
            const pct = ((count / charsNoSpaces) * 100).toFixed(1);
            const barWidth = Math.round((count / maxCount) * 100);
            const displayChar = ch === ' ' ? '(space)' : App.utils.escapeHtml(ch);
            html += '<tr><td style="color:var(--text-dim)">' + (i + 1) + '</td><td style="font-weight:600;font-family:var(--font-mono)">' + displayChar + '</td><td>' + count + '</td><td style="color:var(--text-dim)">' + pct + '%</td><td style="width:30%"><div style="background:var(--primary);height:6px;border-radius:3px;width:' + barWidth + '%;opacity:0.6"></div></td></tr>';
          });
          html += '</tbody></table>';
          topCharsEl.innerHTML = html;
        } else {
          topCharsEl.innerHTML = '<span style="color:var(--text-dim)">No characters found</span>';
        }
      } else {
        topCharsEl.innerHTML = '<span style="color:var(--text-dim)">Type something to see character frequency</span>';
      }
    }

    input.addEventListener('input', App.utils.debounce(update, 100));
    update();
  }
});
