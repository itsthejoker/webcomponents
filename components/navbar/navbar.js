/**
 * A custom web component for a Bootstrap navbar.
 *
 * This component wraps the standard Bootstrap navbar structure and automatically
 * handles the responsive toggler and collapse functionality.
 *
 * Attributes:
 * - expand: The breakpoint at which the navbar expands: 'sm', 'md', 'lg' (default), 'xl', 'xxl', or 'always' (for .navbar-expand).
 * - background: The background color class (without 'bg-'): 'body-tertiary' (default), 'primary', 'dark', etc.
 * - theme: The color theme: 'light' or 'dark' (sets data-bs-theme).
 * - container: The container type: 'fluid' (default), 'sm', 'md', 'lg', 'xl', 'xxl', or 'standard' (for .container).
 * - placement: The placement of the navbar: 'fixed-top', 'fixed-bottom', 'sticky-top', 'sticky-bottom'.
 */
class BsNavbar extends HTMLElement {
  constructor() {
    super();
    this._initialized = false;
  }

  connectedCallback() {
    if (this._initialized) return;
    setTimeout(() => this._render(), 0);
  }

  _render() {
    if (this._initialized) return;
    this._initialized = true;

    const expandAttr = this.getAttribute('expand') || 'lg';
    const background = this.getAttribute('background') || 'body-tertiary';
    const theme = this.getAttribute('theme');
    const containerType = this.getAttribute('container') || 'fluid';
    const placement = this.getAttribute('placement');

    const navbarId = this.id || `navbar-${Math.random().toString(36).substr(2, 9)}`;
    const collapseId = `${navbarId}-collapse`;

    const nav = document.createElement('nav');
    let expandClass = '';
    if (expandAttr === 'always') {
      expandClass = 'navbar-expand';
    } else if (expandAttr && expandAttr !== 'none' && expandAttr !== 'false') {
      expandClass = `navbar-expand-${expandAttr}`;
    }
    
    nav.className = `navbar ${expandClass} bg-${background}`.trim();
    if (placement) nav.classList.add(placement);
    if (theme) nav.setAttribute('data-bs-theme', theme);

    const container = document.createElement('div');
    container.className = containerType === 'standard' ? 'container' : `container-${containerType}`;

    const toggler = document.createElement('button');
    toggler.className = 'navbar-toggler';
    toggler.type = 'button';
    toggler.setAttribute('data-bs-toggle', 'collapse');
    toggler.setAttribute('data-bs-target', `#${collapseId}`);
    toggler.setAttribute('aria-controls', collapseId);
    toggler.setAttribute('aria-expanded', 'false');
    toggler.setAttribute('aria-label', 'Toggle navigation');
    toggler.innerHTML = '<span class="navbar-toggler-icon"></span>';

    const collapse = document.createElement('div');
    collapse.className = 'collapse navbar-collapse';
    collapse.id = collapseId;

    // Capture children
    const children = Array.from(this.childNodes);
    this.innerHTML = '';

    // Distribute children: brand goes before toggler, rest goes in collapse
    children.forEach(child => {
      if (child.nodeType === Node.ELEMENT_NODE && child.tagName.toLowerCase() === 'bs-navbar-brand') {
        container.appendChild(child);
      }
    });

    container.appendChild(toggler);

    children.forEach(child => {
      if (child.nodeType !== Node.ELEMENT_NODE || child.tagName.toLowerCase() !== 'bs-navbar-brand') {
        collapse.appendChild(child);
      }
    });

    container.appendChild(collapse);
    nav.appendChild(container);
    this.appendChild(nav);
  }
}

/**
 * A custom web component for the Bootstrap navbar brand.
 *
 * Attributes:
 * - href: If provided, the brand will be rendered as an <a> tag.
 */
class BsNavbarBrand extends HTMLElement {
  constructor() {
    super();
    this._initialized = false;
  }
  connectedCallback() {
    if (this._initialized) return;
    setTimeout(() => this._render(), 0);
  }
  _render() {
    if (this._initialized) return;
    this._initialized = true;
    const href = this.getAttribute('href');
    const el = href ? document.createElement('a') : document.createElement('span');
    el.className = 'navbar-brand';
    if (href) el.href = href;
    
    while (this.firstChild) {
      el.appendChild(this.firstChild);
    }
    this.appendChild(el);
  }
}

/**
 * A custom web component for the Bootstrap navbar-nav container.
 *
 * Attributes:
 * - scroll: Boolean attribute; if present, enables vertical scrolling in the collapsed navbar.
 * - scroll-height: The maximum height for the scrollable area (sets --bs-scroll-height).
 */
class BsNavbarNav extends HTMLElement {
  constructor() {
    super();
    this._initialized = false;
  }
  connectedCallback() {
    if (this._initialized) return;
    setTimeout(() => this._render(), 0);
  }
  _render() {
    if (this._initialized) return;
    this._initialized = true;
    this.classList.add('navbar-nav');
    if (this.hasAttribute('scroll')) {
      this.classList.add('navbar-nav-scroll');
      const scrollHeight = this.getAttribute('scroll-height');
      if (scrollHeight) {
        this.style.setProperty('--bs-scroll-height', scrollHeight);
      }
    }
  }
}

/**
 * A custom web component for a link within the navbar.
 *
 * Attributes:
 * - href: The URL the link points to.
 * - active: Boolean attribute; if present, the link is displayed as active.
 * - disabled: Boolean attribute; if present, the link is displayed as disabled.
 */
class BsNavLink extends HTMLElement {
  constructor() {
    super();
    this._initialized = false;
  }
  connectedCallback() {
    if (this._initialized) return;
    setTimeout(() => this._render(), 0);
  }
  _render() {
    if (this._initialized) return;
    this._initialized = true;
    const href = this.getAttribute('href') || '#';
    const active = this.hasAttribute('active');
    const disabled = this.hasAttribute('disabled');

    this.className = 'nav-item';
    const link = document.createElement('a');
    link.className = `nav-link ${active ? 'active' : ''} ${disabled ? 'disabled' : ''}`.trim();
    link.href = href;
    if (active) link.setAttribute('aria-current', 'page');
    if (disabled) link.setAttribute('aria-disabled', 'true');

    while (this.firstChild) {
      link.appendChild(this.firstChild);
    }
    this.appendChild(link);
  }
}

/**
 * A custom web component for a dropdown menu within the navbar.
 *
 * Attributes:
 * - title: The text for the dropdown toggle.
 * - active: Boolean attribute; if present, the dropdown is displayed as active.
 */
class BsNavDropdown extends HTMLElement {
  constructor() {
    super();
    this._initialized = false;
  }
  connectedCallback() {
    if (this._initialized) return;
    setTimeout(() => this._render(), 0);
  }
  
  _render() {
    if (this._initialized) return;
    this._initialized = true;
    const title = this.getAttribute('title') || '';
    const active = this.hasAttribute('active');

    this.className = 'nav-item dropdown';
    
    const link = document.createElement('a');
    link.className = `nav-link dropdown-toggle ${active ? 'active' : ''}`.trim();
    link.href = '#';
    link.setAttribute('role', 'button');
    link.setAttribute('data-bs-toggle', 'dropdown');
    link.setAttribute('aria-expanded', 'false');
    
    // Support custom title slot
    const titleSlot = this.querySelector('[slot="title"]');
    if (titleSlot) {
      link.appendChild(titleSlot);
    } else {
      link.textContent = title;
    }

    const menu = document.createElement('ul');
    menu.className = 'dropdown-menu';

    const children = Array.from(this.childNodes);
    this.innerHTML = '';
    this.appendChild(link);
    this.appendChild(menu);

    children.forEach(child => {
      // Skip the title slot if we already used it
      if (child === titleSlot) return;

      if (child.nodeType === Node.ELEMENT_NODE) {
        const li = document.createElement('li');
        li.appendChild(child);
        menu.appendChild(li);
      } else {
        // We generally don't want text nodes directly in a <ul>, 
        // but if they are just whitespace, it's fine.
        if (child.nodeType === Node.TEXT_NODE && !child.textContent.trim()) {
           return;
        }
        const li = document.createElement('li');
        li.appendChild(child);
        menu.appendChild(li);
      }
    });
  }
}

/**
 * A custom web component for an item within a navbar dropdown.
 *
 * Attributes:
 * - href: The URL the item points to.
 * - active: Boolean attribute; if present, the item is displayed as active.
 * - disabled: Boolean attribute; if present, the item is displayed as disabled.
 */
class BsDropdownItem extends HTMLElement {
  constructor() {
    super();
    this._initialized = false;
  }
  connectedCallback() {
    if (this._initialized) return;
    setTimeout(() => this._render(), 0);
  }
  _render() {
    if (this._initialized) return;
    this._initialized = true;
    const href = this.getAttribute('href') || '#';
    const active = this.hasAttribute('active');
    const disabled = this.hasAttribute('disabled');

    const link = document.createElement('a');
    link.className = `dropdown-item ${active ? 'active' : ''} ${disabled ? 'disabled' : ''}`.trim();
    link.href = href;
    if (active) link.setAttribute('aria-current', 'page');
    if (disabled) link.setAttribute('aria-disabled', 'true');

    while (this.firstChild) {
      link.appendChild(this.firstChild);
    }
    this.appendChild(link);
  }
}

/**
 * A custom web component for a divider within a navbar dropdown.
 */
class BsDropdownDivider extends HTMLElement {
  constructor() {
    super();
    this._initialized = false;
  }
  connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;
    const hr = document.createElement('hr');
    hr.className = 'dropdown-divider';
    this.appendChild(hr);
  }
}

/**
 * A custom web component for plain text within a navbar.
 */
class BsNavbarText extends HTMLElement {
  constructor() {
    super();
    this._initialized = false;
  }
  connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;
    this.classList.add('navbar-text');
  }
}

// Define the custom elements
if (!customElements.get('bs-navbar')) {
  customElements.define('bs-navbar', BsNavbar);
}
if (!customElements.get('bs-navbar-brand')) {
  customElements.define('bs-navbar-brand', BsNavbarBrand);
}
if (!customElements.get('bs-navbar-nav')) {
  customElements.define('bs-navbar-nav', BsNavbarNav);
}
if (!customElements.get('bs-nav-link')) {
  customElements.define('bs-nav-link', BsNavLink);
}
if (!customElements.get('bs-nav-dropdown')) {
  customElements.define('bs-nav-dropdown', BsNavDropdown);
}
if (!customElements.get('bs-dropdown-item')) {
  customElements.define('bs-dropdown-item', BsDropdownItem);
}
if (!customElements.get('bs-dropdown-divider')) {
  customElements.define('bs-dropdown-divider', BsDropdownDivider);
}
if (!customElements.get('bs-navbar-text')) {
  customElements.define('bs-navbar-text', BsNavbarText);
}
