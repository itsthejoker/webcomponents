/**
 * A custom web component for a Bootstrap spinner.
 *
 * This component wraps the standard Bootstrap spinner structure. It does not use
 * Shadow DOM to ensure full compatibility with Bootstrap's global CSS.
 *
 * @element bs-spinner
 * @attribute {string} [animation=border] - The type of spinner ('border' or 'grow').
 * @attribute {string} [variant] - The contextual color (e.g., 'primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark').
 * @attribute {boolean} [small] - If present, the spinner will be smaller.
 * @attribute {string} [label=Loading...] - Accessibility text for the spinner.
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

    const animation = this.getAttribute('animation') || 'border';
    const variant = this.getAttribute('variant');
    const small = this.hasAttribute('small');
    const label = this.getAttribute('label') || 'Loading...';

    this.style.display = 'inline-block';

    const spinnerElement = document.createElement('div');
    spinnerElement.className = `spinner-${animation}`;
    spinnerElement.setAttribute('role', 'status');

    if (variant) {
      spinnerElement.classList.add(`text-${variant}`);
    }

    if (small) {
      spinnerElement.classList.add(`spinner-${animation}-sm`);
    }

    // Pass through classes from the host element to the underlying div
    const hostClasses = this.getAttribute('class');
    if (hostClasses) {
      spinnerElement.className += ` ${hostClasses}`;
    }

    // Accessibility label
    // If there's already content, we might want to preserve it or just add the hidden label
    // Bootstrap standard is to have a visually-hidden span inside.
    const span = document.createElement('span');
    span.className = 'visually-hidden';
    span.textContent = label;
    
    spinnerElement.appendChild(span);
    this.innerHTML = '';
    this.appendChild(spinnerElement);
  }
}

// Define the custom element
if (!customElements.get('bs-spinner')) {
  customElements.define('bs-spinner', BsSpinner);
}
