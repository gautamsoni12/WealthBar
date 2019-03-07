<template>
  <div class="calculator">
    <h1>{{ msg }}</h1>
    <form onsubmit="return false;">
      <fieldset>
        <article>
          <label for="current-tax-rate">Current Marginal Tax Rate (%):</label>
          <input id="current-tax-rate" type="number" step="0.1" min="0.1" max="100" required="required" v-model.number="currentTaxRate" />
        </article>
        <article>
          <label for="retirement-tax-rate">Average Tax Rate in Retirement (%):</label>
          <input id="retirement-tax-rate" type="number" step="0.1" min="0.1" max="100" required="required" v-model.number="retirementTaxRate" />
        </article>
        <article>
          <label for="deposit-amount">Amount of Deposit ($):</label>
          <input id="deposit-amount" type="number" step="0.1" min="0.1" required="required" v-model.number="depositAmount" />
        </article>
        <article>
          <label for="years-invested">Years Invested:</label>
          <input id="years-invested" type="number" step="1" min="1" required="required" v-model.number="yearsInvested" />
        </article>

        <article>
          <label for="roi">Return on Investment (%):</label>
          <input id="roi" type="number" step="0.1" min="0.1" required="required" v-model.number="roi" />
        </article>

        <article>
          <label for="inflation">Inflation Rate (%):</label>
          <input id="inflation" type="number" step="0.1" min="0.1" required="required" v-model.number="inflation" />
        </article>
      </fieldset>

      <button type="submit" v-on:click="calculate">Calculate</button>
    </form>
    <h2>Computed Values</h2>
    <table>
      <tr>
        <th>Values</th>
        <th>RRSP</th>
        <th>TFSA</th>
      </tr>
      <tr>
        <!--<td>Tax Refund</td>-->
        <td>Amount of after-tax deposited in the TFSA vs RRSP</td>
        <td>${{  RRSPDepositAfterTax.toFixed(2) }}</td>
        <td>${{  TFSADepositAfterTax.toFixed(2) }}</td>
      </tr>
      <tr>
        <!--<td>Tax due on withdrawl</td>-->
        <td>The future value (in today’s dollars) of the savings at the end of the investment period</td>
        <td>${{ RRSPFutureValueAtEnd.toFixed(2) }}</td>
        <td>${{ TFSAFutureValueAtEnd.toFixed(2) }}</td>
      </tr>
      <tr>
        <!--<td>Future value after tax on withdrawl</td>-->
        <td>The tax paid upon withdrawal</td>
        <td>${{ RRSPWithdrawalTaxValue.toFixed(2) }}</td>
        <td>${{ TFSAWithdrawalTaxValue.toFixed(2) }}</td>
      </tr>
      <tr>
        <!--<td>Future value after tax on withdrawal when tax refund is also invested</td>-->
        <td>The after-tax future value of the investment at the end of the investment period</td>
        <td>${{ RRSPAfterTaxFV.toFixed(2)}}</td>
        <td>${{ TFSAAfterTaxFV.toFixed(2) }}</td>
      </tr>
    </table>
  </div>
</template>

<script>
export default{
  name: 'HelloWorld',
  data () {
    return {
      msg: 'Wecome to TFSA/RRSP calculator',
      currentTaxRate: null,
      retirementTaxRate: null,
      depositAmount: null,
      yearsInvested: null,
      roi: null,
      inflation: null,
      displayResults: false,
      nominalFutureValue: 0,
      inflationFutureValue: 0,
      RRSPWithdrawalTaxValue: 0,
      TFSAWithdrawalTaxValue: 0,
      RRSPDepositAfterTax: 0,
      TFSADepositAfterTax: 0,
      RRSPFutureValueAtEnd: 0,
      TFSAFutureValueAtEnd: 0,
      RRSPAfterTaxFV: 0,
      TFSAAfterTaxFV: 0
    }
  },
  methods: {
    /**
         * Calculate RRSP & TFSA amounts.
         */
    calculate: function () {
      if (!this.validateInputs()) {
        this.displayResults = true

        return
      }

      // The amount deposited in each account
      this.RRSPDepositAfterTax = this.depositAmount
      this.TFSADepositAfterTax = this.depositAmount - this.computeTax(this.depositAmount, this.currentTaxRate)

      // Future Value of savings at the end of investment period. (adjusted for inflation)
      let realRateOfReturn = this.computeRealRateOfReturn(this.roi, this.inflation)
      this.RRSPFutureValueAtEnd = this.computeFutureValue(this.RRSPDepositAfterTax, realRateOfReturn, this.yearsInvested)
      this.TFSAFutureValueAtEnd = this.computeFutureValue(this.TFSADepositAfterTax, realRateOfReturn, this.yearsInvested)

      // Tax paid at withdrawal
      this.RRSPWithdrawalTaxValue = this.computeTax(this.RRSPFutureValueAtEnd, this.retirementTaxRate)
      this.TFSAWithdrawalTaxValue = 0

      // The after-tax future value of the investment at the end of the investment period
      this.RRSPAfterTaxFV = this.RRSPFutureValueAtEnd - this.RRSPWithdrawalTaxValue
      this.TFSAAfterTaxFV = this.TFSAFutureValueAtEnd - this.TFSAWithdrawalTaxValue

      // The future value at given roi and time invested:
      this.nominalFutureValue = this.computeFutureValue(this.depositAmount, this.roi, this.yearsInvested)
    },

    /**
         * Calculates the future value based on the specified starting balance, interest rate and the term of the investment:
         *
         * @param {Number} presentValue The starting balance
         * @param {Number} interestRate The average interest rate per period as a percentage (i.e. between 0 and 100)
         * @param {Number} numPeriods The number of periods (e.g. months, years) of the investment
         *
         * @returns {Number} The amount of interest in dollars
         */
    computeFutureValue: function (presentValue, interestRate, numPeriods) {
      return presentValue * Math.pow(1 + (interestRate / 100), numPeriods)
    },

    /**
         * Calculates the real rate of return of an investment
         *
         * @param {Number} roi The return on investment per year as a percentage (i.e. between 0 and 100)
         * @param {Number} inflationRate The average rate of inflation per year as a percentage (i.e. between 0 and 100)
         *
         * @returns {Number} The real rate of return as a percentage (i.e. between 0 and 100)
         */
    computeRealRateOfReturn: function (roi, inflationRate) {
      return (((1 + (roi / 100)) / (1 + (inflationRate / 100))) - 1) * 100
    },

    /**
         * Calculates tax.
         *
         * @param {Number} amount The amount to which to apply the tax rate
         * @param {Number} taxRate The tax rate as a percentage (i.e. between 0 and 100)
         *
         * @returns {Number} The amount of tax in dollars
         */
    computeTax: function (amount, taxRate) {
      return amount * (taxRate / 100)
    },

    /**
         * Determine whether the user input field values are valid.
         *
         * @returns {Boolean} Whether the inputs are valid
         */
    validateInputs: function () {
      return this.currentTaxRate >= 0.1 && this.currentTaxRate <= 100 &&
            this.retirementTaxRate >= 0.1 && this.retirementTaxRate <= 100 &&
            this.depositAmount >= 0.01 &&
            this.yearsInvested >= 1 && Number.isInteger(this.yearsInvested) &&
            this.roi >= 0.1 &&
            this.inflation >= 0.1
    }
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
fieldset{
  text-align: left;
}
input{
  width: 10%;
  display: inline-block;
  align-self: center;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
table {
  font-family: arial, sans-serif;
  border-collapse: collapse;
  width: 100%;
}

td, th {
  border: 1px solid #dddddd;
  text-align: left;
  padding: 5px;
}

tr:nth-child(even) {
  background-color: #dddddd;
}
button {
  background-color: deepskyblue; /* Green */
  border: none;
  color: white;
  padding: 10px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
}
</style>
