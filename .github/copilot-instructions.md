# Best Practices for Writing Lovelace Cards for Home Assistant

This document outlines best practices for developing custom Lovelace cards for Home Assistant. Following these guidelines will help create robust, maintainable, and user-friendly cards.

## 1. Project Structure and Setup

### Use a Proven Boilerplate
- Start with the [custom-cards/boilerplate-card](https://github.com/custom-cards/boilerplate-card) repository as a foundation
- This ensures your project structure aligns with community standards and includes proper tooling setup
- Includes pre-configured linting, bundling (Rollup/Webpack), and TypeScript configuration

### Dependencies
- Use `lit` (LitElement) for component development - it's lightweight, efficient, and officially supported
- Include `custom-card-helpers` for common Home Assistant utilities (entity handling, localization, theme support)
- Use TypeScript for type safety and better maintainability
- Keep dependencies minimal to reduce bundle size

### Build and Distribution
- Configure proper bundling to create a single `.js` file for distribution
- Support both development (`npm run watch`) and production (`npm run build`) builds
- Ensure the output file is named appropriately (e.g., `cardname-card.js`)
- Output should go to a `dist/` directory

## 2. LitElement and TypeScript Best Practices

### Component Structure
- Always extend `LitElement` for your card class
- Use TypeScript decorators for cleaner code:
  - `@property()` for reactive properties that sync with Home Assistant
  - `@state()` for internal component state
  - `@customElement('card-name')` to register your card

### Reactive Properties
```typescript
static properties = {
  hass: { type: Object },
  config: { type: Object }
};
```

### Required Methods
Implement these essential methods:
- `setConfig(config)`: Validate and store configuration
- `set hass(hass)`: Update when Home Assistant state changes
- `render()`: Return the card's HTML template using `html` tagged template literals
- `static getConfigElement()`: Return your card editor element

### Type Safety
- Define TypeScript interfaces for:
  - Configuration objects
  - Home Assistant (`hass`) object properties you use
  - Entity attributes
  - Custom events or properties
- Use proper type annotations on all functions and class members

### Example Card Structure
```typescript
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('my-card')
export class MyCard extends LitElement {
  @property({ attribute: false }) public hass!: any;
  @state() private _config?: MyCardConfig;

  public setConfig(config: MyCardConfig): void {
    if (!config.entity) {
      throw new Error('You need to define an entity');
    }
    this._config = config;
  }

  protected render() {
    if (!this._config || !this.hass) {
      return html``;
    }
    
    const entity = this.hass.states[this._config.entity];
    return html`<ha-card>...</ha-card>`;
  }

  static get styles() {
    return css`...`;
  }
}
```

## 3. Configuration and Validation

### Validate Early
- Throw descriptive errors in `setConfig()` for invalid configurations
- Home Assistant will display these errors to users as error cards
- Check for required fields immediately

### Configuration Options
- Support both required and optional configuration properties
- Provide sensible defaults for optional values
- Document all configuration options with:
  - Type (string, number, boolean, object)
  - Required/Optional status
  - Default value
  - Since which version
  - Description and examples

### Editor Support
- Create a separate editor component extending `EditorForm` or similar
- Use form builders like `@marcokreeft/ha-editor-formbuilder` for consistent UI
- Provide dropdowns for entity selection
- Validate user input in real-time

## 4. Styling and Theming

### Scoped Styles
- Use Lit's `static styles` for scoped CSS
- Define styles using the `css` tagged template literal
- Styles are automatically scoped to your component

### Theme Compatibility
- Use Home Assistant's CSS variables for colors and spacing:
  - `var(--primary-color)`
  - `var(--primary-text-color)`
  - `var(--paper-card-background-color)`
  - `var(--divider-color)`
  - `var(--mdc-theme-primary)`
- Test your card in both light and dark themes
- Support theme variables for customization

### Responsive Design
- Use relative units (em, rem, %, vw, vh) instead of fixed pixels
- Test on mobile, tablet, and desktop viewports
- Use CSS Grid or Flexbox for flexible layouts
- Consider using `@media` queries for breakpoints

### Example Styling
```typescript
static styles = css`
  ha-card {
    padding: 16px;
    background: var(--paper-card-background-color);
    color: var(--primary-text-color);
  }
  
  .header {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }
`;
```

## 5. Performance Optimization

### Minimize Re-renders
- Only update reactive properties when values actually change
- Use `shouldUpdate()` lifecycle method to prevent unnecessary renders
- Avoid heavy computations in the `render()` method

### Efficient Property Updates
- Compare old and new values before updating properties
- Use `requestUpdate()` sparingly and only when needed
- Cache computed values when possible

### Resource Management
- Clean up event listeners in `disconnectedCallback()`
- Unsubscribe from any subscriptions when the card is removed
- Avoid memory leaks by properly disposing of resources

### DOM Efficiency
- Keep template structure simple and flat where possible
- Use `map()` for rendering lists efficiently
- Avoid unnecessary nesting of elements

## 6. Error Handling

### Graceful Degradation
- Always check if `hass` and `config` exist before using them
- Provide fallback UI when data is unavailable
- Show helpful error messages to users

### Entity Validation
- Check if entities exist before accessing their state
- Handle missing or unavailable entities gracefully
- Display appropriate messages for offline or misconfigured entities

### Example Error Handling
```typescript
render() {
  if (!this._config || !this.hass) {
    return html``;
  }

  const entity = this.hass.states[this._config.entity];
  if (!entity) {
    return html`
      <ha-card>
        <div class="error">Entity not found: ${this._config.entity}</div>
      </ha-card>
    `;
  }

  // Render normal content
}
```

## 7. Accessibility

### Semantic HTML
- Use appropriate HTML elements (`<button>`, `<h1>-<h6>`, `<nav>`, etc.)
- Structure content logically with proper heading hierarchy

### ARIA Labels
- Add `aria-label` attributes to interactive elements
- Use `role` attributes where semantic HTML isn't sufficient
- Ensure screen readers can navigate your card

### Keyboard Navigation
- Make all interactive elements keyboard accessible
- Support standard keyboard shortcuts (Tab, Enter, Space, Arrow keys)
- Add `tabindex` where needed for custom controls

## 8. Testing

### Development Testing
- Test with various entity types and states
- Test with missing or invalid configurations
- Test with unavailable or offline entities
- Verify behavior when Home Assistant reconnects

### Browser Testing
- Test in Chrome, Firefox, Safari, and Edge
- Test on mobile browsers (iOS Safari, Chrome on Android)
- Check for JavaScript console errors and warnings

### Integration Testing
- Test with actual Home Assistant instance
- Verify the card works in both YAML and UI configuration modes
- Test card editor functionality thoroughly

## 9. HACS Integration

### Repository Structure
- Create a `hacs.json` file in the repository root
- Include required fields: `name`, `render_readme`
- Optionally specify `country` for region-specific cards

### Version Management
- Use semantic versioning (MAJOR.MINOR.PATCH)
- Create GitHub releases for each version
- Update version in `package.json` and any manifests
- Tag releases appropriately (e.g., `v1.0.0`)

### Distribution
- Include built/bundled files in releases
- Provide installation instructions for both HACS and manual installation
- Document the resource URL path for Lovelace configuration

## 10. Documentation

### README Requirements
- Clear description of what the card does
- Screenshots or GIFs showing the card in action
- Installation instructions (HACS and manual)
- Configuration examples with all options documented
- Troubleshooting section for common issues
- Development setup instructions

### Configuration Documentation
Create a table documenting all options:
```markdown
| Name | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| entity | string | - | Yes | Entity ID to display |
| title | string | - | No | Optional card title |
```

### Code Comments
- Comment complex logic or non-obvious code
- Use JSDoc comments for functions and classes
- Explain "why" not "what" in comments

## 11. Code Quality

### Linting
- Use ESLint with Home Assistant's recommended rules
- Configure Prettier for consistent code formatting
- Run linters before committing code
- Set up pre-commit hooks if possible

### Naming Conventions
- Use descriptive variable and function names
- Follow JavaScript/TypeScript naming conventions:
  - `camelCase` for variables and functions
  - `PascalCase` for classes and types
  - `UPPER_SNAKE_CASE` for constants
- Prefix private methods/properties with underscore

### Modularity
- Keep files focused on a single responsibility
- Separate styles, editor, and main card into different files
- Create utility functions for reusable logic
- Extract complex rendering logic into separate methods

## 12. Community and Maintenance

### Version Control
- Use Git with clear, descriptive commit messages
- Create feature branches for new work
- Tag releases properly in Git

### Community Engagement
- Respond to issues and pull requests promptly
- Accept contributions gracefully
- Share your card on Home Assistant forums and Reddit
- Provide support channels (GitHub issues, Discord, forums)

### Maintenance
- Keep dependencies updated (but test thoroughly)
- Monitor for breaking changes in Home Assistant releases
- Fix bugs promptly, especially security issues
- Deprecate features properly with warnings before removal

## 13. Custom Card Registration

### Proper Registration
```typescript
customElements.define('my-card', MyCard);

// Make card discoverable
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'my-card',
  name: 'My Custom Card',
  description: 'A custom card for Home Assistant',
  preview: true, // if preview is available
});
```

### Naming
- Card name must contain a hyphen (Web Components requirement)
- Use descriptive, unique names to avoid conflicts
- Prefix with your project/organization name if needed

## 14. Security

### Input Sanitization
- Sanitize any user-provided content before rendering
- Be careful with `innerHTML` - prefer Lit's `html` templates
- Validate entity IDs and configuration values

### API Usage
- Use Home Assistant's API appropriately
- Don't make excessive API calls
- Respect rate limits and quotas
- Handle API errors gracefully

## 15. Helper Library Usage

### custom-card-helpers
Utilize helpers for common tasks:
- `computeStateDisplay()` - Format entity states
- `navigate()` - Navigate to different views
- `fireEvent()` - Dispatch Home Assistant events
- Entity state utilities
- Localization helpers

### Example Usage
```typescript
import { computeStateDisplay } from 'custom-card-helpers';

const stateDisplay = computeStateDisplay(
  this.hass.localize,
  entity,
  this.hass.locale
);
```

## Summary Checklist

Before releasing your card, ensure:
- [ ] Code is written in TypeScript with proper types
- [ ] All configuration options are validated
- [ ] Card works in both light and dark themes
- [ ] Card is responsive on mobile and desktop
- [ ] Error states are handled gracefully
- [ ] Documentation is complete and accurate
- [ ] Code is linted and formatted consistently
- [ ] Card is tested in multiple browsers
- [ ] HACS integration is configured
- [ ] Card is registered properly with Home Assistant
- [ ] Performance is optimized (no unnecessary re-renders)
- [ ] Accessibility features are implemented
- [ ] Security best practices are followed

## Additional Resources

- [Home Assistant Developer Docs](https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card/)
- [Lit Documentation](https://lit.dev/)
- [custom-card-helpers](https://custom-cards.github.io/custom-card-helpers/)
- [HACS Documentation](https://hacs.xyz/)
- [Home Assistant Community Forums](https://community.home-assistant.io/)
- [custom-cards/boilerplate-card](https://github.com/custom-cards/boilerplate-card)
