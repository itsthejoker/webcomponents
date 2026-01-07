/**
 * A custom web component for a Bootstrap sidebar navbar (offcanvas navbar).
 *
 * This component wraps the Bootstrap navbar with offcanvas functionality.
 *
 * Attributes:
 * - expand: The breakpoint at which the navbar expands: 'sm', 'md', 'lg', 'xl', 'xxl', or 'always'.
 *           Above this breakpoint, the sidebar content is shown as a regular navbar.
 * - background: The background color class (without 'bg-'): 'body-tertiary' (default), 'primary', 'dark', etc.
 * - theme: The color theme: 'light' or 'dark' (sets data-bs-theme).
 * - placement: The placement of the offcanvas: 'start' (left, default), 'end' (right), 'top', 'bottom'.
 * - navbar-placement: The placement of the navbar itself: 'fixed-top', 'fixed-bottom', 'sticky-top', 'sticky-bottom'.
 * - container: The container type inside the navbar: 'fluid' (default), 'sm', 'md', 'lg', 'xl', 'xxl', or 'standard'.
 * - title: The title shown in the offcanvas header.
 */
class BsSidebar extends HTMLElement {
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

    const expandAttr = this.getAttribute('expand');
    const background = this.getAttribute('background') || 'body-tertiary';
    const theme = this.getAttribute('theme');
    const placement = this.getAttribute('placement') || 'start';
    const navbarPlacement = this.getAttribute('navbar-placement');
    const containerType = this.getAttribute('container') || 'fluid';
    const title = this.getAttribute('title') || '';
    const sidebarId = this.id || `sidebar-${Math.random().toString(36).substr(2, 9)}`;
    const offcanvasId = `${sidebarId}-offcanvas`;
    
    this.style.display = 'block';
    if (theme) this.setAttribute('data-bs-theme', theme);

    const nav = document.createElement('nav');
    let expandClass = '';
    if (expandAttr === 'always') {
      expandClass = 'navbar-expand';
    } else if (expandAttr && expandAttr !== 'none' && expandAttr !== 'false') {
      expandClass = `navbar-expand-${expandAttr}`;
    }
    
    nav.className = `navbar ${expandClass} bg-${background}`.trim();
    if (theme) nav.setAttribute('data-bs-theme', theme);
    if (navbarPlacement) {
      nav.classList.add(navbarPlacement);
    }

    const container = document.createElement('div');
    container.className = containerType === 'standard' ? 'container' : `container-${containerType}`;

    // Toggler
    const toggler = document.createElement('button');
    toggler.className = 'navbar-toggler';
    toggler.type = 'button';
    toggler.setAttribute('data-bs-toggle', 'offcanvas');
    toggler.setAttribute('data-bs-target', `#${offcanvasId}`);
    toggler.setAttribute('aria-controls', offcanvasId);
    toggler.setAttribute('aria-label', 'Toggle navigation');
    toggler.innerHTML = '<span class="navbar-toggler-icon"></span>';

    // Offcanvas
    const offcanvas = document.createElement('div');
    const offcanvasBaseClass = (expandAttr && expandAttr !== 'none' && expandAttr !== 'false' && expandAttr !== 'always') 
      ? `offcanvas-${expandAttr}` 
      : 'offcanvas';
    
    offcanvas.className = `${offcanvasBaseClass} offcanvas-${placement}`;
    offcanvas.id = offcanvasId;
    offcanvas.setAttribute('tabindex', '-1');
    offcanvas.setAttribute('aria-labelledby', `${offcanvasId}Label`);
    if (theme) offcanvas.setAttribute('data-bs-theme', theme);

    // Offcanvas Header
    const header = document.createElement('div');
    header.className = 'offcanvas-header';
    
    const h5 = document.createElement('h5');
    h5.className = 'offcanvas-title';
    h5.id = `${offcanvasId}Label`;
    h5.textContent = title;
    
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'btn-close';
    closeBtn.setAttribute('data-bs-dismiss', 'offcanvas');
    closeBtn.setAttribute('data-bs-target', `#${offcanvasId}`);
    closeBtn.setAttribute('aria-label', 'Close');
    
    header.appendChild(h5);
    header.appendChild(closeBtn);
    offcanvas.appendChild(header);

    // Offcanvas Body
    const body = document.createElement('div');
    body.className = 'offcanvas-body';
    offcanvas.appendChild(body);

    // Capture children
    const children = Array.from(this.childNodes);
    this.innerHTML = '';

    // Distribute children
    children.forEach(child => {
      if (child.nodeType === Node.ELEMENT_NODE && child.tagName.toLowerCase() === 'bs-navbar-brand') {
        container.appendChild(child);
      }
    });

    container.appendChild(toggler);

    // Handle title slot if it exists among children
    const titleSlot = children.find(child => 
      child.nodeType === Node.ELEMENT_NODE && child.getAttribute('slot') === 'title'
    );

    if (titleSlot) {
      h5.innerHTML = '';
      h5.appendChild(titleSlot);
    }

    children.forEach(child => {
      if (child.nodeType === Node.ELEMENT_NODE && (child.tagName.toLowerCase() === 'bs-navbar-brand')) {
        return;
      }
      if (child === titleSlot) {
        return;
      }
      body.appendChild(child);
    });

    container.appendChild(offcanvas);
    nav.appendChild(container);
    
    const wrapper = document.createElement('div');
    // Copy classes/attributes from original element to wrapper
    Array.from(this.attributes).forEach(attr => {
      const reserved = ['id', 'title', 'expand', 'background', 'theme', 'placement', 'navbar-placement', 'container', 'class'];
      if (!reserved.includes(attr.name)) {
        wrapper.setAttribute(attr.name, attr.value);
      }
    });
    const hostClasses = this.getAttribute('class');
    if (hostClasses) {
      wrapper.className = hostClasses;
      this.className = ''; // Remove from host to avoid double application
    }

    wrapper.appendChild(nav);
    this.appendChild(wrapper);
  }

  disconnectedCallback() {
    // Bootstrap Offcanvas doesn't necessarily need manual disposal if only using data attributes.
  }
}

/**
 * A custom web component for a permanent (non-collapsible) Bootstrap sidebar.
 *
 * Attributes:
 * - width: The width of the sidebar (default: '280px').
 * - background: The background color class (without 'bg-'): 'body-tertiary' (default), etc.
 * - theme: The color theme: 'light' or 'dark' (sets data-bs-theme).
 * - title: The title shown in the sidebar header.
 * - navbar-placement: The placement of the sidebar: 'sticky-top' (default), 'fixed-top', etc.
 */
class BsPermanentSidebar extends HTMLElement {
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

    const width = this.getAttribute('width') || '280px';
    const background = this.getAttribute('background') || 'body-tertiary';
    const theme = this.getAttribute('theme');
    const title = this.getAttribute('title') || '';
    const navbarPlacement = this.getAttribute('navbar-placement') || 'sticky-top';
    const expandAttr = this.getAttribute('expand') || 'md';

    const breakpoints = {
      'sm': '576px',
      'md': '768px',
      'lg': '992px',
      'xl': '1200px',
      'xxl': '1400px'
    };
    const breakpointPx = breakpoints[expandAttr] || '768px';

    const sidebarId = this.id || `sidebar-${Math.random().toString(36).substr(2, 9)}`;
    if (!this.id) this.id = sidebarId;
    const offcanvasId = `${sidebarId}-offcanvas`;

    this.style.display = 'block';
    if (theme) this.setAttribute('data-bs-theme', theme);
    if (navbarPlacement) {
      this.classList.add(navbarPlacement);
    }

    // Responsive width handling
    const styleId = `${sidebarId}-style`;
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        #${sidebarId} { width: 100%; }
        @media (min-width: ${breakpointPx}) {
          #${sidebarId} { width: ${width} !important; }
        }
      `;
      document.head.appendChild(style);
    }

    // Toggle Button (Mobile only)
    const toggleContainer = document.createElement('div');
    toggleContainer.className = `navbar d-${expandAttr}-none border-bottom w-100 bg-${background}`;
    if (theme) toggleContainer.setAttribute('data-bs-theme', theme);
    
    const containerFluid = document.createElement('div');
    containerFluid.className = 'container-fluid justify-content-start';
    
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'navbar-toggler border-0';
    toggleBtn.type = 'button';
    toggleBtn.setAttribute('data-bs-toggle', 'offcanvas');
    toggleBtn.setAttribute('data-bs-target', `#${offcanvasId}`);
    toggleBtn.setAttribute('aria-controls', offcanvasId);
    toggleBtn.innerHTML = '<span class="navbar-toggler-icon"></span>';
    
    containerFluid.appendChild(toggleBtn);
    toggleContainer.appendChild(containerFluid);

    // Offcanvas Structure
    const offcanvas = document.createElement('div');
    offcanvas.className = `offcanvas-${expandAttr} offcanvas-start`;
    offcanvas.id = offcanvasId;
    offcanvas.setAttribute('tabindex', '-1');
    offcanvas.setAttribute('aria-labelledby', `${offcanvasId}Label`);
    if (theme) offcanvas.setAttribute('data-bs-theme', theme);

    const offcanvasHeader = document.createElement('div');
    offcanvasHeader.className = `offcanvas-header border-bottom d-${expandAttr}-none`;
    
    const h5 = document.createElement('h5');
    h5.className = 'offcanvas-title';
    h5.id = `${offcanvasId}Label`;
    h5.textContent = title;
    
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'btn-close';
    closeBtn.setAttribute('data-bs-dismiss', 'offcanvas');
    closeBtn.setAttribute('data-bs-target', `#${offcanvasId}`);
    closeBtn.setAttribute('aria-label', 'Close');
    
    offcanvasHeader.appendChild(h5);
    offcanvasHeader.appendChild(closeBtn);
    offcanvas.appendChild(offcanvasHeader);

    const offcanvasBody = document.createElement('div');
    offcanvasBody.className = 'offcanvas-body p-0';
    offcanvas.appendChild(offcanvasBody);

    const container = document.createElement('div');
    container.className = `navbar d-flex flex-column flex-shrink-0 p-3 bg-${background} vh-100 align-items-stretch`.trim();
    if (navbarPlacement) {
      container.classList.add(navbarPlacement);
    }
    container.style.width = '100%';
    if (theme) container.setAttribute('data-bs-theme', theme);

    const wrapper = document.createElement('div');
    wrapper.className = 'w-100 h-100';
    // Copy classes/attributes from original element to wrapper
    Array.from(this.attributes).forEach(attr => {
      const reserved = ['id', 'title', 'width', 'background', 'theme', 'navbar-placement', 'style', 'class'];
      if (!reserved.includes(attr.name)) {
        wrapper.setAttribute(attr.name, attr.value);
      }
    });
    const hostClasses = this.getAttribute('class');
    if (hostClasses) {
      wrapper.className += ` ${hostClasses}`;
      this.className = '';
    }

    // Capture children
    const children = Array.from(this.childNodes);
    this.innerHTML = '';

    // Handle title slot
    const titleSlot = children.find(child => 
      child.nodeType === Node.ELEMENT_NODE && child.getAttribute('slot') === 'title'
    );

    // Look for bs-navbar-brand
    const brand = children.find(child => 
      child.nodeType === Node.ELEMENT_NODE && child.tagName.toLowerCase() === 'bs-navbar-brand'
    );

    if (titleSlot) {
      const titleClone = titleSlot.cloneNode(true);
      h5.innerHTML = '';
      h5.appendChild(titleClone);
    }

    // Add brand/title to toggle bar
    if (brand) {
      containerFluid.appendChild(brand.cloneNode(true));
    } else if (titleSlot || title) {
      const brandSpan = document.createElement('span');
      brandSpan.className = 'navbar-brand mb-0 h1 ms-2';
      if (titleSlot) {
        brandSpan.appendChild(titleSlot.cloneNode(true));
      } else {
        brandSpan.textContent = title;
      }
      containerFluid.appendChild(brandSpan);
    }

    // Header container
    const header = document.createElement('div');
    header.className = 'd-flex align-items-center mb-3 me-md-auto text-decoration-none';

    let hasHeaderContent = false;

    if (brand) {
      header.appendChild(brand);
      hasHeaderContent = true;
    }

    if (titleSlot || title) {
      const titleSpan = document.createElement('span');
      titleSpan.className = 'navbar-brand fs-4';
      if (titleSlot) {
        titleSpan.appendChild(titleSlot);
      } else {
        titleSpan.textContent = title;
      }
      header.appendChild(titleSpan);
      hasHeaderContent = true;
    }

    if (hasHeaderContent) {
      container.appendChild(header);
    }

    children.forEach(child => {
      if (child === titleSlot || child === brand) return;
      if (child.nodeType === Node.ELEMENT_NODE && child.tagName.toLowerCase() === 'bs-navbar-nav') {
        child.classList.add('flex-fill', 'flex-column');
      }
      container.appendChild(child);
    });

    offcanvasBody.appendChild(container);
    wrapper.appendChild(toggleContainer);
    wrapper.appendChild(offcanvas);
    this.appendChild(wrapper);
  }
}

if (!customElements.get('bs-sidebar')) {
  customElements.define('bs-sidebar', BsSidebar);
}

if (!customElements.get('bs-permanent-sidebar')) {
  customElements.define('bs-permanent-sidebar', BsPermanentSidebar);
}
