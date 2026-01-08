/**
 * A custom web component for a Bootstrap card.
 *
 * This component wraps the standard Bootstrap card structure. It does not use
 * Shadow DOM to ensure full compatibility with Bootstrap's global CSS.
 *
 * @element bs-card
 *
 * @attr {string} title - The title of the card.
 * @attr {string} subtitle - The subtitle of the card.
 * @attr {string} img-top - URL for the image at the top of the card.
 * @attr {string} img-bottom - URL for the image at the bottom of the card.
 * @attr {string} img-alt - Alt text for the images.
 * @attr {string} text-bg - Background color variant (e.g., 'primary', 'dark').
 * @attr {string} border - Border color variant (e.g., 'primary', 'success').
 * @attr {boolean} no-body - If present, the default slot content is not wrapped in a .card-body div.
 *
 * @slot header - Content for the card header.
 * @slot footer - Content for the card footer.
 * @slot title - Custom title element (overrides title attribute).
 * @slot subtitle - Custom subtitle element (overrides subtitle attribute).
 * @slot image-top - Custom element for the top image (overrides img-top attribute).
 * @slot image-bottom - Custom element for the bottom image (overrides img-bottom attribute).
 * @slot - Content for the card body (wrapped in .card-body unless no-body is present).
 *
 * @example
 * <bs-card title="Card title" subtitle="Card subtitle">
 *   Some quick example text to build on the card title and make up the bulk of the card's content.
 * </bs-card>
 */
class BsCard extends HTMLElement {
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
   * Renders the card structure and distributes slots.
   * @private
   */
  _render() {
    if (this._initialized) return;
    this._initialized = true;

    const titleAttr = this.getAttribute('title');
    const subtitleAttr = this.getAttribute('subtitle');
    const imgTopAttr = this.getAttribute('img-top');
    const imgBottomAttr = this.getAttribute('img-bottom');
    const imgAltAttr = this.getAttribute('img-alt') || '';
    const textBgAttr = this.getAttribute('text-bg');
    const borderAttr = this.getAttribute('border');
    const noBody = this.hasAttribute('no-body');

    this.style.display = 'block';

    const cardElement = document.createElement('div');
    cardElement.className = 'card';
    
    // Pass through classes from the host element to the underlying div
    const hostClasses = this.getAttribute('class');
    if (hostClasses) {
      cardElement.className += ` ${hostClasses}`;
    }

    if (textBgAttr) {
      cardElement.classList.add(`text-bg-${textBgAttr}`);
    }
    if (borderAttr) {
      cardElement.classList.add(`border-${borderAttr}`);
    }

    // Capture children and clear innerHTML for the new structure
    const fragment = document.createDocumentFragment();
    while (this.firstChild) {
      fragment.appendChild(this.firstChild);
    }

    cardElement.innerHTML = `
      <div class="card-img-top-container"></div>
      <div class="card-header-container"></div>
      <div class="card-body-container"></div>
      <div class="card-footer-container"></div>
      <div class="card-img-bottom-container"></div>
    `;

    this.innerHTML = '';
    this.appendChild(cardElement);

    const imgTopContainer = cardElement.querySelector('.card-img-top-container');
    const headerContainer = cardElement.querySelector('.card-header-container');
    const bodyContainer = cardElement.querySelector('.card-body-container');
    const footerContainer = cardElement.querySelector('.card-footer-container');
    const imgBottomContainer = cardElement.querySelector('.card-img-bottom-container');

    // Create the body structure if not no-body
    let actualBody = bodyContainer;
    if (!noBody) {
      bodyContainer.innerHTML = `<div class="card-body"></div>`;
      actualBody = bodyContainer.querySelector('.card-body');
      
      if (titleAttr) {
        const h5 = document.createElement('h5');
        h5.className = 'card-title';
        h5.textContent = titleAttr;
        actualBody.appendChild(h5);
      }
      if (subtitleAttr) {
        const h6 = document.createElement('h6');
        h6.className = 'card-subtitle mb-2 text-body-secondary';
        h6.textContent = subtitleAttr;
        actualBody.appendChild(h6);
      }
    }

    // Initial image setup from attributes
    if (imgTopAttr) {
      const img = document.createElement('img');
      img.src = imgTopAttr;
      img.className = 'card-img-top';
      img.alt = imgAltAttr;
      imgTopContainer.appendChild(img);
    }
    if (imgBottomAttr) {
      const img = document.createElement('img');
      img.src = imgBottomAttr;
      img.className = 'card-img-bottom';
      img.alt = imgAltAttr;
      imgBottomContainer.appendChild(img);
    }

    // Distribute children to their respective slots
    Array.from(fragment.childNodes).forEach(child => {
      if (child.nodeType === Node.ELEMENT_NODE && child.hasAttribute('slot')) {
        const slot = child.getAttribute('slot');
        switch (slot) {
          case 'header':
            if (headerContainer.innerHTML === '') {
              headerContainer.innerHTML = '<div class="card-header"></div>';
            }
            headerContainer.querySelector('.card-header').appendChild(child);
            break;
          case 'footer':
            if (footerContainer.innerHTML === '') {
              footerContainer.innerHTML = '<div class="card-footer"></div>';
            }
            footerContainer.querySelector('.card-footer').appendChild(child);
            break;
          case 'image-top':
            imgTopContainer.innerHTML = ''; // Override attribute
            child.classList.add('card-img-top');
            imgTopContainer.appendChild(child);
            break;
          case 'image-bottom':
            imgBottomContainer.innerHTML = ''; // Override attribute
            child.classList.add('card-img-bottom');
            imgBottomContainer.appendChild(child);
            break;
          case 'title':
            if (!noBody) {
              const titleEl = actualBody.querySelector('.card-title');
              if (titleEl) {
                titleEl.innerHTML = '';
                titleEl.appendChild(child);
              } else {
                const h5 = document.createElement('h5');
                h5.className = 'card-title';
                h5.appendChild(child);
                // Prepend or insert at start of body
                actualBody.insertBefore(h5, actualBody.firstChild);
              }
            } else {
              actualBody.appendChild(child);
            }
            break;
          case 'subtitle':
            if (!noBody) {
              const subtitleEl = actualBody.querySelector('.card-subtitle');
              if (subtitleEl) {
                subtitleEl.innerHTML = '';
                subtitleEl.appendChild(child);
              } else {
                const h6 = document.createElement('h6');
                h6.className = 'card-subtitle mb-2 text-body-secondary';
                h6.appendChild(child);
                // Insert after title if it exists, otherwise at start
                const titleEl = actualBody.querySelector('.card-title');
                if (titleEl) {
                  titleEl.after(h6);
                } else {
                  actualBody.insertBefore(h6, actualBody.firstChild);
                }
              }
            } else {
              actualBody.appendChild(child);
            }
            break;
          default:
            actualBody.appendChild(child);
            break;
        }
      } else {
        // Text nodes and elements without slot attributes go to the body
        actualBody.appendChild(child);
      }
    });

    // Cleanup empty containers
    [headerContainer, imgTopContainer, imgBottomContainer, footerContainer].forEach(container => {
      if (container.childNodes.length === 0) {
        container.remove();
      }
    });
    
    // If no-body and body container is empty, remove it too
    if (noBody && bodyContainer.childNodes.length === 0) {
      bodyContainer.remove();
    } else if (!noBody) {
        // If we have an actual body, check if it's empty (though it might have title/subtitle)
        if (actualBody.childNodes.length === 0) {
            bodyContainer.remove();
        }
    }
  }
}

// Define the custom element
if (!customElements.get('bs-card')) {
  customElements.define('bs-card', BsCard);
}
