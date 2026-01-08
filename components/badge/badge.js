/**
 * A custom web component for a Bootstrap badge.
 *
 * This component wraps the standard Bootstrap badge structure. It does not use
 * Shadow DOM to ensure full compatibility with Bootstrap's global CSS.
 *
 * @element bs-badge
 *
 * @attr {string} variant - The contextual variant (e.g., 'primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'). Default: 'secondary'.
 * @attr {boolean} pill - If present, the badge will have a rounded-pill shape.
 * @attr {string} text - Simple text content for the badge (overridden by child content).
 *
 * @slot - Content for the badge.
 *
 * @example
 * <bs-badge variant="primary" pill text="New"></bs-badge>
 */
class BsBadge extends HTMLElement {
  constructor() {
    super();
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
   * Renders the badge structure and moves children into it.
   * @private
   */
  _render() {
    if (this._initialized) return;
    this._initialized = true;

    const variantAttr = this.getAttribute('variant') || 'secondary';
    const pill = this.hasAttribute('pill');
    const textAttr = this.getAttribute('text');

    const badgeElement = document.createElement('span');
    badgeElement.className = `badge text-bg-${variantAttr}`;

    if (pill) {
      badgeElement.classList.add('rounded-pill');
    }

    // Pass through classes from the host element to the underlying span
    const hostClasses = this.getAttribute('class');
    if (hostClasses) {
      badgeElement.className += ` ${hostClasses}`;
    }

    // If text attribute is provided and there are no children, use it
    if (textAttr && this.childNodes.length === 0) {
      badgeElement.textContent = textAttr;
    } else {
        // Move children to the badge element
        while (this.firstChild) {
            badgeElement.appendChild(this.firstChild);
        }
    }
    
    this.innerHTML = '';
    this.appendChild(badgeElement);
  }
}

// Define the custom element
if (!customElements.get('bs-badge')) {
  customElements.define('bs-badge', BsBadge);
}
