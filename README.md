# WealthBar

> A Vue.js project

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# install jest test packages
npm install --save-dev jest @vue/test-utils

# run unit tests
npm run unit

```
## User Guide

This calculator will require the following input fields
- Current Marginal Tax Rate - This is the highest income tax bracket of the “user”
- Average Tax Rate in Retirement - This is the average income tax the “user” pays in retirement
- Amount of Deposit - The amount of money being deposited in the comparison
- Years Invested - The number of years before this money is withdrawn again
- Return on Investment - Rate at which the invested money grows each year
- Inflation Rate - Expected rate of inflation each year (used to calculate the real rate of return)

### Results

- Amount of after-tax deposited in the TFSA vs RRSP (i.e., the RRSP deposit amount should be equivalent to the TFSA deposit in after-tax dollars, which should be larger considering that RRSP deposits are made tax-free)
- The future value (in today’s dollars) of the savings at the end of the investment period
- The tax paid upon withdrawal (only applies to money saved in the RRSP)
- The after-tax future value of the investment at the end of the investment period


