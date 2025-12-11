
<br />
<div align="center">

<h3 align="center">HomeKeeper</h3>

  <p align="center">
    A friendly home appliance management system
    <br />
    Track your appliances, warranties, invoices, and maintenance records
  </p>
</div>

<!-- ABOUT THE PROJECT -->
## About The Project

HomeKeeper is a comprehensive web-based application designed to help homeowners manage their household appliances efficiently. Keep track of purchase dates, warranty information, maintenance schedules, and invoice records—all in one convenient location.

### Key Features

* 📱 **User Authentication** - Secure registration and login system
* 🔧 **Appliance Management** - Track all your home appliances with details like brand, model, and purchase date
* 📄 **Invoice Tracking** - Store and organize purchase invoices for easy reference
* 🛠️ **Maintenance Logs** - Record maintenance and repair history for each appliance
* ⏰ **Warranty Tracker** - Monitor warranty periods and get notified when they're expiring
* 🔍 **Search & Filter** - Quickly find any record with built-in search functionality
* 💾 **Local Storage** - All your data is stored locally in your browser for privacy
* ✅ **Comprehensive Testing** - Full test coverage with unit, feature, system, and release tests

### Built With

* [![HTML5][HTML-shield]][HTML-url]
* [![CSS3][CSS-shield]][CSS-url]
* [![JavaScript][JavaScript-shield]][JavaScript-url]

<!-- GETTING STARTED -->
## Getting Started

HomeKeeper is a pure front-end application that runs entirely in your browser. No server setup or installation required!

### Prerequisites

* A modern web browser (Chrome, Firefox, Safari, or Edge)
* No additional software needed!

### Installation

1. Clone the repository
   ```sh
   git clone https://github.com/yourusername/HomeKeeper_Friendly.git
   ```
   
2. Navigate to the project directory
   ```sh
   cd HomeKeeper_Friendly
   ```

3. Open `index.html` in your browser
   ```sh
   # On macOS
   open index.html
   
   # On Linux
   xdg-open index.html
   
   # On Windows
   start index.html
   ```

That's it! No build process, no dependencies, no setup required.

<!-- USAGE EXAMPLES -->
## Usage

### 1. Registration & Login

* Open `index.html` in your browser
* Create a new account by clicking "Register" and entering a username and password
* Login with your credentials

### 2. Dashboard

After logging in, you'll be taken to the dashboard where you can:
* View summary of your appliances
* Quick access to all modules
* Logout option

### 3. Managing Appliances

Navigate to **Appliances** page to:

* **Add New Appliance**
  - Click "Add New Appliance"
  - Enter appliance details:
    * Name (e.g., "Refrigerator")
    * Brand (e.g., "Samsung")
    * Model (e.g., "RF28R7351SR")
    * Purchase Date
    * Warranty End Date
  - Click "Save"

* **Edit/Delete Appliances**
  - Use the action buttons on each row
  - Search for specific appliances using the search bar

### 4. Invoice Management

Track all your purchase receipts:
* Link invoices to specific appliances
* Store invoice number, date, amount, and store name
* Search through all invoices

### 5. Maintenance Records

Keep track of repairs and maintenance:
* Select the appliance
* Record the date, issue description, and notes
* View complete maintenance history

### 6. Warranty Tracking

Never miss warranty expiration:
* View all warranties with remaining days
* See which warranties are expired
* Quick overview of warranty status

## Project Structure

```
HomeKeeper_Friendly/
├── index.html              # Login & Registration page
├── dashboard.html          # Main dashboard
├── appliances.html         # Appliance management
├── invoices.html           # Invoice tracking
├── maintenance.html        # Maintenance records
├── warranty.html           # Warranty tracking
├── css/
│   └── style.css          # Main stylesheet
└── js/
    ├── auth.js            # Authentication logic
    ├── utils.js           # Utility functions & localStorage helpers
    ├── dashboard.js       # Dashboard functionality
    ├── appliances.js      # Appliance management
    ├── invoices.js        # Invoice management
    ├── maintenance.js     # Maintenance tracking
    └── warranty.js        # Warranty tracking
```

## Data Storage

All data is stored locally in your browser using **localStorage**. This means:

✅ **Privacy** - Your data never leaves your device  
✅ **No Internet Required** - Works completely offline  
✅ **Fast Performance** - Instant data access  


## Features Overview

| Feature | Description |
|---------|-------------|
| Multi-user Support | Each user has their own isolated data |
| Responsive Design | Works on desktop, tablet, and mobile browsers |
| Search Functionality | Find records quickly across all modules |
| Date Formatting | Automatic date formatting for better readability |
| Warranty Alerts | Visual indicators for expiring warranties |
| Clean UI | Simple, intuitive interface for easy navigation |

## Browser Compatibility

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge

## Testing

HomeKeeper includes a **comprehensive 4-level testing suite** ensuring reliability, quality, and production readiness.

### 📊 Testing Overview

| Test Level | Files | Tests | Purpose |
|-----------|-------|-------|----------|
| **Unit Tests** | 5 | 80+ | Test individual functions and modules |
| **Feature Tests** | 4 | 50+ | Test complete user workflows |
| **System Tests** | 3 | 30+ | End-to-end browser automation |
| **Release Tests** | 3 | 40+ | Production readiness validation |
| **Total** | **15** | **200+** | **Complete coverage** |

### 🎯 What's Tested

#### Unit Tests (`tests/unit/`)
- ✅ **utils.test.js** - localStorage helpers, date formatting, API requests, token management
- ✅ **auth.test.js** - User registration, login, logout, session management
- ✅ **appliances.test.js** - Appliance filtering, validation, data transformation
- ✅ **invoices.test.js** - Invoice filtering, amount formatting, validation
- ✅ **warranty.test.js** - Warranty expiration calculation, status display, validation

#### Feature Tests (`tests/feature/`)
- ✅ **authentication.test.js** - Complete registration → login → logout flows, multi-user support
- ✅ **appliance-management.test.js** - Full CRUD operations, search/filter workflows
- ✅ **invoice-management.test.js** - Invoice management, appliance linking, search
- ✅ **warranty-tracking.test.js** - Warranty CRUD, expiration tracking, alerts

#### System Tests (`tests/system/`)
- ✅ **e2e.test.js** - End-to-end user journeys, page navigation, UI interactions
- ✅ **browser-compatibility.test.js** - localStorage support, DOM rendering, responsive design
- ✅ **performance.test.js** - Large dataset handling, search performance, memory usage

#### Release Tests (`tests/release/`)
- ✅ **smoke.test.js** - Critical page loading, essential functions, no console errors
- ✅ **regression.test.js** - Data persistence, modal interactions, form validation
- ✅ **acceptance.test.js** - Complete user workflows, error handling, data validation

### 🚀 Quick Start

**1. Install dependencies:**
```sh
npm install
```

**2. Run all tests:**
```sh
npm test
```

**3. Run specific test level:**
```sh
npm run test:unit      # Unit tests only
npm run test:feature   # Feature tests only
npm run test:system    # System tests only (requires browser)
npm run test:release   # Release tests only (requires browser)
```

**4. Generate coverage report:**
```sh
npm run test:coverage
```

### 📈 Test Coverage Targets

- **Overall Coverage**: 80%+
- **Unit Tests**: 90%+ code coverage
- **Feature Tests**: All major workflows covered
- **System Tests**: All pages and critical UI tested
- **Release Tests**: Production-ready validation

### 🛠️ Testing Technologies

- **Jest** - Modern JavaScript testing framework
- **jsdom** - DOM implementation for Node.js testing
- **Puppeteer** - Headless browser automation for E2E tests

### 📚 Test Structure

```
tests/
├── setup.js                          # Global test configuration
├── helpers/
│   ├── fixtures.js                   # Test data (users, appliances, invoices, warranties)
│   ├── mocks.js                      # API mocks and responses
│   └── dom-helpers.js                # DOM testing utilities
├── unit/                             # Unit Tests (5 files)
├── feature/                          # Feature Tests (4 files)
├── system/                           # System Tests (3 files)
└── release/                          # Release Tests (3 files)
```

### ✨ Key Testing Features

- **Isolated Tests** - Each test runs independently with clean state
- **Mock API** - All API calls are mocked for reliable testing
- **Browser Automation** - Real browser testing with Puppeteer
- **Fast Execution** - Unit/feature tests run in milliseconds
- **Comprehensive Coverage** - Every module and workflow tested
- **CI/CD Ready** - Designed for continuous integration pipelines

<!-- CONTACT -->
## Contact

Project Link: [https://github.com/shomoukh-as/HomeKeeper_Friendly](https://github.com/shomoukh-as/HomeKeeper_Friendly)

<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

* Built with vanilla JavaScript - no frameworks required
* Designed for simplicity and ease of use
* Perfect for homeowners who want to stay organized

---

<p align="center">Made with ❤️ for home organization</p>

<!-- MARKDOWN LINKS & IMAGES -->
[license-shield]: https://img.shields.io/github/license/othneildrew/Best-README-Template.svg?style=for-the-badge
[license-url]: https://github.com/othneildrew/Best-README-Template/blob/master/LICENSE.txt
[HTML-shield]: https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white
[HTML-url]: https://developer.mozilla.org/en-US/docs/Web/HTML
[CSS-shield]: https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white
[CSS-url]: https://developer.mozilla.org/en-US/docs/Web/CSS
[JavaScript-shield]: https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black
[JavaScript-url]: https://developer.mozilla.org/en-US/docs/Web/JavaScript
[LocalStorage-shield]: https://img.shields.io/badge/LocalStorage-Browser%20API-blue?style=for-the-badge
[LocalStorage-url]: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
