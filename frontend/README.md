# AI Agent Memory Visualization Dashboard

A modern, interactive web dashboard for visualizing and monitoring AI agent memory systems. Built with vanilla JavaScript, HTML5 Canvas, and Tailwind CSS.

## 🚀 Features

### Core Functionality
- **Real-time Memory Monitoring**: Live updates of AI agent memory metrics
- **Interactive Charts**: Canvas-based line charts and bar visualizations
- **Responsive Design**: Mobile-first approach with responsive grid layouts
- **Performance Monitoring**: Built-in performance metrics and optimization
- **Modal System**: Detailed views for memory categories and system overview

### Memory Visualization
- **Short-Term Memory**: Recent interactions and active processing contexts
- **Long-Term Memory**: Knowledge base distribution across categories
- **Context Tracking**: Real-time monitoring of active AI contexts
- **Trend Analysis**: Performance indicators and growth metrics

### Technical Features
- **Canvas Rendering**: Custom chart rendering with grid lines and animations
- **Auto-refresh**: Data updates every 30 seconds with visual indicators
- **Keyboard Navigation**: ESC key support for modal management
- **Performance Budgets**: Core Web Vitals monitoring
- **Error Handling**: Graceful degradation and user feedback

## 🛠️ Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **Styling**: Tailwind CSS with custom CSS variables
- **Charts**: HTML5 Canvas for custom visualizations
- **Fonts**: Space Grotesk (Google Fonts)
- **Icons**: SVG icons with CSS styling
- **Performance**: Web Performance API integration

## 📁 Project Structure

```
memoria/
├── index.html          # Main HTML file
├── styles.css          # Custom CSS styles and animations
├── script.js           # JavaScript functionality and dashboard logic
└── README.md           # Project documentation
```

## 🚀 Getting Started

### Prerequisites
- Modern web browser with ES6+ support
- Local web server (for development)

### Installation
1. Clone or download the project files
2. Open `index.html` in a web browser
3. Or serve locally using a web server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

4. Navigate to `http://localhost:8000` in your browser

## 🎯 Usage

### Dashboard Navigation
- **Header**: Navigation menu and user profile
- **Help Button**: Click the question mark icon for usage information
- **View Details**: Click the "View Details" button for system overview

### Interactive Elements
- **Chart Bars**: Hover for tooltips, click for detailed information
- **Line Chart**: Real-time interaction data visualization
- **Context Indicators**: Color-coded status for active AI contexts
- **Modal System**: Detailed views with keyboard navigation (ESC to close)

### Data Refresh
- Automatic refresh every 30 seconds
- Visual refresh indicator in top-right corner
- Performance-optimized (pauses when tab is not visible)

## 🔧 Customization

### CSS Variables
Modify the color scheme in `styles.css`:

```css
:root {
    --primary-color: #3d99f5;      /* Primary blue */
    --background-color: #111827;   /* Dark background */
    --surface-color: #1f2937;      /* Card backgrounds */
    --text-primary: #ffffff;       /* Main text */
    --text-secondary: #9ca3af;     /* Secondary text */
    --border-color: #374151;       /* Borders */
    --success-color: #10b981;      /* Success indicators */
}
```

### Chart Data
Modify mock data generation in `script.js`:

```javascript
generateMockData() {
    // Customize interaction data
    this.interactionData = [
        // Your custom data structure
    ];
    
    // Customize knowledge base data
    this.knowledgeData = [
        // Your custom categories and values
    ];
}
```

### Performance Settings
Adjust refresh intervals and performance budgets:

```javascript
// In script.js
setupAutoRefresh() {
    this.refreshInterval = setInterval(() => {
        this.refreshData();
    }, 30000); // 30 seconds - adjust as needed
}
```

## 📊 Performance Metrics

The dashboard includes built-in performance monitoring:

- **Page Load Time**: DOM content loaded and full page load
- **Largest Contentful Paint (LCP)**: Core Web Vital measurement
- **Memory Usage**: Dashboard memory consumption tracking
- **Auto-refresh Optimization**: Pauses when tab is not visible

## 🎨 Design System

### Typography
- **Primary Font**: Space Grotesk (400, 500, 600, 700 weights)
- **Hierarchy**: Clear visual hierarchy with consistent spacing
- **Responsive**: Scalable typography across device sizes

### Color Palette
- **Primary**: Blue (#3d99f5) for interactive elements
- **Background**: Dark theme for reduced eye strain
- **Status Colors**: Green for success, yellow for warnings
- **Accessibility**: High contrast ratios for readability

### Animations
- **Smooth Transitions**: CSS transitions for interactive elements
- **Hover Effects**: Subtle animations for better UX
- **Loading States**: Spinner animations for data operations
- **Modal Transitions**: Smooth enter/exit animations

## 🔒 Browser Support

- **Modern Browsers**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **ES6+ Features**: Arrow functions, classes, template literals
- **Canvas API**: HTML5 Canvas for chart rendering
- **CSS Variables**: Custom properties for theming
- **Performance API**: Web Performance API for metrics

## 🚧 Development

### Code Structure
- **Modular Classes**: `MemoryDashboard` and `PerformanceMonitor`
- **Event-Driven**: Clean event handling and delegation
- **Error Handling**: Try-catch blocks with user feedback
- **Performance**: Optimized rendering and memory management

### Best Practices
- **Semantic HTML**: Proper document structure and accessibility
- **CSS Organization**: Logical grouping and naming conventions
- **JavaScript Patterns**: ES6 classes, event delegation, performance optimization
- **Responsive Design**: Mobile-first approach with progressive enhancement

## 📈 Future Enhancements

### Planned Features
- **Real API Integration**: Connect to actual AI memory systems
- **Advanced Charts**: D3.js integration for complex visualizations
- **Data Export**: CSV/JSON export functionality
- **User Authentication**: Secure access control
- **Real-time WebSocket**: Live data streaming

### Technical Improvements
- **Service Workers**: Offline functionality and caching
- **WebAssembly**: Performance-critical chart rendering
- **Progressive Web App**: Installable dashboard experience
- **Internationalization**: Multi-language support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with proper testing
4. Submit a pull request with detailed description

### Development Guidelines
- Follow existing code style and patterns
- Add comprehensive error handling
- Include performance considerations
- Test across different browsers and devices

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Tailwind CSS**: Utility-first CSS framework
- **Space Grotesk**: Modern geometric sans-serif font
- **HTML5 Canvas**: Powerful 2D graphics API
- **Web Performance API**: Modern performance measurement tools

## 📞 Support

For questions, issues, or contributions:
- Open an issue on the project repository
- Review the documentation and code comments
- Check browser console for debugging information

---

**Built with ❤️ for the AI community**
