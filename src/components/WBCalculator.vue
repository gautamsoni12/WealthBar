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
        <td>${{  RRSPTaxRefund.toFixed(2)}}</td>
        <td>${{  TFSATaxRefund.toFixed(2) }}</td>
      </tr>
      <tr>
        <!--<td>Tax due on withdrawl</td>-->
        <td>The future value (in today’s dollars) of the savings at the end of the investment period</td>
        <td>${{ RRSPWithdrawalTaxValue.toFixed(2) }}</td>
        <td>${{ TFSAWithdrawalTaxValue.toFixed(2) }}</td>
      </tr>
      <tr>
        <!--<td>Future value after tax on withdrawl</td>-->
        <td>The tax paid upon withdrawal</td>
        <td>${{ RRSPFutureValueAfterTax.toFixed(2) }}</td>
        <td>${{ TFSAFutureValueAfterTax.toFixed(2) }}</td>
      </tr>
      <tr>
        <!--<td>Future value after tax on withdrawal when tax refund is also invested</td>-->
        <td>The after-tax future value of the investment at the end of the investment period</td>
        <td>${{ RRSPWithTaxRefundFutureValueAfterTax.toFixed(2)}}</td>
        <td>${{ TFSAWithTaxRefundFutureValueAfterTax.toFixed(2) }}</td>
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
      RRSPTaxRefund: 0,
      RRSPWithdrawalTaxValue: 0,
      RRSPFutureValueAfterTax: 0,
      RRSPWithTaxRefundFutureValueAfterTax: 0,
      TFSATaxRefund: 0,
      TFSAWithdrawalTaxValue: 0,
      TFSAFutureValueAfterTax: 0,
      TFSAWithTaxRefundFutureValueAfterTax: 0
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

      // The future value at given roi and time invested:
      this.nominalFutureValue = this.computeFutureValue(this.depositAmount, this.roi, this.yearsInvested)

      // First adjust the roi for inflation.
      // Then compute the future value at computed real rate of return.
      let realRateOfReturn = this.computeRealRateOfReturn(this.roi, this.inflation)
      this.inflationFutureValue = this.computeFutureValue(this.depositAmount, realRateOfReturn, this.yearsInvested)

      // Calculate the dollar amount of tax refund
      this.RRSPTaxRefund = this.computeTax(this.depositAmount, this.currentTaxRate)
      // The tax amount at average tax rate in retirement
      this.RRSPWithdrawalTaxValue = this.computeTax(this.nominalFutureValue, this.retirementTaxRate)
      // The after-tax future value of the investment at the end of the investment period
      this.RRSPFutureValueAfterTax = this.nominalFutureValue - this.RRSPWithdrawalTaxValue
      // The future value of RRSP fund if the tax refund amound is reinvested
      this.RRSPWithTaxRefundFutureValueAfterTax = this.computeRRSPWithTaxRefundFutureValueAfterTax()

      // Calculate the dollar amount of tax refund
      this.TFSATaxRefund = 0
      // The tax amount at average tax rate in retirement
      this.TFSAWithdrawalTaxValue = 0
      // The after-tax future value of the investment at the end of the investment period
      this.TFSAFutureValueAfterTax = this.nominalFutureValue
      // The future value of RRSP fund if the tax refund amound is reinvested
      this.TFSAWithTaxRefundFutureValueAfterTax = this.nominalFutureValue

      this.displayResults = true
    },

    /**
         * Calculates the future value based on the specified starting balance, interest rate and the term of the investment:
         * http://www.financeformulas.net/Compound_Interest.html
         *
         * @param {Number} startingBalance The starting balance
         * @param {Number} interestRate The average interest rate per period as a percentage (i.e. between 0 and 100)
         * @param {Number} numPeriods The number of periods (e.g. months, years) of the investment
         *
         * @returns {Number} The amount of interest in dollars
         */
    computeFutureValue: function (startingBalance, interestRate, numPeriods) {
      return startingBalance * Math.pow(1 + (interestRate / 100), numPeriods)
    },

    /**
         * Calculates the real rate of return of an investment: http://www.financeformulas.net/Real_Rate_of_Return.html
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
         * Calculates the approximate future value of the RRSP assuming the tax refund is also invested into the same fund.
         *
         * @returns {Number} The future value if the tax refund is also invested
         */
    computeRRSPWithTaxRefundFutureValueAfterTax: function () {
      let RRSPWithTaxRefundDepositAmount = this.depositAmount + this.RRSPTaxRefund
      let RRSPWithTaxRefundFutureValue = this.computeFutureValue(RRSPWithTaxRefundDepositAmount, this.roi, this.yearsInvested)
      let RRSPWithTaxRefundWithdrawalTaxValue = this.computeTax(RRSPWithTaxRefundFutureValue, this.retirementTaxRate)

      return RRSPWithTaxRefundFutureValue - RRSPWithTaxRefundWithdrawalTaxValue
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
