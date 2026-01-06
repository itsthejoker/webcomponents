/**
 * A custom web component for a Bootstrap badge.
 *
 * This component wraps the standard Bootstrap badge structure. It does not use
 * Shadow DOM to ensure full compatibility with Bootstrap's global CSS.
 *
 * Attributes:
 * - type: The contextual variant (e.g., 'primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'). Default: 'secondary'.
 * - pill: Boolean attribute; if present, the badge will have a rounded-pill shape.
 * - text: Simple text content for the badge (overridden by child content).
 *
 * Slots:
 * - (default): Content for the badge.
 */
class BsBadge extends HTMLElement {
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

    const typeAttr = this.getAttribute('type') || 'secondary';
    const pill = this.hasAttribute('pill');
    const textAttr = this.getAttribute('text');

    this.classList.add('badge');
    
    // Bootstrap 5.3+ recommends text-bg-{color} for badges to ensure contrast.
    this.classList.add(`text-bg-${typeAttr}`);

    if (pill) {
      this.classList.add('rounded-pill');
    }

    // If text attribute is provided and there are no children, use it
    if (textAttr && this.childNodes.length === 0) {
      this.textContent = textAttr;
    }
    
    // Note: Since we are not using Shadow DOM and we are applying classes to the host element,
    // we don't necessarily need to move children unless we wanted a more complex internal structure.
    // For a badge, the host element itself IS the badge.
  }
}

// Define the custom element
if (!customElements.get('bs-badge')) {
  customElements.define('bs-badge', BsBadge);
}
