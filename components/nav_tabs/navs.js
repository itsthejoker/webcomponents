/**
 * A custom web component for Bootstrap tabs.
 *
 * This component acts as a container for <bs-tab> elements.
 * It coordinates the creation of the tab navigation and the tab content panes.
 *
 * Attributes:
 * - variant: The nav variant: 'tabs' (default), 'pills', 'underline'.
 * - vertical: Boolean attribute; if present, displays tabs vertically.
 * - fill: Boolean attribute; if present, fills the available width.
 * - justified: Boolean attribute; if present, creates equal-width tabs.
 * - fade: Boolean attribute; if present, uses fade animation for tab transitions.
 *
 * Slots:
 * - (default): Content containing <bs-tab> elements.
 */
class BsTabs extends HTMLElement {
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

    const variant = this.getAttribute('variant') || 'tabs';
    const isVertical = this.hasAttribute('vertical');
    const isFill = this.hasAttribute('fill');
    const isJustified = this.hasAttribute('justified');
    const useFade = this.hasAttribute('fade');

    const tabsId = this.id || `tabs-${Math.random().toString(36).substr(2, 9)}`;
    if (!this.id) this.id = tabsId;

    // Capture children
    const tabs = Array.from(this.querySelectorAll('bs-tab'));
    
    // Clear the element
    this.innerHTML = '';

    const container = document.createElement('div');
    if (isVertical) {
      container.classList.add('d-flex', 'align-items-start');
    }

    const nav = document.createElement('div');
    nav.className = `nav nav-${variant}`;
    if (isVertical) {
      nav.classList.add('flex-column', 'me-3');
      nav.setAttribute('aria-orientation', 'vertical');
    }
    if (isFill) nav.classList.add('nav-fill');
    if (isJustified) nav.classList.add('nav-justified');
    nav.setAttribute('role', 'tablist');

    const content = document.createElement('div');
    content.className = 'tab-content';
    content.id = `${tabsId}-content`;

    tabs.forEach((tab, index) => {
      const tabId = tab.id || `${tabsId}-tab-${index}`;
      const paneId = `${tabId}-pane`;
      const isActive = tab.hasAttribute('active');
      const isDisabled = tab.hasAttribute('disabled');
      const title = tab.getAttribute('title') || '';

      // Create Nav Link
      const button = document.createElement('button');
      button.className = `nav-link ${isActive ? 'active' : ''}`;
      button.id = tabId;
      button.type = 'button';
      button.setAttribute('role', 'tab');
      button.setAttribute('data-bs-toggle', variant === 'pills' ? 'pill' : 'tab');
      button.setAttribute('data-bs-target', `#${paneId}`);
      button.setAttribute('aria-controls', paneId);
      button.setAttribute('aria-selected', isActive ? 'true' : 'false');
      if (isDisabled) {
        button.setAttribute('disabled', '');
      }

      // Handle custom header slot if present in the bs-tab
      const headerSlot = tab.querySelector('[slot="header"]');
      if (headerSlot) {
        button.appendChild(headerSlot);
      } else {
        button.textContent = title;
      }

      nav.appendChild(button);

      // Create Tab Pane
      const pane = document.createElement('div');
      pane.className = `tab-pane ${useFade ? 'fade' : ''} ${isActive ? 'show active' : ''}`;
      pane.id = paneId;
      pane.setAttribute('role', 'tabpanel');
      pane.setAttribute('aria-labelledby', tabId);
      pane.setAttribute('tabindex', '0');

      // Move children from bs-tab to pane
      // Note: we already took the header slot out if it existed
      while (tab.firstChild) {
        pane.appendChild(tab.firstChild);
      }
      
      content.appendChild(pane);
    });

    if (isVertical) {
      container.appendChild(nav);
      container.appendChild(content);
      this.appendChild(container);
    } else {
      this.appendChild(nav);
      this.appendChild(content);
    }
  }
}

/**
 * A custom web component for a Bootstrap tab item.
 *
 * This component acts as a data holder for <bs-tabs>.
 *
 * Attributes:
 * - title: The title text for the tab trigger.
 * - active: Boolean attribute; if present, this tab is active by default.
 * - disabled: Boolean attribute; if present, this tab is disabled.
 *
 * Slots:
 * - header: Custom element for the tab trigger (overrides title attribute).
 * - (default): Content for the tab pane.
 */
class BsTab extends HTMLElement {
  // BsTab is mostly a data container, BsTabs does the rendering.
}

if (!customElements.get('bs-tabs')) {
  customElements.define('bs-tabs', BsTabs);
}
if (!customElements.get('bs-tab')) {
  customElements.define('bs-tab', BsTab);
}
