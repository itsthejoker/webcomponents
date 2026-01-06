/**
 * A custom web component for a Bootstrap spinner.
 *
 * This component wraps the standard Bootstrap spinner structure. It does not use
 * Shadow DOM to ensure full compatibility with Bootstrap's global CSS.
 *
 * Attributes:
 * - variant: The type of spinner ('border' or 'grow'). Default: 'border'.
 * - type: The contextual color (e.g., 'primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark').
 * - small: Boolean attribute; if present, the spinner will be smaller.
 * - label: Accessibility text for the spinner. Default: 'Loading...'.
 */
class BsSpinner extends HTMLElement {
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

    const variant = this.getAttribute('variant') || 'border';
    const type = this.getAttribute('type');
    const small = this.hasAttribute('small');
    const label = this.getAttribute('label') || 'Loading...';

    this.style.display = 'inline-block';

    // The host element itself will be the spinner container
    this.classList.add(`spinner-${variant}`);
    this.setAttribute('role', 'status');

    if (type) {
      this.classList.add(`text-${type}`);
    }

    if (small) {
      this.classList.add(`spinner-${variant}-sm`);
    }

    // Accessibility label
    // If there's already content, we might want to preserve it or just add the hidden label
    // Bootstrap standard is to have a visually-hidden span inside.
    const span = document.createElement('span');
    span.className = 'visually-hidden';
    span.textContent = label;
    
    // Clear any placeholder text if it exists (though usually spinners are empty)
    this.innerHTML = '';
    this.appendChild(span);
  }
}

// Define the custom element
if (!customElements.get('bs-spinner')) {
  customElements.define('bs-spinner', BsSpinner);
}
