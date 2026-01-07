/**
 * A custom web component for a Bootstrap placeholder.
 *
 * This component wraps the standard Bootstrap placeholder structure.
 * It does not use Shadow DOM to ensure full compatibility with Bootstrap's global CSS.
 *
 * Attributes:
 * - col: Grid column width (1-12).
 * - width: Custom width (e.g., '75%', '100px').
 * - size: Sizing modifier ('lg', 'sm', 'xs').
 * - variant: Theme color ('primary', 'success', etc.).
 * - animation: Animation style ('glow', 'wave'). Note: animation is typically 
 *              applied to a parent element, so this component will wrap its 
 *              internal placeholder in a div with the animation class if provided.
 *
 * Static Methods:
 * - placeholderize(element, options): Replaces the content of an element with placeholders.
 */
class BsPlaceholder extends HTMLElement {
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

    const col = this.getAttribute('col');
    const width = this.getAttribute('width');
    const size = this.getAttribute('size');
    const variant = this.getAttribute('variant');
    const animation = this.getAttribute('animation');
    const hostClasses = this.getAttribute('class');

    // To avoid the host collapsing when children use percentage widths,
    // we apply the width-related classes and styles to the host itself.
    this.style.display = 'inline-block';
    if (col) {
      this.classList.add(`col-${col}`);
    }
    if (width) {
      this.style.width = width;
    }

    // To support animation on the component itself, we follow Bootstrap's pattern.
    const wrapper = document.createElement('div');
    if (animation) {
      wrapper.className = `placeholder-${animation}`;
    }

    // Pass through classes from the host element to the underlying wrapper
    // per guidelines, but filter out width-related classes that we want 
    // to keep on the host for proper layout.
    if (hostClasses) {
      const filtered = hostClasses.split(' ').filter(c => !c.startsWith('col-') && !c.startsWith('w-')).join(' ');
      if (filtered) {
        wrapper.className += ` ${filtered}`;
      }
    }

    const span = document.createElement('span');
    span.innerHTML = '&nbsp;';
    span.classList.add('placeholder');
    
    // The inner span should always fill its container (the host/wrapper)
    // to ensure the placeholder is visible and respects the layout.
    span.style.width = '100%';

    if (size) span.classList.add(`placeholder-${size}`);
    if (variant) span.classList.add(`bg-${variant}`);
    
    wrapper.appendChild(span);
    this.innerHTML = '';
    this.appendChild(wrapper);
  }

  /**
   * Replaces the content of the given element with placeholders that match the size 
   * of the original content as closely as possible.
   * 
   * @param {HTMLElement} element - The container element to placeholderize.
   * @param {Object} options - Options for placeholder generation.
   * @param {string} options.animation - 'glow' or 'wave'.
   * @param {string} options.variant - Bootstrap theme color.
   * @param {boolean} options.preserveHeight - Whether to try and preserve height (using &nbsp;).
   */
  static placeholderize(element, options = {}) {
    const animation = options.animation || 'glow';
    const variant = options.variant || '';
    
    // Find common text-containing elements and images
    const targets = element.querySelectorAll('h1, h2, h3, h4, h5, h6, p, a, button, .btn, span:not(.placeholder), img');
    
    targets.forEach(target => {
      // Don't process if it's already a placeholder or inside one we just processed
      if (target.closest('.placeholder-glow, .placeholder-wave')) return;

      const rect = target.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      // Handle images specifically
      if (target.tagName === 'IMG') {
        if (!target.hasAttribute('data-original-src')) {
          target.setAttribute('data-original-src', target.src);
          // We can't easily "clear" an img and keep its size without replacing it or using a wrapper
          // Let's replace it with a div of the same size
          const div = document.createElement('div');
          div.className = target.className + ' placeholder';
          div.style.width = `${rect.width}px`;
          div.style.height = `${rect.height}px`;
          div.setAttribute('data-original-element', 'img');
          div.setAttribute('data-original-src', target.src);
          target.replaceWith(div);
        }
        return;
      }

      const isButton = target.classList.contains('btn') || target.tagName === 'BUTTON';

      // Save original content if not already saved
      if (!target.hasAttribute('data-original-content')) {
        target.setAttribute('data-original-content', target.innerHTML);
        if (isButton) {
          target.setAttribute('data-original-classes', target.className);
          if (target.tagName === 'BUTTON' && target.disabled) {
            target.setAttribute('data-original-disabled', 'true');
          }
          // Save original width to restore it later if we change it
          target.setAttribute('data-original-width', target.style.width);
        }
      }

      // Clear content
      target.innerHTML = '';
      target.classList.add(`placeholder-${animation}`);

      if (isButton) {
        target.classList.add('placeholder');
        target.classList.add('disabled');
        target.setAttribute('aria-disabled', 'true');
        if (target.tagName === 'BUTTON') target.disabled = true;
        if (variant) target.classList.add(`bg-${variant}`);
        target.style.width = `${rect.width}px`;
      } else {
        // Create a placeholder that matches the original width
        const ph = document.createElement('span');
        ph.className = 'placeholder';
        ph.style.width = `${rect.width}px`;
        ph.innerHTML = '&nbsp;';
        if (variant) ph.classList.add(`bg-${variant}`);
        target.appendChild(ph);
      }
    });
  }

  /**
   * Restores the original content of an element that was placeholderized.
   * @param {HTMLElement} element 
   */
  static restore(element) {
    // Restore text elements and buttons
    const textTargets = element.querySelectorAll('[data-original-content]');
    textTargets.forEach(target => {
      target.innerHTML = target.getAttribute('data-original-content');
      target.removeAttribute('data-original-content');
      
      if (target.hasAttribute('data-original-classes')) {
        target.className = target.getAttribute('data-original-classes');
        target.removeAttribute('data-original-classes');
      } else {
        target.classList.remove('placeholder-glow', 'placeholder-wave');
      }

      if (target.hasAttribute('data-original-width')) {
        target.style.width = target.getAttribute('data-original-width');
        target.removeAttribute('data-original-width');
      }

      target.removeAttribute('aria-disabled');
      if (target.tagName === 'BUTTON') {
        if (target.hasAttribute('data-original-disabled')) {
          target.disabled = true;
          target.removeAttribute('data-original-disabled');
        } else {
          target.disabled = false;
        }
      }
    });

    // Restore images
    const imgTargets = element.querySelectorAll('[data-original-element="img"]');
    imgTargets.forEach(target => {
        const img = document.createElement('img');
        img.className = target.className;
        img.classList.remove('placeholder');
        img.src = target.getAttribute('data-original-src');
        target.replaceWith(img);
    });
  }
}

// Define the custom element
if (!customElements.get('bs-placeholder')) {
  customElements.define('bs-placeholder', BsPlaceholder);
}
