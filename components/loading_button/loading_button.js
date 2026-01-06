/**
 * A custom button element that displays a loading spinner when clicked.
 * It uses a variant attribute to apply Bootstrap button styles to an internal button.
 *
 * Examples:
 *
 * 1. With a variant and additional classes:
 *    <loading-button variant="primary" class="mt-2">Submit</loading-button>
 *
 * 2. With an href (rendered as a button):
 *    <loading-button variant="link" href="/dashboard/">Go to Dashboard</loading-button>
 *
 * 3. With a custom onclick handler:
 *    <loading-button variant="danger" onclick="alert('Action triggered!')">Delete</loading-button>
 */
class LoadingButton extends HTMLElement {
  constructor() {
    super();
    this._enableBound = this.enable.bind(this);
    this._handleClickBound = this._handleClick.bind(this);
    this._isLoading = false;
  }

  connectedCallback() {
    if (!this.button) {
      this.originalContent =
        this.innerHTML.trim() || this.getAttribute("value") || "";
      this.render();
    }
    // Listen on the internal button to ensure we catch it at the target phase.
    // This guaranteed execution order ensures our loading state is applied before
    // any bubbling listeners (like inline onclick) on the custom element wrapper.
    this.button.addEventListener("click", this._handleClickBound);
    window.addEventListener("pagehide", this._enableBound);
    window.addEventListener("beforeunload", this._enableBound);
  }

  disconnectedCallback() {
    if (this.button) {
      this.button.removeEventListener("click", this._handleClickBound);
    }
    window.removeEventListener("pagehide", this._enableBound);
    window.removeEventListener("beforeunload", this._enableBound);
    this.enable();
  }

  render() {
    this.button = document.createElement("button");

    const variant = this.getAttribute("variant");
    const userClasses = this.getAttribute("class") || "";

    if (variant) {
      this.button.className = `btn btn-${variant} ${userClasses}`.trim();
    } else {
      this.button.className = userClasses;
    }

    // Copy all attributes from the custom element to the internal button,
    // EXCEPT those that we handle specially or should stay on the wrapper.
    for (const attr of this.attributes) {
      if (
        attr.name !== "id" &&
        attr.name !== "class" &&
        attr.name !== "variant" &&
        !attr.name.startsWith("on")
      ) {
        this.button.setAttribute(attr.name, attr.value);
      }
    }

    // Default to type="submit" if not specified.
    if (!this.button.hasAttribute("type")) {
      this.button.setAttribute("type", "submit");
    }

    this.button.innerHTML = this.originalContent;
    this.innerHTML = "";
    this.appendChild(this.button);
  }

  _handleClick(e) {
    if (this._isLoading || this.button.disabled) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return;
    }

    // Capture the current width to prevent the button from changing size
    // when the spinner is injected.
    const currentWidth = this.button.getBoundingClientRect().width;
    this._originalWidthStyle = this.button.style.width;

    // 1. Mark as loading and visually disable
    this._isLoading = true;

    // 2. Delay the actual modifications to allow the current event
    // (and any natural form submission) to proceed.
    setTimeout(() => {
      this.button.style.width = `${currentWidth}px`;
      this.button.classList.add("disabled");
      this.button.style.pointerEvents = "none";
      this.style.cursor = "wait";
      this.button.innerHTML = `<div class="text-center"><span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span><span class="visually-hidden">Loading...</span></div>`;
      this.button.disabled = true;
    }, 0);

    // We don't stop propagation or prevent default here unless already disabled.
    // The original click event will continue to bubble up to the custom element (loading-button),
    // triggering any 'onclick' or 'click' listeners attached to it.
    // Those listeners will see the button in its new loading state.
  }

  enable() {
    this._isLoading = false;
    if (this.button) {
      this.button.disabled = false;
      this.button.classList.remove("disabled");
      this.button.style.pointerEvents = "";
      this.style.cursor = "";
      this.button.style.width = this._originalWidthStyle || "";
      this.button.innerHTML = this.originalContent;
    }
  }
}

if (!customElements.get("loading-button")) {
  customElements.define("loading-button", LoadingButton);
}
