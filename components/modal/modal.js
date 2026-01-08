/**
 * A custom web component for a Bootstrap modal.
 *
 * This component wraps the standard Bootstrap modal structure and initializes
 * the Bootstrap Modal JavaScript plugin. It does not use Shadow DOM to ensure
 * full compatibility with Bootstrap's global CSS and existing JavaScript.
 *
 * @element bs-modal
 *
 * @attribute {string} [title] - The title of the modal (displayed in the header).
 * @attribute {boolean} [fade=true] - Whether to use the fade animation.
 * @attribute {string} [backdrop='true'] - The backdrop option: 'true', 'false', or 'static'.
 * @attribute {string} [keyboard='true'] - Whether the modal can be closed with the escape key: 'true' or 'false'.
 * @attribute {string} [size] - The size of the modal: 'sm', 'lg', 'xl'.
 * @attribute {boolean} [centered] - If present, the modal will be vertically centered.
 * @attribute {boolean} [scrollable] - If present, the modal body will be scrollable.
 * @attribute {string} [fullscreen] - Boolean or breakpoint: 'true', 'sm', 'md', 'lg', 'xl', 'xxl'.
 *
 * @slot title - Custom title element (overrides the title attribute).
 * @slot body - Content for the modal body.
 * @slot footer - Content for the modal footer.
 * @slot - Default slot for content (placed in the modal body).
 */
class BsModal extends HTMLElement {
  constructor() {
    super();
    this.modal = null;
    this._initialized = false;
  }

  connectedCallback() {
    if (this._initialized) return;

    // Use a timeout to ensure that child elements are parsed before rendering.
    // This is necessary when the component is used directly in HTML without deferring the script.
    setTimeout(() => {
      this._render();
    }, 0);
  }

  disconnectedCallback() {
    if (this.modal) {
      this.modal.dispose();
      this.modal = null;
    }
  }

  _render() {
    if (this._initialized) return;
    this._initialized = true;

    const title = this.getAttribute('title') || '';
    const fade = this.hasAttribute('fade') || this.getAttribute('fade') !== 'false';
    const backdrop = this.getAttribute('backdrop') || 'true';
    const keyboard = this.getAttribute('keyboard') || 'true';
    const size = this.getAttribute('size');
    const centered = this.hasAttribute('centered');
    const scrollable = this.hasAttribute('scrollable');
    const fullscreen = this.getAttribute('fullscreen');

    // Create the internal modal container
    const modalElement = document.createElement('div');
    modalElement.className = 'modal';
    if (fade) {
      modalElement.classList.add('fade');
    }
    modalElement.setAttribute('tabindex', '-1');
    modalElement.setAttribute('aria-hidden', 'true');
    modalElement.setAttribute('data-bs-backdrop', backdrop);
    modalElement.setAttribute('data-bs-keyboard', keyboard);

    // Pass through classes from the host element to the underlying div
    const hostClasses = this.getAttribute('class');
    if (hostClasses) {
      modalElement.className += ` ${hostClasses}`;
    }

    const sizeClass = size ? `modal-${size}` : '';
    const centeredClass = centered ? 'modal-dialog-centered' : '';
    const scrollableClass = scrollable ? 'modal-dialog-scrollable' : '';
    
    let fullscreenClass = '';
    if (fullscreen === '') {
      fullscreenClass = 'modal-fullscreen';
    } else if (fullscreen) {
      fullscreenClass = (fullscreen === 'true') ? 'modal-fullscreen' : `modal-fullscreen-${fullscreen}-down`;
    }

    // Capture children and clear innerHTML for the new structure
    const fragment = document.createDocumentFragment();
    while (this.firstChild) {
      fragment.appendChild(this.firstChild);
    }

    this.innerHTML = '';
    this.appendChild(modalElement);

    modalElement.innerHTML = `
      <div class="modal-dialog ${centeredClass} ${scrollableClass} ${sizeClass} ${fullscreenClass}">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${title}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body"></div>
          <div class="modal-footer"></div>
        </div>
      </div>
    `;

    const bodyContainer = modalElement.querySelector('.modal-body');
    const footerContainer = modalElement.querySelector('.modal-footer');
    const titleContainer = modalElement.querySelector('.modal-title');

    // Distribute children to their respective slots
    Array.from(fragment.childNodes).forEach(child => {
      if (child.nodeType === Node.ELEMENT_NODE && child.hasAttribute('slot')) {
        const slot = child.getAttribute('slot');
        if (slot === 'body') {
          bodyContainer.appendChild(child);
        } else if (slot === 'footer') {
          footerContainer.appendChild(child);
        } else if (slot === 'title') {
          titleContainer.innerHTML = ''; // Overwrite default title attribute
          titleContainer.appendChild(child);
        } else {
          bodyContainer.appendChild(child);
        }
      } else {
        // Text nodes and elements without slot attributes go to the body
        bodyContainer.appendChild(child);
      }
    });

    // Remove footer if it remains empty
    if (footerContainer.childNodes.length === 0) {
      footerContainer.remove();
    }

    // Initialize Bootstrap Modal if the bootstrap object is available globally
    if (window.bootstrap && window.bootstrap.Modal) {
      this.modal = new bootstrap.Modal(modalElement);
    }
  }

  /**
   * Shows the modal.
   */
  show() {
    this._ensureModal();
    if (this.modal) {
      this.modal.show();
    }
  }

  /**
   * Hides the modal.
   */
  hide() {
    if (this.modal) {
      this.modal.hide();
    }
  }

  /**
   * Toggles the modal's visibility.
   */
  toggle() {
    this._ensureModal();
    if (this.modal) {
      this.modal.toggle();
    }
  }

  /**
   * Readjusts the modal's position (useful if height changes).
   */
  handleUpdate() {
    if (this.modal) {
      this.modal.handleUpdate();
    }
  }

  /**
   * Destroys the Bootstrap modal instance.
   */
  dispose() {
    if (this.modal) {
      this.modal.dispose();
      this.modal = null;
    }
  }

  _ensureModal() {
    if (!this._initialized) {
      this._render();
    }
    if (!this.modal && window.bootstrap && window.bootstrap.Modal) {
      const modalEl = this.querySelector('.modal');
      this.modal = new bootstrap.Modal(modalEl);
    }
  }
}

// Define the custom element
if (!customElements.get('bs-modal')) {
  customElements.define('bs-modal', BsModal);
}
