#!/usr/bin/env python3

import os
import re

def validate_docs_page():
    """Validate that the docs page references all components correctly."""
    
    # Read the index.html file
    with open('index.html', 'r') as f:
        content = f.read()
    
    # List of expected components
    expected_components = [
        'accordion', 'alert', 'badge', 'card', 'carousel', 'loading-button',
        'modal', 'nav-tabs', 'navbar', 'pagination', 'placeholder', 'spinner',
        'theme-toggle', 'toast', 'tooltip'
    ]
    
    # Check if each component has a section in the docs
    missing_sections = []
    for component in expected_components:
        # Look for section IDs like id="accordion"
        if f'id="{component}"' not in content:
            missing_sections.append(component)
    
    # Check if all component JS files are referenced
    js_files = []
    component_js_pattern = r'<script src="components/([^/]+)/([^"]+\.js)"'
    matches = re.findall(component_js_pattern, content)
    
    for component_dir, js_file in matches:
        js_files.append(f"{component_dir}/{js_file}")
    
    # Check if the JS files actually exist
    missing_js_files = []
    for js_file in js_files:
        if not os.path.exists(f"components/{js_file}"):
            missing_js_files.append(js_file)
    
    print("=== Documentation Validation Report ===")
    print()
    
    if missing_sections:
        print("❌ Missing component sections:")
        for section in missing_sections:
            print(f"  - {section}")
        print()
    else:
        print("✅ All component sections are present")
        print()
    
    print(f"📄 Found {len(js_files)} JavaScript file references:")
    for js_file in sorted(js_files):
        print(f"  - {js_file}")
    print()
    
    if missing_js_files:
        print("❌ Missing JavaScript files:")
        for js_file in missing_js_files:
            print(f"  - {js_file}")
        print()
    else:
        print("✅ All referenced JavaScript files exist")
        print()
    
    # Count component demos
    demo_count = content.count('class="component-demo"')
    print(f"🎯 Found {demo_count} component demos")
    
    # Check for Bootstrap dependencies
    bootstrap_css = 'bootstrap.min.css' in content
    bootstrap_js = 'bootstrap.bundle.min.js' in content
    bootstrap_icons = 'bootstrap-icons.min.css' in content
    
    print()
    print("🔍 Bootstrap dependencies:")
    print(f"  - Bootstrap CSS: {'✅' if bootstrap_css else '❌'}")
    print(f"  - Bootstrap JS: {'✅' if bootstrap_js else '❌'}")
    print(f"  - Bootstrap Icons: {'✅' if bootstrap_icons else '❌'}")
    
    # Overall validation
    all_good = not missing_sections and not missing_js_files and bootstrap_css and bootstrap_js and bootstrap_icons
    
    print()
    if all_good:
        print("🎉 Documentation page is valid and ready for GitHub Pages!")
    else:
        print("⚠️  Documentation page has some issues that need attention.")
    
    return all_good

if __name__ == "__main__":
    validate_docs_page()