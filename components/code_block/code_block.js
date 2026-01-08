/**
 * A custom web component for displaying code blocks with syntax highlighting.
 * It wraps highlight.js and ensures its resources are loaded.
 *
 * @element bs-code-block
 *
 * @attribute {string} [language='html'] - The language for syntax highlighting (e.g., 'html', 'javascript').
 *
 * @slot - Default slot for the code to be highlighted.
 */
class BsCodeBlock extends HTMLElement {
  constructor() {
    super();
    this._initialized = false;
  }

  connectedCallback() {
    if (this._initialized) return;

    // Use a timeout to ensure that child elements are parsed before rendering.
    setTimeout(() => {
      this._render();
    }, 0);
  }

  _render() {
    if (this._initialized) return;
    this._initialized = true;

    this._ensureResources();

    const language = this.getAttribute('language') || 'html';
    const code = this.textContent.trim();

    // Use a wrapper div as per guidelines
    const wrapper = document.createElement('div');
    wrapper.classList.add('position-relative');
    
    // Copy classes from host
    const hostClasses = this.getAttribute('class');
    if (hostClasses) {
      wrapper.className += ' ' + hostClasses;
    }

    const pre = document.createElement('pre');
    pre.className = 'm-0';
    const codeElem = document.createElement('code');
    codeElem.className = `language-${language}`;
    
    // We use textContent to ensure the code is treated as literal text.
    // The browser has already unescaped any entities in innerHTML.
    codeElem.textContent = code;

    pre.appendChild(codeElem);
    wrapper.appendChild(pre);

    // Add copy button
    const copyBtn = document.createElement('button');
    copyBtn.className = 'btn btn-sm btn-outline-secondary position-absolute top-0 end-0 m-2';
    copyBtn.innerHTML = '<i class="bi bi-copy"></i>';
    copyBtn.setAttribute('title', 'Copy to clipboard');
    copyBtn.setAttribute('aria-label', 'Copy to clipboard');
    
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(code).then(() => {
        copyBtn.innerHTML = '<i class="bi bi-check2"></i>';
        copyBtn.classList.replace('btn-outline-secondary', 'btn-success');
        setTimeout(() => {
          copyBtn.innerHTML = '<i class="bi bi-copy"></i>';
          copyBtn.classList.replace('btn-success', 'btn-outline-secondary');
        }, 2000);
      });
    });

    wrapper.appendChild(copyBtn);

    this.innerHTML = '';
    this.appendChild(wrapper);

    this._highlight(codeElem);
  }

  _highlight(element) {
    if (window.hljs) {
      window.hljs.highlightElement(element);
    } else {
      // If hljs is still loading, wait and try again
      const interval = setInterval(() => {
        if (window.hljs) {
          window.hljs.highlightElement(element);
          clearInterval(interval);
        }
      }, 100);
      // Timeout after 5 seconds
      setTimeout(() => clearInterval(interval), 5000);
    }
  }

  _ensureResources() {
    // Standard styling for code blocks in this project
    if (!document.getElementById('bs-code-block-styles')) {
      const style = document.createElement('style');
      style.id = 'bs-code-block-styles';
      style.textContent = `
        pre > code.hljs {
          background-color: #f8f9fa !important;
          border: 1px solid #dee2e6 !important;
          padding: 1.5rem !important;
          border-radius: 0.375rem !important;
          display: block !important;
          overflow-x: auto;
        }
      `;
      document.head.appendChild(style);
    }

    // Load highlight.js CSS
    if (!document.querySelector('link[href*="highlight.js"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/default.min.css';
      document.head.appendChild(link);
    }

    // Load Bootstrap Icons CSS
    if (!document.querySelector('link[href*="bootstrap-icons"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css';
      document.head.appendChild(link);
    }

    // Load highlight.js JS
    if (!window.hljs && !document.querySelector('script[src*="highlight.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/highlight.min.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }
}

if (!customElements.get('bs-code-block')) {
  customElements.define('bs-code-block', BsCodeBlock);
}
