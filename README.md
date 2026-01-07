# Bootstrap Web Components

Web components that wrap Bootstrap 5 functionality in custom elements. All components expect Bootstrap 5 for styling.

## Documentation

A comprehensive documentation page is available in `index.html`.

Open `index.html` in your browser or deploy to GitHub Pages.

## Available Components

| Component      | Custom Element                             | Description                        |
|----------------|--------------------------------------------|------------------------------------|
| Accordion      | `<bs-accordion>` & `<bs-accordion-item>`   | Expandable content panels          |
| Alert          | `<bs-alert>`                               | Contextual feedback messages       |
| Badge          | `<bs-badge>`                               | Small count and labeling component |
| Card           | `<bs-card>`                                | Flexible content container         |
| Carousel       | `<bs-carousel>` & `<bs-carousel-item>`     | Slideshow component                |
| Loading Button | `<loading-button>`                         | Button with loading state          |
| Modal          | `<bs-modal>`                               | Dialog boxes                       |
| Nav Tabs       | `<bs-tabs>` & `<bs-tab>`                   | Tabbed navigation                  |
| Navbar         | `<bs-navbar>`, `<bs-navbar-brand>`, etc.   | Navigation header                  |
| Pagination     | `<bs-pagination>` & `<bs-pagination-item>` | Page navigation                    |
| Placeholder    | `<bs-placeholder>`                         | Content loading placeholder        |
| Sidebar        | `<bs-sidebar>` & `<bs-permanent-sidebar>`  | Offcanvas and permanent sidebars   |
| Spinner        | `<bs-spinner>`                             | Loading indicator                  |
| Theme Toggle   | `<theme-toggle>`                           | Light/dark mode switcher           |
| Toast          | `<bs-toast>`                               | Push notifications                 |
| Tooltip        | `<bs-tooltip>`                             | Hover information                  |

## Usage

### Basic Usage

1. Include Bootstrap 5 CSS and JS
2. Include the component JavaScript file
3. Use the custom element in your HTML

### Example

```html
<!DOCTYPE html>
<html>
<head>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
  <!-- Include component -->
  <script src="components/alert/alert.js"></script>
  
  <!-- Use component -->
  <bs-alert type="success">
    Hello from a web component!
  </bs-alert>
  
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
```

## Development

### Requirements

- Bootstrap 5.3.3 (CSS and JS)
- Bootstrap Icons 1.11.3 (optional, for icons)

### Structure

```
components/
├── component-name/
│   ├── component-name.js      # Web Component implementation
│   └── component-name_example.html  # Example usage
├── index.html                # Main documentation
└── README.md                 # Project documentation
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

Contributions welcome! Open an issue or submit a pull request.

## Links

- [Bootstrap Documentation](https://getbootstrap.com/docs/5.3/)
- [Web Components MDN](https://developer.mozilla.org/en-US/docs/Web/Web_Components)
