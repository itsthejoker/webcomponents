/**
 * A custom web component for a Bootstrap tooltip.
 *
 * This component wraps its content and attaches a Bootstrap tooltip to itself.
 * It does not use Shadow DOM to ensure full compatibility with Bootstrap's global CSS.
 *
 * Attributes:
 * - title: The tooltip title (or use data-bs-title).
 * - placement: 'top', 'bottom', 'left', 'right', 'auto'. Default: 'top'.
 * - animation: Boolean (default: true).
 * - delay: Delay in ms, or object {show: 500, hide: 100}.
 * - html: Boolean; if present, allows HTML in title.
 * - trigger: 'click', 'hover', 'focus', 'manual'. Default: 'hover focus'.
 * - custom-class: Custom class for the tooltip.
 * - offset: Offset of the tooltip relative to its target.
 *
 * Static Methods:
 * - BsTooltip.init(element, options): Initializes a tooltip on the given element.
 * - BsTooltip.dispose(element): Disposes of the tooltip on the given element.
 * - BsTooltip.reinit(element): Re-initializes the tooltip on the given element.
 * - BsTooltip.initAll(container): Initializes all tooltips within a container.
 */
class BsTooltip extends HTMLElement {
  constructor() {
    super();
    this.tooltip = null;
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
    this.dispose();
  }

  _render() {
    if (this._initialized) return;
    this._initialized = true;

    // Set display to inline-block to wrap content correctly
    if (!this.style.display) {
      this.style.display = 'inline-block';
    }

    const title = this.getAttribute('data-bs-title') || this.getAttribute('title') || '';
    const placement = this.getAttribute('placement') || 'top';
    const animation = this.getAttribute('animation') !== 'false';
    const delay = this.getAttribute('delay') || 0;
    const html = this.hasAttribute('html');
    const trigger = this.getAttribute('trigger') || 'hover focus';
    const customClass = this.getAttribute('custom-class') || '';
    const offset = this.getAttribute('offset') || [0, 6];

    if (window.bootstrap && window.bootstrap.Tooltip) {
      this.tooltip = new bootstrap.Tooltip(this, {
        title: title,
        placement: placement,
        animation: animation,
        delay: delay,
        html: html,
        trigger: trigger,
        customClass: customClass,
        offset: offset
      });
    }
  }

  /**
   * Shows the tooltip.
   */
  show() {
    if (this.tooltip) this.tooltip.show();
  }

  /**
   * Hides the tooltip.
   */
  hide() {
    if (this.tooltip) this.tooltip.hide();
  }

  /**
   * Toggles the tooltip.
   */
  toggle() {
    if (this.tooltip) this.tooltip.toggle();
  }

  /**
   * Updates the tooltip position.
   */
  update() {
    if (this.tooltip) this.tooltip.update();
  }

  /**
   * Disposes of the tooltip.
   */
  dispose() {
    if (this.tooltip) {
      // Prevent crash if a hide transition is in progress.
      // Bootstrap's dispose() sets internal state to null, but pending callbacks
      // (like the one from _queueCallback) might still try to access it.
      // By overriding isWithActiveTrigger to return true, we cause any pending 
      // completion callbacks to return early and do nothing.
      this.tooltip.isWithActiveTrigger = () => true;

      this.tooltip.dispose();
      this.tooltip = null;
    }
  }

  /**
   * Re-initializes the tooltip with current attributes.
   */
  reinit() {
    this.dispose();
    this._initialized = false;
    this._render();
  }

  // --- Static Management System ---

  /**
   * Initializes a tooltip on any element.
   * @param {HTMLElement|string} element 
   * @param {Object} options 
   * @returns {bootstrap.Tooltip}
   */
  static init(element, options = {}) {
    if (!window.bootstrap || !window.bootstrap.Tooltip) return null;
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return null;
    return bootstrap.Tooltip.getOrCreateInstance(el, options);
  }

  /**
   * Disposes of a tooltip on any element.
   * @param {HTMLElement|string} element 
   */
  static dispose(element) {
    if (!window.bootstrap || !window.bootstrap.Tooltip) return;
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return;
    const instance = bootstrap.Tooltip.getInstance(el);
    if (instance) {
      // Prevent crash if a hide transition is in progress.
      instance.isWithActiveTrigger = () => true;
      instance.dispose();
    }
  }

  /**
   * Re-initializes a tooltip on any element.
   * @param {HTMLElement|string} element 
   * @returns {bootstrap.Tooltip}
   */
  static reinit(element) {
    if (!window.bootstrap || !window.bootstrap.Tooltip) return null;
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return null;
    
    this.dispose(el);
    return this.init(el);
  }

  /**
   * Initializes all tooltips in a container that have data-bs-toggle="tooltip".
   * Also re-initializes all <bs-tooltip> components.
   * @param {HTMLElement} container 
   */
  static initAll(container = document.body) {
    if (!window.bootstrap || !window.bootstrap.Tooltip) return;

    // Standard elements
    const triggers = container.querySelectorAll('[data-bs-toggle="tooltip"]');
    triggers.forEach(el => {
      bootstrap.Tooltip.getOrCreateInstance(el);
    });

    // Custom components
    const components = container.querySelectorAll('bs-tooltip');
    components.forEach(comp => {
      if (comp.reinit) {
        comp.reinit();
      }
    });
  }

  /**
   * Disposes of all tooltips in a container.
   * @param {HTMLElement} container 
   */
  static disposeAll(container = document.body) {
    if (!window.bootstrap || !window.bootstrap.Tooltip) return;

    const triggers = container.querySelectorAll('[data-bs-toggle="tooltip"]');
    triggers.forEach(el => {
      this.dispose(el);
    });

    const components = container.querySelectorAll('bs-tooltip');
    components.forEach(comp => {
      if (comp.dispose) comp.dispose();
    });
  }
}

// Define the custom element
if (!customElements.get('bs-tooltip')) {
  customElements.define('bs-tooltip', BsTooltip);
}
