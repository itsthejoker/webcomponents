/**
 * A custom web component for a Bootstrap accordion.
 *
 * This component acts as a container for <bs-accordion-item> elements.
 * It does not use Shadow DOM to ensure full compatibility with Bootstrap's global CSS.
 *
 * Attributes:
 * - flush: Boolean attribute; if present, removes some borders and rounded corners.
 * - always-open: Boolean attribute; if present, items stay open when another item is opened.
 *
 * Slots:
 * - (default): Content containing <bs-accordion-item> elements.
 */
class BsAccordion extends HTMLElement {
  constructor() {
    super();
    this._initialized = false;
  }

  connectedCallback() {
    if (this._initialized) return;
    
    // Ensure the element has an ID for data-bs-parent references
    if (!this.id) {
      this.id = `accordion-${Math.random().toString(36).substr(2, 9)}`;
    }

    this.classList.add('accordion');
    if (this.hasAttribute('flush')) {
      this.classList.add('accordion-flush');
    }
    
    this._initialized = true;
  }
}

/**
 * A custom web component for a Bootstrap accordion item.
 *
 * This component wraps the standard Bootstrap accordion item structure.
 *
 * Attributes:
 * - title: The title text for the accordion item header.
 * - expanded: Boolean attribute; if present, the item is expanded by default.
 *
 * Slots:
 * - header: Custom header element (overrides the title attribute).
 * - (default): Content for the accordion item body.
 *
 * Methods:
 * - show(): Shows the accordion item.
 * - hide(): Hides the accordion item.
 * - toggle(): Toggles the accordion item.
 * - dispose(): Destroys the collapse instance.
 */
class BsAccordionItem extends HTMLElement {
  constructor() {
    super();
    this.collapse = null;
    this._initialized = false;
  }

  connectedCallback() {
    if (this._initialized) return;

    // Use a timeout to ensure that child elements are parsed before rendering.
    setTimeout(() => {
      this._render();
    }, 0);
  }

  disconnectedCallback() {
    if (this.collapse) {
      this.collapse.dispose();
      this.collapse = null;
    }
  }

  _render() {
    if (this._initialized) return;
    this._initialized = true;

    const title = this.getAttribute('title') || '';
    const expanded = this.hasAttribute('expanded');
    
    // Find parent bs-accordion to handle data-bs-parent
    const parentAccordion = this.closest('bs-accordion');
    let parentId = null;
    if (parentAccordion) {
      // Ensure parent has an ID
      if (!parentAccordion.id) {
        parentAccordion.id = `accordion-${Math.random().toString(36).substr(2, 9)}`;
      }
      if (!parentAccordion.hasAttribute('always-open')) {
        parentId = parentAccordion.id;
      }
    }

    const itemId = this.id || `accordion-item-${Math.random().toString(36).substr(2, 9)}`;
    const collapseId = `collapse-${itemId}`;

    this.classList.add('accordion-item');

    // Capture children and clear innerHTML for the new structure
    const fragment = document.createDocumentFragment();
    while (this.firstChild) {
      fragment.appendChild(this.firstChild);
    }

    this.innerHTML = `
      <h2 class="accordion-header">
        <button class="accordion-button ${expanded ? '' : 'collapsed'}" type="button" 
                data-bs-toggle="collapse" data-bs-target="#${collapseId}" 
                aria-expanded="${expanded}" aria-controls="${collapseId}">
          ${title}
        </button>
      </h2>
      <div id="${collapseId}" class="accordion-collapse collapse ${expanded ? 'show' : ''}" 
           ${parentId ? `data-bs-parent="#${parentId}"` : ''}>
        <div class="accordion-body">
        </div>
      </div>
    `;

    const bodyContainer = this.querySelector('.accordion-body');
    const headerButton = this.querySelector('.accordion-button');

    // Distribute children to their respective slots
    Array.from(fragment.childNodes).forEach(child => {
      if (child.nodeType === Node.ELEMENT_NODE && child.getAttribute('slot') === 'header') {
        headerButton.innerHTML = ''; // Overwrite default title attribute
        headerButton.appendChild(child);
      } else {
        // Text nodes and elements without slot="header" go to the body
        bodyContainer.appendChild(child);
      }
    });

    // Initialize Bootstrap Collapse if available
    const collapseEl = this.querySelector('.accordion-collapse');
    if (window.bootstrap && window.bootstrap.Collapse) {
      this.collapse = new bootstrap.Collapse(collapseEl, {
        toggle: false
      });
    }
  }

  /**
   * Shows the accordion item.
   */
  show() {
    this._ensureCollapse();
    if (this.collapse) {
      this.collapse.show();
    }
  }

  /**
   * Hides the accordion item.
   */
  hide() {
    this._ensureCollapse();
    if (this.collapse) {
      this.collapse.hide();
    }
  }

  /**
   * Toggles the accordion item's visibility.
   */
  toggle() {
    this._ensureCollapse();
    if (this.collapse) {
      this.collapse.toggle();
    }
  }

  /**
   * Destroys the Bootstrap collapse instance.
   */
  dispose() {
    if (this.collapse) {
      this.collapse.dispose();
      this.collapse = null;
    }
  }

  _ensureCollapse() {
    if (!this._initialized) {
      this._render();
    }
    if (!this.collapse && window.bootstrap && window.bootstrap.Collapse) {
      const collapseEl = this.querySelector('.accordion-collapse');
      this.collapse = new bootstrap.Collapse(collapseEl, {
        toggle: false
      });
    }
  }
}

// Define the custom elements
if (!customElements.get('bs-accordion')) {
  customElements.define('bs-accordion', BsAccordion);
}
if (!customElements.get('bs-accordion-item')) {
  customElements.define('bs-accordion-item', BsAccordionItem);
}
