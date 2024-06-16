# BuildList Company Data Scraper and Viewer

This project scrapes company data from `buildlist.xyz`, uploads it to the Trieve API, and displays it using a React frontend.

## Installation

-Install dependecies (npm install)
-For scraper ensure you have pip intalled, then install required Python packages (pip install selenium requests)

## Running the scraper

-Download ChromeDriver
-Update scrape.py Paths:
Update chrome_options.binary_location to the path of your Chrome binary.
Update driver_path to the path of your ChromeDriver executable.
-Run scraper: python scrape.py

## Running the react app

-Navigate to buildlist folder then run: npm start

### Prerequisites

-   Node.js and npm
-   Python 3.x
-   Google Chrome browser for scraping
-   ChromeDriver for Selenium
