/**
 * A custom web component for a Bootstrap 5 theme toggle.
 * It cycles between light, dark, and auto (system) color modes.
 *
 * This component does not use Shadow DOM to ensure full compatibility with 
 * Bootstrap's global CSS and handles the 'data-bs-theme' attribute on the <html> element.
 *
 * @element theme-toggle
 * @attribute {string} [storage-key=theme] - The localStorage key to store the theme preference.
 */
class ThemeToggle extends HTMLElement {
  constructor() {
    super();
    this._initialized = false;
    this._state = 'auto'; // light, dark, auto
    this._handleSystemThemeChange = this._handleSystemThemeChange.bind(this);
    this._handleExternalChange = this._handleExternalChange.bind(this);
  }

  static get observedAttributes() {
    return ['storage-key'];
  }

  connectedCallback() {
    if (this._initialized) return;

    // Use a timeout to ensure that the element is fully parsed.
    setTimeout(() => {
      this._render();
    }, 0);
  }

  disconnectedCallback() {
    if (this._query) {
      this._query.removeEventListener('change', this._handleSystemThemeChange);
    }
    window.removeEventListener('storage', this._handleExternalChange);
    window.removeEventListener('bs-theme-change', this._handleExternalChange);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (this._initialized && name === 'storage-key' && oldValue !== newValue) {
      this._state = localStorage.getItem(newValue) || 'auto';
      this._applyTheme(this._state);
      this._updateVisuals();
    }
  }

  _render() {
    if (this._initialized) return;
    this._initialized = true;

    const storageKey = this.getAttribute('storage-key') || 'theme';
    this._state = localStorage.getItem(storageKey) || 'auto';

    // Apply the theme immediately
    this._applyTheme(this._state);

    this.style.display = 'block';
    const wrapper = document.createElement('div');
    const hostClasses = this.getAttribute('class');
    if (hostClasses) {
      wrapper.className += ` ${hostClasses}`;
    }

    wrapper.innerHTML = `
      <button class="btn btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center" 
              type="button" 
              style="width: 2.5rem; height: 2.5rem;" 
              aria-label="Toggle theme">
        <span class="theme-toggle-icon d-flex justify-content-center"></span>
      </button>
    `;

    this.innerHTML = '';
    this.appendChild(wrapper);

    this.button = wrapper.querySelector('button');
    this.iconContainer = wrapper.querySelector('.theme-toggle-icon');

    this._updateVisuals();

    this.button.addEventListener('click', () => {
      this._cycleState();
    });

    // Listen for system color scheme changes
    this._query = window.matchMedia('(prefers-color-scheme: dark)');
    this._query.addEventListener('change', this._handleSystemThemeChange);

    // Sync with other instances via storage and custom events
    window.addEventListener('storage', this._handleExternalChange);
    window.addEventListener('bs-theme-change', this._handleExternalChange);
  }

  _handleSystemThemeChange() {
    if (this._state === 'auto') {
      this._applyTheme('auto');
    }
  }

  _handleExternalChange(e) {
    const storageKey = this.getAttribute('storage-key') || 'theme';
    
    if (e.type === 'storage') {
      if (e.key === storageKey) {
        this._state = e.newValue || 'auto';
        this._applyTheme(this._state);
        this._updateVisuals();
      }
    } else if (e.type === 'bs-theme-change') {
      if (e.detail.storageKey === storageKey && e.detail.theme !== this._state) {
        this._state = e.detail.theme;
        this._updateVisuals();
      }
    }
  }

  _cycleState() {
    const states = ['light', 'dark', 'auto'];
    const currentIndex = states.indexOf(this._state);
    this._state = states[(currentIndex + 1) % states.length];
    
    const storageKey = this.getAttribute('storage-key') || 'theme';
    localStorage.setItem(storageKey, this._state);
    
    this._applyTheme(this._state);
    this._updateVisuals();

    // Dispatch event for other instances on the same page
    window.dispatchEvent(new CustomEvent('bs-theme-change', {
      detail: { theme: this._state, storageKey }
    }));
  }

  _applyTheme(theme) {
    let activeTheme = theme;
    if (theme === 'auto') {
      activeTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-bs-theme', activeTheme);
  }

  _updateVisuals() {
    if (!this.iconContainer || !this.button) return;

    const sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="26" fill="currentColor" class="bi bi-sun-fill" viewBox="0 0 16 16"><path d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5.3.3a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0m9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/></svg>`;
    const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-moon-stars-fill" viewBox="0 0 16 16"><path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z"/><path d="M10.794 3.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387a1.734 1.734 0 0 0-1.097 1.097l-.387 1.162a.217.217 0 0 1-.412 0l-.387-1.162A1.734 1.734 0 0 0 9.31 6.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387a1.734 1.734 0 0 0 1.097-1.097l.387-1.162zM13.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.156 1.156 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.156 1.156 0 0 0-.732-.732l-.774-.258a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732L13.863.1z"/></svg>`;
    const autoIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-circle-half" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 0 8 1v14zm0 1A8 8 0 1 1 8 0a8 8 0 0 1 0 16z"/></svg>`;

    const icons = {
      light: sunIcon,
      dark: moonIcon,
      auto: autoIcon
    };

    const nextTitles = {
      light: 'Switch to Dark Mode',
      dark: 'Switch to System Theme',
      auto: 'Switch to Light Mode'
    };

    this.iconContainer.innerHTML = icons[this._state];
    this.button.title = nextTitles[this._state];
  }
}

if (!customElements.get('theme-toggle')) {
  customElements.define('theme-toggle', ThemeToggle);
}
