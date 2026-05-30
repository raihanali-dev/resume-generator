# Resume Builder

A modern, client-side resume builder application that allows users to create professional resumes with multiple templates and export them as PDF files. Built with vanilla HTML, CSS, and JavaScript for easy deployment on GitHub Pages.

## 🌟 Features

- **Multiple Professional Templates**: Choose from Modern, Classic, and Minimal designs
- **Interactive Form Builder**: Dynamic form with real-time validation
- **Live Preview**: See your resume as you build it
- **PDF Export**: Download your resume as a high-quality PDF
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Auto-Save**: Never lose your progress with automatic data saving
- **Client-Side Only**: No server required, works entirely in the browser

## 🚀 Live Demo

Visit the live application: [Resume Builder](https://yourusername.github.io/resume-generator)

## 📸 Screenshots

### Template Selection
![Template Selection](docs/screenshots/templates.png)

### Form Builder
![Form Builder](docs/screenshots/form.png)

### Resume Preview
![Resume Preview](docs/screenshots/preview.png)

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **PDF Generation**: jsPDF + html2canvas
- **Fonts**: Google Fonts (Inter)
- **Icons**: Font Awesome
- **Deployment**: GitHub Pages

## 🏗️ Project Structure

```
resume-generator/
├── index.html              # Main HTML file
├── css/
│   ├── main.css            # Core styles and layout
│   ├── templates.css       # Resume template styles
│   ├── form.css           # Form-specific styles
│   └── responsive.css     # Responsive design rules
├── js/
│   ├── app.js             # Main application controller
│   ├── templates.js       # Template management system
│   ├── formHandler.js     # Form data handling and validation
│   ├── pdfGenerator.js    # PDF generation functionality
│   └── utils.js           # Utility functions and helpers
├── assets/
│   └── favicon.ico        # Site favicon
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites

- Modern web browser with JavaScript enabled
- Internet connection (for loading external libraries and fonts)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/resume-generator.git
   cd resume-generator
   ```

2. **Open locally**:
   - Simply open `index.html` in your web browser
   - Or use a local server:
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js
     npx serve .
     
     # Using PHP
     php -S localhost:8000
     ```

3. **Visit the application**:
   - Open `http://localhost:8000` in your browser

### Deployment to GitHub Pages

1. **Fork or create the repository** on GitHub

2. **Enable GitHub Pages**:
   - Go to repository Settings
   - Scroll to "Pages" section
   - Select "Deploy from a branch"
   - Choose "main" branch and "/ (root)"
   - Save the settings

3. **Your resume builder will be available at**:
   ```
   https://yourusername.github.io/resume-generator
   ```

## 📱 Usage

### Creating Your Resume

1. **Get Started**: Click the "Get Started" button on the welcome screen

2. **Choose Template**: Select from available professional templates:
   - **Modern**: Contemporary design with gradient header
   - **Classic**: Traditional professional layout
   - **Minimal**: Clean and simple design

3. **Fill Your Information**:
   - **Personal Info**: Name, contact details, professional summary
   - **Experience**: Add your work history with descriptions
   - **Education**: Include your educational background
   - **Skills**: List your technical and soft skills

4. **Preview & Export**:
   - Use the preview button to see your resume
   - Download as PDF when satisfied

### Features in Detail

- **Auto-Save**: Your progress is automatically saved as you type
- **Form Validation**: Real-time validation ensures data quality
- **Responsive Design**: Works on all device sizes
- **Keyboard Shortcuts**: 
  - `Ctrl+S`: Save progress
  - `Ctrl+P`: Preview resume
  - `Ctrl+D`: Download PDF
  - `Escape`: Go back

## 🎨 Customization

### Adding New Templates

1. **Create template styles** in `css/templates.css`:
   ```css
   .template-yourname {
       /* Your template styles */
   }
   ```

2. **Add template definition** in `js/templates.js`:
   ```javascript
   yourname: {
       id: 'yourname',
       name: 'Your Template Name',
       description: 'Template description',
       features: ['Feature 1', 'Feature 2'],
       className: 'template-yourname'
   }
   ```

3. **Implement render method** in the same file:
   ```javascript
   renderYournameTemplate(data) {
       // Return HTML string for your template
   }
   ```

### Styling Customization

- **Colors**: Modify CSS custom properties in `css/main.css`
- **Fonts**: Change font imports in `index.html` and update CSS
- **Layout**: Adjust grid and flexbox properties in respective CSS files

## 🔧 Configuration

### PDF Generation Settings

Modify PDF options in `js/pdfGenerator.js`:

```javascript
getPDFOptions() {
    return {
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
        precision: 2
    };
}
```

### Form Validation Rules

Customize validation in `js/formHandler.js`:

```javascript
validateField(element) {
    // Add your custom validation logic
}
```

## 🐛 Troubleshooting

### Common Issues

1. **PDF not generating**:
   - Ensure jsPDF and html2canvas libraries are loaded
   - Check browser console for errors
   - Try refreshing the page

2. **Styles not loading**:
   - Verify all CSS files are properly linked
   - Check for CORS issues if using local server
   - Ensure Google Fonts are accessible

3. **Form data not saving**:
   - Check if localStorage is enabled
   - Verify browser compatibility
   - Clear browser cache and try again

### Browser Compatibility

- **Chrome**: ✅ Fully supported
- **Firefox**: ✅ Fully supported
- **Safari**: ✅ Fully supported
- **Edge**: ✅ Fully supported
- **Internet Explorer**: ❌ Not supported

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Follow existing code style and conventions
- Add comments for complex functionality
- Test on multiple browsers and devices
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [jsPDF](https://github.com/parallax/jsPDF) - PDF generation
- [html2canvas](https://github.com/niklasvh/html2canvas) - HTML to canvas conversion
- [Font Awesome](https://fontawesome.com/) - Icons
- [Google Fonts](https://fonts.google.com/) - Typography
- [Inter Font](https://rsms.me/inter/) - Modern typeface

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/resume-generator/issues) page
2. Create a new issue with detailed information
3. Contact: your.email@example.com

## 🔄 Changelog

### Version 1.0.0 (2024-10-02)
- Initial release
- Three professional templates
- Complete form builder
- PDF export functionality
- Responsive design
- Auto-save feature

---

**Built with ❤️ for professionals worldwide**