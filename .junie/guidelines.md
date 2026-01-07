# Development Guidelines

This project is a collection of Web Components that wrap Bootstrap 5 functionality.

## Build/Configuration Instructions

### Prerequisites
- **Bootstrap 5**: These components are designed to work with the latest version of Bootstrap 5. Both the CSS and JS (Bundle) must be included globally in the project where these components are used.

### Setup
There is no build step or package manager required. The components are provided as vanilla JavaScript files.

1.  **Include Bootstrap**: Include the Bootstrap 5 CSS in your `<head>` and the Bootstrap 5 JS Bundle before the closing `</body>` tag.
    ```html
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.x/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.x/dist/js/bootstrap.bundle.min.js"></script>
    ```
2.  **Load Components**: Import the desired component scripts after the Bootstrap JS Bundle.
    ```html
    <script src="components/modal/modal.js"></script>
    <script src="components/alert/alert.js"></script>
    ```

## Additional Development Information

### Core Design Principles

1.  **No Shadow DOM**: These components **must not** use Shadow DOM. This ensures they can inherit global Bootstrap styles and interact correctly with Bootstrap's JavaScript plugins.
2.  **Deferred Rendering**: Most components use `setTimeout(() => { this._render(); }, 0)` in their `connectedCallback`. This is a critical pattern used to ensure that the browser has fully parsed the custom element's children before the `_render` method attempts to manipulate them.
3.  **Bootstrap Plugin Wrapping**: Components often serve as wrappers for Bootstrap's JS plugins (e.g., `bootstrap.Modal`, `bootstrap.Collapse`). They should handle the initialization and disposal of these plugins in `connectedCallback`/`_render` and `disconnectedCallback`.
4.  **Attribute vs Slot**: Components typically support both attributes for simple text (e.g., `title="My Modal"`) and slots for complex HTML content (e.g., `<div slot="title">...</div>`). Slots are simulated by manually moving children during the `_render` phase since Shadow DOM is not used.
5.  **Idempotency**: Components should be idempotent, meaning they should behave the same way regardless of how many times they are connected or disconnected. This is crucial for seamless integration with frameworks that may disconnect and reconnect components frequently.

### Code Style & Patterns

-   **Naming Convention**: Custom elements are prefixed with `bs-` (e.g., `<bs-modal>`, `<bs-alert>`) when they are direct wrappers for Bootstrap components. When they do something in addition to a bootstrap component, they are named for what they do (e.g. `<loading-button>`).
-   **Attribute vs Slot**: Components typically support both attributes for simple text (e.g., `title="My Modal"`) and slots for complex HTML content (e.g., `<div slot="title">...</div>`). Slots are simulated by manually moving children during the `_render` phase since Shadow DOM is not used.
-   **Idempotency**: `_render` methods should check for an `_initialized` flag to prevent multiple renders if `connectedCallback` is triggered more than once.
-   **Cleanup**: Always implement `disconnectedCallback` to call `.dispose()` on any underlying Bootstrap plugin instances to prevent memory leaks.
-   **Encapsulation**: Bootstrap CSS expects that components are a `div`, so every custom component should wrap its content in a `<div>`. Copy any classes / attributes from the original element to the wrapper.

### Debugging
-   Check the browser console for any errors related to `bootstrap` being undefined.
-   If child content is missing or incorrectly placed, verify if the component uses the `setTimeout` pattern in `connectedCallback`.

## Example HTML Files

Every new component **must** have an accompanying example HTML file to demonstrate its usage and provide a quick way to test functionality.

### File Naming & Location
Example files should be named `[component_name]_example.html` and located in the same directory as the component's JavaScript file.

### Demo Page Theme
To maintain consistency, all example files should follow this structure and "theme":

1.  **Standard Bootstrap Setup**: Include Bootstrap 5 CSS in the `<head>` and the JS Bundle at the end of the `<body>`.
2.  **Internal Styles**: Include the following standard spacing and layout styles:
    ```html
    <style>
      body { padding-bottom: 50px; }
      hr { margin: 2rem 0; }
      .example-container { max-width: 800px; margin: 0 auto; }
    </style>
    ```
3.  **Page Layout**:
    -   Use a main container: `<div class="container mt-5 example-container">`.
    -   Header: Include an `<h1>` title (e.g., `BsAlert Web Component Demo`) and a `<p class="lead">` description.
    -   Sections: Group examples within `<section>` tags. Each section should have an `<h3>` title and a brief `<p>` explanation of what the example demonstrates.
    -   Separators: Use `<hr>` between sections.
4.  **Scripts**: Always load the Bootstrap JS Bundle before the component's JavaScript file.
