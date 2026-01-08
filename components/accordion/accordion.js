/**
 * A custom web component for a Bootstrap accordion.
 *
 * This component acts as a container for `<bs-accordion-item>` elements.
 * It does not use Shadow DOM to ensure full compatibility with Bootstrap's global CSS.
 *
 * @element bs-accordion
 *
 * @attr {boolean} flush - If present, removes some borders and rounded corners.
 * @attr {boolean} always-open - If present, items stay open when another item is opened.
 *
 * @slot - Content containing `<bs-accordion-item>` elements.
 *
 * @example
 * <bs-accordion flush>
 *   <bs-accordion-item title="Item 1" expanded>
 *     Content for item 1.
 *   </bs-accordion-item>
 *   <bs-accordion-item title="Item 2">
 *     Content for item 2.
 *   </bs-accordion-item>
 * </bs-accordion>
 */
class BsAccordion extends HTMLElement {
  constructor() {
    super();
    /** @type {boolean} */
    this._initialized = false;
  }

  /**
   * Called when the element is added to the document.
   * Initializes the accordion and generates a unique ID if none exists.
   */
  connectedCallback() {
    if (this._initialized) return;
    
    // Ensure the element has an ID for data-bs-parent references
    if (!this.id) {
      this.id = `accordion-${Math.random().toString(36).substr(2, 9)}`;
    }

    setTimeout(() => {
      this._render();
    }, 0);
  }

  /**
   * Renders the accordion container and moves children into it.
   * @private
   */
  _render() {
    if (this._initialized) return;
    this._initialized = true;

    this.style.display = 'block';

    const container = document.createElement('div');
    container.classList.add('accordion');
    if (this.hasAttribute('flush')) {
      container.classList.add('accordion-flush');
    }

    // Pass through classes from the host element to the underlying div
    const hostClasses = this.getAttribute('class');
    if (hostClasses) {
      container.className += ` ${hostClasses}`;
    }

    // Move children to the container
    while (this.firstChild) {
      container.appendChild(this.firstChild);
    }
    
    this.appendChild(container);
  }
}

/**
 * A custom web component for a Bootstrap accordion item.
 *
 * This component wraps the standard Bootstrap accordion item structure.
 *
 * @element bs-accordion-item
 *
 * @attr {string} title - The title text for the accordion item header.
 * @attr {boolean} expanded - If present, the item is expanded by default.
 *
 * @slot header - Custom header element (overrides the title attribute).
 * @slot - Content for the accordion item body.
 *
 * @example
 * <bs-accordion-item title="Accordion Item #1" expanded>
 *   <strong>This is the first item's accordion body.</strong>
 * </bs-accordion-item>
 */
class BsAccordionItem extends HTMLElement {
  constructor() {
    super();
    /** @type {bootstrap.Collapse|null} */
    this.collapse = null;
    /** @type {boolean} */
    this._initialized = false;
  }

  /**
   * Called when the element is added to the document.
   * Schedules the initial render.
   */
  connectedCallback() {
    if (this._initialized) return;

    // Use a timeout to ensure that child elements are parsed before rendering.
    setTimeout(() => {
      this._render();
    }, 0);
  }

  /**
   * Called when the element is removed from the document.
   * Disposes of the Bootstrap collapse instance.
   */
  disconnectedCallback() {
    if (this.collapse) {
      this.collapse.dispose();
      this.collapse = null;
    }
  }

  /**
   * Renders the accordion item structure and initializes the Bootstrap plugin.
   * @private
   */
  _render() {
    if (this._initialized) return;
    this._initialized = true;

    this.style.display = 'block';

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

    // Capture children and clear innerHTML for the new structure
    const fragment = document.createDocumentFragment();
    while (this.firstChild) {
      fragment.appendChild(this.firstChild);
    }

    const itemElement = document.createElement('div');
    itemElement.className = 'accordion-item';

    // Pass through classes from the host element to the underlying div
    const hostClasses = this.getAttribute('class');
    if (hostClasses) {
      itemElement.className += ` ${hostClasses}`;
    }

    itemElement.innerHTML = `
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

    this.innerHTML = '';
    this.appendChild(itemElement);

    const bodyContainer = itemElement.querySelector('.accordion-body');
    const headerButton = itemElement.querySelector('.accordion-button');

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

  /**
   * Ensures the Bootstrap collapse instance is initialized.
   * @private
   */
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
