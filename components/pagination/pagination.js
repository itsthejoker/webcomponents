/**
 * A custom web component for Bootstrap pagination.
 *
 * This component wraps the standard Bootstrap pagination structure.
 * It coordinates the creation of the pagination navigation and its items.
 *
 * Attributes:
 * - aria-label: The label for the navigation section (e.g., 'Page navigation').
 * - size: The size of the pagination: 'sm' or 'lg'.
 * - alignment: The horizontal alignment: 'center' or 'end'.
 *
 * Slots:
 * - (default): Content containing <bs-pagination-item> elements.
 */
class BsPagination extends HTMLElement {
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

    const ariaLabel = this.getAttribute('aria-label') || 'Page navigation';
    const size = this.getAttribute('size');
    const alignment = this.getAttribute('alignment');

    // Capture children
    const items = Array.from(this.querySelectorAll('bs-pagination-item'));
    
    // Clear the element
    this.innerHTML = '';

    const nav = document.createElement('nav');
    nav.setAttribute('aria-label', ariaLabel);

    // Pass through classes from the host element to the underlying nav
    const hostClasses = this.getAttribute('class');
    if (hostClasses) {
      nav.className += ` ${hostClasses}`;
    }

    const ul = document.createElement('ul');
    ul.className = 'pagination';
    
    if (size === 'sm') {
      ul.classList.add('pagination-sm');
    } else if (size === 'lg') {
      ul.classList.add('pagination-lg');
    }

    if (alignment === 'center') {
      ul.classList.add('justify-content-center');
    } else if (alignment === 'end') {
      ul.classList.add('justify-content-end');
    }

    items.forEach((item) => {
      const li = document.createElement('li');
      li.className = 'page-item';
      
      const isActive = item.hasAttribute('active');
      const isDisabled = item.hasAttribute('disabled');
      const href = item.getAttribute('href') || '#';
      const label = item.getAttribute('label');

      if (isActive) {
        li.classList.add('active');
      }
      if (isDisabled) {
        li.classList.add('disabled');
      }

      let link;
      if (isDisabled) {
        link = document.createElement('span');
        link.className = 'page-link';
      } else {
        link = document.createElement('a');
        link.className = 'page-link';
        link.href = href;
        if (isActive) {
          link.setAttribute('aria-current', 'page');
        }
      }

      if (label) {
        link.setAttribute('aria-label', label);
      }

      // Move children from bs-pagination-item to link
      while (item.firstChild) {
        link.appendChild(item.firstChild);
      }
      
      // If no children were provided, use a default placeholder or nothing?
      // Usually users will provide text or icon.
      
      li.appendChild(link);
      ul.appendChild(li);
    });

    nav.appendChild(ul);
    this.appendChild(nav);
  }
}

/**
 * A custom web component for a Bootstrap pagination item.
 *
 * This component acts as a data holder for <bs-pagination>.
 *
 * Attributes:
 * - active: Boolean attribute; if present, this item is marked as active.
 * - disabled: Boolean attribute; if present, this item is marked as disabled.
 * - href: The URL the item points to. Default is '#'.
 * - label: Aria-label for the link (useful for icons).
 *
 * Slots:
 * - (default): Content for the pagination link (text or HTML).
 */
class BsPaginationItem extends HTMLElement {
  // BsPaginationItem is a data container, BsPagination does the rendering.
}

if (!customElements.get('bs-pagination')) {
  customElements.define('bs-pagination', BsPagination);
}
if (!customElements.get('bs-pagination-item')) {
  customElements.define('bs-pagination-item', BsPaginationItem);
}
