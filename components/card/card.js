/**
 * A custom web component for a Bootstrap card.
 *
 * This component wraps the standard Bootstrap card structure. It does not use
 * Shadow DOM to ensure full compatibility with Bootstrap's global CSS.
 *
 * Attributes:
 * - title: The title of the card.
 * - subtitle: The subtitle of the card.
 * - img-top: URL for the image at the top of the card.
 * - img-bottom: URL for the image at the bottom of the card.
 * - img-alt: Alt text for the images.
 * - text-bg: Background color variant (e.g., 'primary', 'dark').
 * - border: Border color variant (e.g., 'primary', 'success').
 * - no-body: Boolean attribute; if present, the default slot content is not wrapped in a .card-body div.
 *
 * Slots:
 * - header: Content for the card header.
 * - footer: Content for the card footer.
 * - title: Custom title element (overrides title attribute).
 * - subtitle: Custom subtitle element (overrides subtitle attribute).
 * - image-top: Custom element for the top image (overrides img-top attribute).
 * - image-bottom: Custom element for the bottom image (overrides img-bottom attribute).
 * - (default): Content for the card body (wrapped in .card-body unless no-body is present).
 */
class BsCard extends HTMLElement {
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

    const titleAttr = this.getAttribute('title');
    const subtitleAttr = this.getAttribute('subtitle');
    const imgTopAttr = this.getAttribute('img-top');
    const imgBottomAttr = this.getAttribute('img-bottom');
    const imgAltAttr = this.getAttribute('img-alt') || '';
    const textBgAttr = this.getAttribute('text-bg');
    const borderAttr = this.getAttribute('border');
    const noBody = this.hasAttribute('no-body');

    this.classList.add('card');
    if (textBgAttr) {
      this.classList.add(`text-bg-${textBgAttr}`);
    }
    if (borderAttr) {
      this.classList.add(`border-${borderAttr}`);
    }

    // Capture children and clear innerHTML for the new structure
    const fragment = document.createDocumentFragment();
    while (this.firstChild) {
      fragment.appendChild(this.firstChild);
    }

    this.innerHTML = `
      <div class="card-img-top-container"></div>
      <div class="card-header-container"></div>
      <div class="card-body-container"></div>
      <div class="card-footer-container"></div>
      <div class="card-img-bottom-container"></div>
    `;

    const imgTopContainer = this.querySelector('.card-img-top-container');
    const headerContainer = this.querySelector('.card-header-container');
    const bodyContainer = this.querySelector('.card-body-container');
    const footerContainer = this.querySelector('.card-footer-container');
    const imgBottomContainer = this.querySelector('.card-img-bottom-container');

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
