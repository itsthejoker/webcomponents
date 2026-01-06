/**
 * A custom web component for a Bootstrap toast.
 *
 * This component wraps the standard Bootstrap toast structure. It does not use
 * Shadow DOM to ensure full compatibility with Bootstrap's global CSS.
 *
 * Attributes:
 * - title: The title text for the toast header.
 * - time: The time/subtitle text for the toast header.
 * - autohide: Boolean attribute (default: true). Set to "false" to disable.
 * - delay: Delay in milliseconds before hiding the toast (default: 5000).
 * - animation: Boolean attribute (default: true). Set to "false" to disable.
 * - type: Contextual variant for color schemes (e.g., 'primary', 'success').
 * - show: Boolean attribute; if present, the toast will be shown immediately.
 *
 * Slots:
 * - icon: Custom icon/image for the header.
 * - header: Custom header content (overrides title and time attributes).
 * - (default): Content for the toast body.
 */
class BsToast extends HTMLElement {
  constructor() {
    super();
    this.toast = null;
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
    if (this.toast) {
      this.toast.dispose();
      this.toast = null;
    }
  }

  _render() {
    if (this._initialized) return;
    this._initialized = true;

    const titleAttr = this.getAttribute('title');
    const timeAttr = this.getAttribute('time');
    const typeAttr = this.getAttribute('type');
    const autohide = this.getAttribute('autohide') !== 'false';
    const delay = parseInt(this.getAttribute('delay') || '5000', 10);
    const animation = this.getAttribute('animation') !== 'false';
    const shouldShow = this.hasAttribute('show');

    // Create the internal toast structure
    const toastContainer = document.createElement('div');
    toastContainer.className = 'toast';
    if (animation) toastContainer.classList.add('fade');
    if (shouldShow) toastContainer.classList.add('show');

    // Transfer any classes from the host element to the internal toast container
    if (this.classList.length > 0) {
      this.classList.forEach(cls => toastContainer.classList.add(cls));
      this.className = '';
    }

    // Move accessibility attributes to the internal container
    const role = this.getAttribute('role') || 'alert';
    const ariaLive = this.getAttribute('aria-live') || 'assertive';
    const ariaAtomic = this.getAttribute('aria-atomic') || 'true';
    
    toastContainer.setAttribute('role', role);
    toastContainer.setAttribute('aria-live', ariaLive);
    toastContainer.setAttribute('aria-atomic', ariaAtomic);

    this.removeAttribute('role');
    this.removeAttribute('aria-live');
    this.removeAttribute('aria-atomic');

    if (typeAttr) {
      toastContainer.classList.add(`text-bg-${typeAttr}`, 'border-0');
    }

    // Capture children and clear innerHTML for the new structure
    const fragment = document.createDocumentFragment();
    while (this.firstChild) {
      fragment.appendChild(this.firstChild);
    }

    // Containers for distribution
    const iconSlot = document.createElement('div');
    const headerSlot = document.createElement('div');
    const bodySlot = document.createElement('div');

    // Distribute children
    Array.from(fragment.childNodes).forEach(child => {
      if (child.nodeType === Node.ELEMENT_NODE && child.hasAttribute('slot')) {
        const slot = child.getAttribute('slot');
        if (slot === 'icon') {
          iconSlot.appendChild(child);
        } else if (slot === 'header') {
          headerSlot.appendChild(child);
        } else {
          bodySlot.appendChild(child);
        }
      } else {
        bodySlot.appendChild(child);
      }
    });

    // Build the final structure
    this.innerHTML = '';

    const hasHeader = !!(titleAttr || timeAttr || headerSlot.hasChildNodes() || iconSlot.hasChildNodes());
    const hasCustomBody = Array.from(bodySlot.childNodes).some(child => 
      child.nodeType === Node.ELEMENT_NODE && (child.classList.contains('toast-body') || child.classList.contains('d-flex'))
    );

    if (hasHeader) {
      const headerDiv = document.createElement('div');
      headerDiv.className = 'toast-header';

      // Icon
      if (iconSlot.hasChildNodes()) {
        while (iconSlot.firstChild) {
          const child = iconSlot.firstChild;
          if (child instanceof HTMLElement) {
            child.classList.add('rounded', 'me-2');
          }
          headerDiv.appendChild(child);
        }
      }

      // Title/Header content
      if (headerSlot.hasChildNodes()) {
        while (headerSlot.firstChild) {
          headerDiv.appendChild(headerSlot.firstChild);
        }
      } else if (titleAttr) {
        const strong = document.createElement('strong');
        strong.className = 'me-auto';
        strong.textContent = titleAttr;
        headerDiv.appendChild(strong);
      }

      // Time
      if (timeAttr) {
        const small = document.createElement('small');
        small.className = 'text-body-secondary ms-2';
        small.textContent = timeAttr;
        headerDiv.appendChild(small);
      }

      // Close button
      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'btn-close ms-2';
      if (typeAttr) closeBtn.classList.add('btn-close-white');
      closeBtn.setAttribute('data-bs-dismiss', 'toast');
      closeBtn.setAttribute('aria-label', 'Close');
      headerDiv.appendChild(closeBtn);

      toastContainer.appendChild(headerDiv);

      // Body
      if (hasCustomBody) {
        while (bodySlot.firstChild) {
          toastContainer.appendChild(bodySlot.firstChild);
        }
      } else {
        const bodyDiv = document.createElement('div');
        bodyDiv.className = 'toast-body';
        while (bodySlot.firstChild) {
          bodyDiv.appendChild(bodySlot.firstChild);
        }
        toastContainer.appendChild(bodyDiv);
      }
    } else {
      // Custom content style (no header)
      if (hasCustomBody) {
        // User provided their own structure, just append it
        while (bodySlot.firstChild) {
          toastContainer.appendChild(bodySlot.firstChild);
        }
      } else {
        // Shorthand style - aligns with Bootstrap's recommended pattern for simple toasts
        toastContainer.classList.add('align-items-center');

        const wrapper = document.createElement('div');
        wrapper.className = 'd-flex';

        const bodyDiv = document.createElement('div');
        bodyDiv.className = 'toast-body';
        while (bodySlot.firstChild) {
          bodyDiv.appendChild(bodySlot.firstChild);
        }
        wrapper.appendChild(bodyDiv);

        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'btn-close me-2 m-auto';
        if (typeAttr) {
          closeBtn.classList.add('btn-close-white');
        }
        closeBtn.setAttribute('data-bs-dismiss', 'toast');
        closeBtn.setAttribute('aria-label', 'Close');
        wrapper.appendChild(closeBtn);

        toastContainer.appendChild(wrapper);
      }
    }

    this.appendChild(toastContainer);

    // Initialize Bootstrap Toast
    if (window.bootstrap && window.bootstrap.Toast) {
      this.toast = new bootstrap.Toast(toastContainer, {
        autohide: autohide,
        delay: delay,
        animation: animation
      });

      if (shouldShow) {
        this.toast.show();
      }
    }
  }

  show() {
    this._ensureToast();
    if (this.toast) {
      this.toast.show();
    }
  }

  hide() {
    this._ensureToast();
    if (this.toast) {
      this.toast.hide();
    }
  }

  dispose() {
    if (this.toast) {
      this.toast.dispose();
      this.toast = null;
    }
  }

  _ensureToast() {
    if (!this._initialized) {
      this._render();
    }
    if (!this.toast && window.bootstrap && window.bootstrap.Toast) {
        const toastContainer = this.querySelector('.toast');
        if (!toastContainer) return;

        const autohide = this.getAttribute('autohide') !== 'false';
        const delay = parseInt(this.getAttribute('delay') || '5000', 10);
        const animation = this.getAttribute('animation') !== 'false';
        this.toast = new bootstrap.Toast(toastContainer, {
            autohide: autohide,
            delay: delay,
            animation: animation
        });
    }
  }
}

// Define the custom element
if (!customElements.get('bs-toast')) {
  customElements.define('bs-toast', BsToast);
}
