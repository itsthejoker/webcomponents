/**
 * A custom web component for a Bootstrap carousel.
 *
 * This component acts as a container for `<bs-carousel-item>` elements.
 * It does not use Shadow DOM to ensure full compatibility with Bootstrap's global CSS.
 *
 * @element bs-carousel
 *
 * @attribute {boolean} [indicators] - If present, shows slide indicators.
 * @attribute {boolean} [controls] - If present, shows previous/next controls.
 * @attribute {boolean} [fade] - If present, uses a fade transition instead of a slide.
 * @attribute {boolean} [dark] - If present, uses darker controls, indicators, and captions.
 * @attribute {string} [ride] - 'carousel' (autoplay on load) or 'true' (autoplay after first interaction).
 * @attribute {number} [interval=5000] - The amount of time to delay between automatically cycling an item.
 * @attribute {boolean} [keyboard=true] - Whether the carousel should react to keyboard events.
 * @attribute {string} [pause='hover'] - 'hover' or 'false'.
 * @attribute {boolean} [touch=true] - Whether the carousel should support touch swipe interactions.
 * @attribute {boolean} [wrap=true] - Whether the carousel should cycle continuously or have hard stops.
 *
 * @slot - Default slot for `<bs-carousel-item>` elements.
 */
class BsCarousel extends HTMLElement {
  constructor() {
    super();
    this.carousel = null;
    this._initialized = false;
  }

  connectedCallback() {
    if (this._initialized) return;

    this.style.display = 'block';

    // Use a timeout to ensure that child elements are parsed before rendering.
    setTimeout(() => {
      this._render();
    }, 0);
  }

  disconnectedCallback() {
    if (this.carousel) {
      this.carousel.dispose();
      this.carousel = null;
    }
  }

  _render() {
    if (this._initialized) return;
    this._initialized = true;

    // Ensure the element has an ID for controls and indicators
    if (!this.id) {
      this.id = `carousel-${Math.random().toString(36).substr(2, 9)}`;
    }
    const carouselId = `${this.id}-inner`;

    const showIndicators = this.hasAttribute('indicators');
    const showControls = this.hasAttribute('controls');
    const isFade = this.hasAttribute('fade');
    const isDark = this.hasAttribute('dark');
    
    const ride = this.getAttribute('ride');
    const interval = this.getAttribute('interval');
    const keyboard = this.getAttribute('keyboard');
    const pause = this.getAttribute('pause');
    const touch = this.getAttribute('touch');
    const wrap = this.getAttribute('wrap');

    this.style.display = 'block';

    const carouselElement = document.createElement('div');
    carouselElement.id = carouselId;
    carouselElement.className = 'carousel slide';
    if (isFade) carouselElement.classList.add('carousel-fade');
    if (isDark) carouselElement.classList.add('carousel-dark');

    // Pass through classes from the host element to the underlying div
    const hostClasses = this.getAttribute('class');
    if (hostClasses) {
      carouselElement.className += ` ${hostClasses}`;
    }

    // Capture children
    const fragment = document.createDocumentFragment();
    while (this.firstChild) {
      fragment.appendChild(this.firstChild);
    }

    // Prepare structure
    this.innerHTML = '';
    this.appendChild(carouselElement);

    carouselElement.innerHTML = `
      <div class="carousel-indicators"></div>
      <div class="carousel-inner"></div>
      <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Previous</span>
      </button>
      <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Next</span>
      </button>
    `;

    const indicatorsContainer = carouselElement.querySelector('.carousel-indicators');
    const innerContainer = carouselElement.querySelector('.carousel-inner');
    const prevControl = carouselElement.querySelector('.carousel-control-prev');
    const nextControl = carouselElement.querySelector('.carousel-control-next');

    // Distribute items and count them for indicators
    const items = Array.from(fragment.childNodes).filter(node => 
      node.nodeType === Node.ELEMENT_NODE && (node.localName === 'bs-carousel-item' || node.classList.contains('carousel-item'))
    );

    items.forEach((item, index) => {
      let actualItem = item;
      if (item.localName === 'bs-carousel-item') {
        actualItem = item.querySelector('.carousel-item') || item;
      }
      innerContainer.appendChild(actualItem);
      
      if (showIndicators) {
        const isActive = actualItem.hasAttribute('active') || actualItem.classList.contains('active');
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.setAttribute('data-bs-target', `#${carouselId}`);
        btn.setAttribute('data-bs-slide-to', index);
        btn.setAttribute('aria-label', `Slide ${index + 1}`);
        if (isActive) {
          btn.classList.add('active');
          btn.setAttribute('aria-current', 'true');
        }
        indicatorsContainer.appendChild(btn);
      }
    });

    if (!showIndicators || items.length === 0) {
      indicatorsContainer.remove();
    }

    if (!showControls || items.length === 0) {
      prevControl.remove();
      nextControl.remove();
    }

    // Initialize Bootstrap Carousel if available
    if (window.bootstrap && window.bootstrap.Carousel) {
      const options = {};
      if (interval !== null) options.interval = parseInt(interval);
      if (keyboard !== null) options.keyboard = keyboard !== 'false';
      if (pause !== null) options.pause = pause === 'false' ? false : pause;
      if (ride !== null) options.ride = ride === 'true' ? true : ride;
      if (touch !== null) options.touch = touch !== 'false';
      if (wrap !== null) options.wrap = wrap !== 'false';

      this.carousel = new bootstrap.Carousel(carouselElement, options);
    }
  }

  /**
   * Starts cycling through the carousel items.
   */
  cycle() { this._ensureCarousel() && this.carousel.cycle(); }

  /**
   * Stops the carousel from cycling.
   */
  pause() { this._ensureCarousel() && this.carousel.pause(); }

  /**
   * Cycles to the next item.
   */
  next() { this._ensureCarousel() && this.carousel.next(); }

  /**
   * Cycles to the previous item.
   */
  prev() { this._ensureCarousel() && this.carousel.prev(); }

  /**
   * Cycles the carousel to a particular frame (0-based).
   * @param {number} index - The index of the item to cycle to.
   */
  to(index) { this._ensureCarousel() && this.carousel.to(index); }

  /**
   * Destroys the carousel instance.
   */
  dispose() {
    if (this.carousel) {
      this.carousel.dispose();
      this.carousel = null;
    }
  }

  _ensureCarousel() {
    if (!this._initialized) this._render();
    if (!this.carousel && window.bootstrap && window.bootstrap.Carousel) {
      const carouselEl = this.querySelector('.carousel');
      this.carousel = bootstrap.Carousel.getOrCreateInstance(carouselEl);
    }
    return !!this.carousel;
  }
}

/**
 * A custom web component for a Bootstrap carousel item.
 *
 * @element bs-carousel-item
 *
 * @attribute {boolean} [active] - If present, marks this item as the active slide.
 * @attribute {number} [interval] - The amount of time to delay before automatically cycling to the next item.
 * @attribute {string} [img] - URL for the image.
 * @attribute {string} [alt=''] - Alt text for the image.
 * @attribute {string} [caption-title] - Title for the caption.
 * @attribute {string} [caption-text] - Text for the caption.
 *
 * @slot caption - Custom content for the carousel caption (overrides caption-title and caption-text).
 * @slot - Default slot for content to be placed inside the carousel item (instead of img if img is not provided).
 */
class BsCarouselItem extends HTMLElement {
  constructor() {
    super();
    this._initialized = false;
  }

  connectedCallback() {
    if (this._initialized) return;
    
    setTimeout(() => {
      this._render();
    }, 0);
  }

  _render() {
    if (this._initialized) return;
    this._initialized = true;

    const imgAttr = this.getAttribute('img');
    const altAttr = this.getAttribute('alt') || '';
    const intervalAttr = this.getAttribute('interval');
    const captionTitleAttr = this.getAttribute('caption-title');
    const captionTextAttr = this.getAttribute('caption-text');
    const active = this.hasAttribute('active');

    this.classList.add('carousel-item');
    if (active) this.classList.add('active');

    if (intervalAttr) {
      this.setAttribute('data-bs-interval', intervalAttr);
    }

    // Capture children
    const fragment = document.createDocumentFragment();
    while (this.firstChild) {
      fragment.appendChild(this.firstChild);
    }

    this.innerHTML = `
      <div class="carousel-item-content"></div>
      <div class="carousel-caption d-none d-md-block"></div>
    `;

    const contentContainer = this.querySelector('.carousel-item-content');
    const captionContainer = this.querySelector('.carousel-caption');

    if (imgAttr) {
      const img = document.createElement('img');
      img.src = imgAttr;
      img.alt = altAttr;
      img.className = 'd-block w-100';
      contentContainer.appendChild(img);
    }

    // Handle caption
    let hasCaption = false;
    if (captionTitleAttr) {
      const h5 = document.createElement('h5');
      h5.textContent = captionTitleAttr;
      captionContainer.appendChild(h5);
      hasCaption = true;
    }
    if (captionTextAttr) {
      const p = document.createElement('p');
      p.textContent = captionTextAttr;
      captionContainer.appendChild(p);
      hasCaption = true;
    }

    // Distribute children
    Array.from(fragment.childNodes).forEach(child => {
      if (child.nodeType === Node.ELEMENT_NODE && child.getAttribute('slot') === 'caption') {
        captionContainer.innerHTML = ''; // Override attributes
        captionContainer.appendChild(child);
        hasCaption = true;
      } else {
        // If it's not a caption slot, it goes to content (maybe instead of img)
        contentContainer.appendChild(child);
      }
    });

    if (!hasCaption) {
      captionContainer.remove();
    }
    
    // Flatten content container if it only contains the image or children
    while (contentContainer.firstChild) {
        this.insertBefore(contentContainer.firstChild, captionContainer.parentElement ? captionContainer : null);
    }
    contentContainer.remove();
  }
}

// Define custom elements
if (!customElements.get('bs-carousel')) {
  customElements.define('bs-carousel', BsCarousel);
}
if (!customElements.get('bs-carousel-item')) {
  customElements.define('bs-carousel-item', BsCarouselItem);
}
