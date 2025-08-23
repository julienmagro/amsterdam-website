# Amsterdam Discovery Site

A beautiful, modern website showcasing Amsterdam's history and canal life. Built with Flask, Python, and clean Apple-style design. Features both static pages and dynamic Python-powered functionality.

🌐 **Live Site:** [https://pirateship.nl](https://pirateship.nl)

## 🌟 Features

- **Clean Apple-style Design**: Minimal, elegant interface with smooth animations
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile
- **Amsterdam Flag Integration**: Custom SVG flag icon throughout the site
- **Four Main Sections**:
  - Landing page with welcome message
  - History Fun Facts about Amsterdam
  - Water Life in the canals
  - **Python Calculator** - Server-side calculations with Flask
- **Dual Deployment**: Static version (GitHub Pages) + Dynamic version (Render)

## 🛠️ Tech Stack

### Backend
- **Python 3.11**: Server-side logic
- **Flask 3.1.2**: Web framework for dynamic functionality
- **Gunicorn**: Production WSGI server

### Frontend
- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Custom properties, Grid, Flexbox, smooth animations
- **Jinja2**: Template engine for dynamic content
- **SVG**: Scalable Amsterdam flag graphics

### Deployment
- **Render**: Production hosting with custom domain
- **GitHub Pages**: Static version backup
- **Squarespace**: DNS management

## 🎨 Design Philosophy

- Red color scheme inspired by Amsterdam's flag
- Apple-style typography and spacing
- Glass-morphism effects with backdrop blur
- Smooth hover animations and transitions
- Mobile-first responsive design

## 📁 Project Structure

```
amsterdam-site/
├── app.py                   # Flask application
├── requirements.txt         # Python dependencies
├── render.yaml             # Render deployment config
├── templates/              # Flask templates
│   ├── index.html          # Landing page template
│   ├── history.html        # History fun facts template
│   ├── water.html          # Canal water life template
│   └── calculator.html     # Python calculator template
├── static/                 # Static assets
│   ├── styles/
│   │   └── main.css        # All styling
│   └── assets/
│       └── amsterdam-flag.svg  # City flag
├── index.html              # Static version (GitHub Pages)
├── history.html            # Static version (GitHub Pages)
├── water.html              # Static version (GitHub Pages)
└── README.md               # This file
```

## 🚀 Local Development

### Prerequisites
- Python 3.11+
- pip

### Setup
1. **Clone the repository**
   ```bash
   git clone https://github.com/julienmagro/amsterdam-website.git
   cd amsterdam-website
   ```

2. **Create virtual environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On macOS/Linux
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run Flask development server**
   ```bash
   python app.py
   ```

5. **Visit the site**
   - Open http://localhost:5001
   - Navigate between pages and test the calculator

## 🌐 Deployment

### Production (Render)
- **URL**: https://pirateship.nl
- **Features**: Full Flask app with Python calculator
- **Auto-deploy**: Pushes to `main` branch trigger deployment

### Static Backup (GitHub Pages)
- **URL**: GitHub Pages (disabled, redirects to Render)
- **Features**: Static HTML/CSS version (no calculator)

## 🧮 Calculator Feature

The Python calculator demonstrates server-side processing:

- **Frontend**: HTML form with number inputs and operation selection
- **Backend**: Flask route processes form data with Python
- **Features**: Addition, subtraction, multiplication, division
- **Error handling**: Division by zero, invalid inputs
- **UI**: Real-time results with error messaging

## 🔧 Configuration

### Environment Variables
- `PORT`: Server port (default: 5000 in production, 5001 in development)
- `PYTHON_VERSION`: 3.11.4 (specified in render.yaml)

### Domain Setup
- **Domain**: pirateship.nl (Squarespace DNS)
- **SSL**: Automatic HTTPS via Render
- **CDN**: Global edge caching included

## 🎯 Learning Outcomes

This project demonstrates:

- **Flask web development**: Routes, templates, form handling
- **Production deployment**: From local development to live website
- **DNS management**: Custom domain configuration
- **Modern CSS**: Glass-morphism, animations, responsive design
- **Version control**: Git workflow with GitHub integration
- **Web hosting**: Understanding static vs dynamic hosting

## ✨ Built with ❤️ for Learning

This project showcases the evolution from static HTML/CSS to dynamic Flask applications, demonstrating modern web development practices and deployment strategies.

## 🔗 Links

- **Live Site**: [https://pirateship.nl](https://pirateship.nl)
- **Repository**: [https://github.com/julienmagro/amsterdam-website](https://github.com/julienmagro/amsterdam-website)
- **Hosting**: [Render](https://render.com)