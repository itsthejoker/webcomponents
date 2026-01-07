/**
 * A custom web component for a Bootstrap alert.
 *
 * This component wraps the standard Bootstrap alert structure. It does not use
 * Shadow DOM to ensure full compatibility with Bootstrap's global CSS.
 *
 * Attributes:
 * - variant: The contextual variant (e.g., 'primary', 'success', 'danger'). Default: 'primary'.
 * - dismissible: Boolean attribute; if present, the alert will have a close button.
 * - fade: Boolean attribute; if present, the alert will fade out when dismissed.
 * - heading: The heading text for the alert.
 *
 * Slots:
 * - heading: Custom heading element (overrides heading attribute).
 * - (default): Content for the alert body.
 */
class BsAlert extends HTMLElement {
  constructor() {
    super();
    this.alert = null;
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
    if (this.alert) {
      this.alert.dispose();
      this.alert = null;
    }
  }

  _render() {
    if (this._initialized) return;
    this._initialized = true;

    const variantAttr = this.getAttribute('variant') || 'primary';
    const dismissible = this.hasAttribute('dismissible');
    const fade = this.hasAttribute('fade');
    const headingAttr = this.getAttribute('heading');

    this.style.display = 'block';

    const alertElement = document.createElement('div');
    alertElement.className = `alert alert-${variantAttr}`;
    alertElement.setAttribute('role', 'alert');

    if (dismissible) {
      alertElement.classList.add('alert-dismissible');
    }
    if (fade) {
      alertElement.classList.add('fade', 'show');
    }

    // Pass through classes from the host element to the underlying div
    const hostClasses = this.getAttribute('class');
    if (hostClasses) {
      alertElement.className += ` ${hostClasses}`;
    }

    // Capture children and clear innerHTML for the new structure
    const fragment = document.createDocumentFragment();
    while (this.firstChild) {
      fragment.appendChild(this.firstChild);
    }

    // Containers for distribution (temporary)
    const headingContainer = document.createElement('div');
    const bodyContainer = document.createElement('div');
    const dismissContainer = document.createElement('div');

    // Initial heading from attribute
    if (headingAttr) {
      const h4 = document.createElement('h4');
      h4.className = 'alert-heading';
      h4.textContent = headingAttr;
      headingContainer.appendChild(h4);
    }

    // Initial dismiss button
    if (dismissible) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-close';
      btn.setAttribute('data-bs-dismiss', 'alert');
      btn.setAttribute('aria-label', 'Close');
      dismissContainer.appendChild(btn);
    }

    // Distribute children
    Array.from(fragment.childNodes).forEach(child => {
      if (child.nodeType === Node.ELEMENT_NODE && child.hasAttribute('slot')) {
        const slot = child.getAttribute('slot');
        if (slot === 'heading') {
          headingContainer.innerHTML = ''; // Override attribute
          if (child instanceof HTMLElement) {
            child.classList.add('alert-heading');
          }
          headingContainer.appendChild(child);
        } else {
          bodyContainer.appendChild(child);
        }
      } else {
        bodyContainer.appendChild(child);
      }
    });

    // Clear and append in order
    this.innerHTML = '';
    this.appendChild(alertElement);
    
    while (headingContainer.firstChild) {
      alertElement.appendChild(headingContainer.firstChild);
    }
    
    while (bodyContainer.firstChild) {
      alertElement.appendChild(bodyContainer.firstChild);
    }
    
    while (dismissContainer.firstChild) {
      alertElement.appendChild(dismissContainer.firstChild);
    }

    // Initialize Bootstrap Alert if available
    if (window.bootstrap && window.bootstrap.Alert) {
      this.alert = new bootstrap.Alert(alertElement);
    }
  }

  /**
   * Closes the alert.
   */
  close() {
    this._ensureAlert();
    if (this.alert) {
      this.alert.close();
    }
  }

  /**
   * Destroys the Bootstrap alert instance.
   */
  dispose() {
    if (this.alert) {
      this.alert.dispose();
      this.alert = null;
    }
  }

  _ensureAlert() {
    if (!this._initialized) {
      this._render();
    }
    if (!this.alert && window.bootstrap && window.bootstrap.Alert) {
      const alertEl = this.querySelector('.alert');
      this.alert = new bootstrap.Alert(alertEl);
    }
  }
}

// Define the custom element
if (!customElements.get('bs-alert')) {
  customElements.define('bs-alert', BsAlert);
}
