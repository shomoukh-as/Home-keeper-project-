[![MIT License][license-shield]][license-url]

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

### Built With

* [![HTML5][HTML-shield]][HTML-url]
* [![CSS3][CSS-shield]][CSS-url]
* [![JavaScript][JavaScript-shield]][JavaScript-url]
* [![LocalStorage][LocalStorage-shield]][LocalStorage-url]

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

⚠️ **Important Notes:**
- Data is specific to each browser and device
- Clearing browser data will delete all records
- No automatic backup - consider exporting your data regularly

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
- ✅ Any modern browser with localStorage support

<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE` for more information.

<!-- CONTACT -->
## Contact

Your Name - your.email@example.com

Project Link: [https://github.com/yourusername/HomeKeeper_Friendly](https://github.com/yourusername/HomeKeeper_Friendly)

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
