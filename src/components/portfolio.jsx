import React, { Component } from "react";
import Stock from "./stock";
import Modal from "./Modal/modal";
import ModalChart from "./ModalChart/modalChart";

import {
  Charts,
  ChartContainer,
  ChartRow,
  YAxis,
  Legend,
  LineChart,
  styler
} from "react-timeseries-charts";

import { TimeSeries, TimeRange } from "pondjs";

const baseUrl =
  "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=";

const fullDataUrl =
  "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=";
const latestDataUrl =
  "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=";
const API_KEY = "UE8SOMJ4OW13XXPG";

//some garbage data for initializing the time series, will be replaced
//when stocks are added
const data = {
  name: "traffic",
  columns: ["time", "value"],
  points: [
    [1400425947000, 52],
    [1400425948000, 18],
    [1400425949000, 26],
    [1400425950000, 93]
  ]
};

var timesrs = new TimeSeries(data);

class Portfolio extends Component {
  constructor(props) {
    super(props);
    // Assign state itself, and a default value for items
    this.state = {
      stocks: [],
      selectedStocks: [],
      hits: [],
      currency: "USD",
      isShowing: false, //modal component is not showing
      isShowingChart: false,
      inputStockSymbol: "",
      inputShareAmount: "",
      chartWidth: 700,
      startDate: 1538427600000,
      endDate: 1533848400000
    };
    this.clearEmpties = this.clearEmpties.bind(this);
    this.updateChartDimensions = this.updateChartDimensions.bind(this);
    this.getRandomColor = this.getRandomColor.bind(this);
  }
  getRandomColor() {
    var letters = "0123456789ABCDEF";
    var color = "#";
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  clearEmpties(obj) {
    let newObj = [];
    Object.keys(obj).forEach(prop => {
      if (obj[prop]) {
        newObj[prop] = obj[prop];
      }
    });
    return newObj;
  }
  //opens the add stock modal when user clicks button
  openModalHandler = () => {
    this.setState({
      isShowing: true
    });
  };
  closeModalHandler = () => {
    this.setState({
      isShowing: false
    });
  };
  //opens the chart modal when user clicks show graph button
  openModalChartHandler = () => {
    if (this.state.selectedStocks.length > 0) {
      //set default time window before user changes it
      //set chart end date to newest data in first stock
      var len = this.state.stocks[0]["fullData"]["points"].length - 1;
      var newestDate = this.state.stocks[0]["fullData"]["points"][len][0];
      this.setState({ endDate: newestDate });
      //set chart start date to oldest  data in first stock
      var oldestDate = this.state.stocks[0]["fullData"]["points"][0][0];
      this.setState({ startDate: oldestDate });

      this.setState({
        isShowingChart: true
      });
    } else {
      alert("No stocks selected");
    }
  };
  closeModalChartHandler = () => {
    this.setState({
      isShowingChart: false
    });
  };
  //calls function to delete current portfolio in Portfolios
  handleDelete() {
    var retVal = window.confirm(
      "Are you sure you want to delete the portfolio?"
    );
    if (retVal == true) {
      this.props.deleteMethod(this.props.name);
    }
  }

  deleteSelectedStocks() {
    var newArray = JSON.parse(JSON.stringify(this.state.stocks.slice()));
    var newSelectedStocks = this.state.selectedStocks.slice();

    //loop through selected stocks and delete them from all stocks
    for (var key in newSelectedStocks) {
      for (var key2 in newArray) {
        if (newArray[key2]["name"] === newSelectedStocks[key]["name"]) {
          //delete newArray[key2];
          newArray.splice(key2, 1);
        }
      }
    }

    newSelectedStocks = [{}];
    newArray = this.clearEmpties(newArray);
    this.setState({ stocks: newArray });
    this.setState({ selectedStocks: newSelectedStocks });
  }
  //selects and deselects stock and assigns random color for graph
  selectStockMethod(val, state) {
    var newArray = JSON.parse(
      JSON.stringify(this.state.selectedStocks.slice())
    );
    //if stock is deselected, remove from selected array
    if (state === false) {
      for (var i in newArray) {
        if (newArray[i]["name"] === val) {
          newArray.splice(i, 1);
        }
      }
    } else {
      //if selected and not in array, add to selected array
      if (!(val in newArray)) {
        var dict = {
          name: val,
          color: this.getRandomColor() //get random color for graph
        };
        newArray.push(dict);
      }
    }
    newArray = this.clearEmpties(newArray);
    this.setState({ selectedStocks: newArray });
  }
  handleStockStartDateChange(evt) {
    //set oldest valid date to oldest date in first stock data
    var oldestDate = new Date(this.state.stocks[0]["fullData"]["points"][0][0]);
    var parts = evt.target.value.split("-");
    var evtAsDate = new Date(parts[0], parts[1] - 1, parts[2]);
    var todayDate = new Date();
    var startDate = todayDate;
    var evtAsDateInMs = evtAsDate.getTime();

    if (evtAsDate >= startDate || evtAsDate < oldestDate) {
      if (evtAsDate >= startDate) {
        alert("Starting date must be prior to current date");
      } else
        alert(
          "Stock data prior to " + oldestDate.toString() + " is not available"
        );
    } else {
      this.setState({ startDate: evtAsDateInMs });
    }
  }
  handleStockEndDateChange(evt) {
    var oldestDate = this.state.startDate;
    var parts = evt.target.value.split("-");
    var evtAsDate = new Date(parts[0], parts[1] - 1, parts[2]);
    var todayDate = new Date();
    var evtAsDateInMs = evtAsDate.getTime();

    if (evtAsDate >= todayDate || evtAsDate < oldestDate) {
      if (evtAsDate >= todayDate) {
        alert("Ending date must be prior to current date");
      } else alert("Chart time window too short");
    } else {
      this.setState({ endDate: evtAsDateInMs });
    }
  }

  handleStockSymbolChange(evt) {
    this.setState({ inputStockSymbol: evt.target.value });
  }
  handleShareAmountChange(evt) {
    this.setState({ inputShareAmount: evt.target.value });
  }
  handleChangeCurrencyToEUR() {
    if (this.state.currency !== "EUR") {
      this.setState({ currency: "EUR" });
      var newArray = this.state.stocks.slice();
      for (var i in newArray) {
        //only show 2 decimals
        newArray[i]["unitValue"] = parseFloat(
          (newArray[i]["unitValue"] * 0.88).toFixed(3)
        );
        newArray[i]["totalValue"] = parseFloat(
          (newArray[i]["totalValue"] * 0.88).toFixed(3)
        );
      }

      this.setState({ stocks: newArray });
    }
  }
  handleChangeCurrencyToUSD() {
    if (this.state.currency !== "USD") {
      this.setState({ currency: "USD" });
      var newArray = this.state.stocks.slice();
      for (var i in newArray) {
        newArray[i]["unitValue"] = parseFloat(
          (newArray[i]["unitValue"] * 1.14).toFixed(3)
        );
        newArray[i]["totalValue"] = parseFloat(
          (newArray[i]["totalValue"] * 1.14).toFixed(3)
        );
      }
      this.setState({ stocks: newArray });
    }
  }
  handleUpdateDateStart(evt) {
    this.setState({ startDate: evt.target.value });
  }
  handleUpdateDateEnd(evt) {
    this.setState({ endDate: evt.target.value });
  }
  //checks if ticker is valid
  isTickerValid(str) {
    str.trim();
    if (/^[a-zA-Z]+$/.test(str) && str.length <= 4) {
      return true;
    }
    return false;
  }

  handleAddStock() {
    //max number of different symbols is 50
    if (this.state.stocks.length < 50) {
      this.getTotalValue();
      //get inputs which are stored in state and changed when user types in input
      var stockName = this.state.inputStockSymbol;
      var shareCount = this.state.inputShareAmount;
      var isValid = this.isTickerValid(stockName) && shareCount > 0;
      if (!isValid) return;

      //if the stock with symbol already exists..
      for (var i in this.state.stocks) {
        if (this.state.stocks[i]["name"] === stockName) {
          var newArray = this.state.stocks.slice();
          //..increase the amount of shares in stock
          newArray[i]["quantity"] += shareCount;
          //increase total value by amount of shares * unit value
          newArray[i]["totalValue"] += (
            shareCount * newArray[i]["unitValue"]
          ).toFixed(3);
          this.setState({ stocks: newArray });

          return;
        }
      }
      //if stock with symbol does not exist yet
      //make API call and return stock data
      var url = baseUrl + stockName + "&apikey=" + API_KEY;
      fetch(url)
        //check if response is ok
        .then(function(response) {
          if (!response.ok) {
            throw Error(response.statusText);
          }
          return response;
        })
        .then(response => response.json())
        .then(response => {
          var name = response["Meta Data"]["2. Symbol"];
          var unitValue = parseFloat(
            response["Time Series (Daily)"][
              Object.keys(response["Time Series (Daily)"])[0]
            ]["1. open"]
          );
          //from this data format a time series can easily be constructed
          //for drawing the stock data graph
          var dataTemp = {
            name: name,
            columns: ["time", name],
            points: []
          };

          //getting the index of the entries for the stock data and looping
          //through the stock data
          for (var i in Object.keys(response["Time Series (Daily)"])) {
            //gets the key at index, which is the date
            var dateAsString = Object.keys(response["Time Series (Daily)"])[i];
            var parts = dateAsString.split("-");
            // Please pay attention to the month (parts[1]); JavaScript counts months from 0:
            // January - 0, February - 1, etc.
            var myDate = new Date(parts[0], parts[1] - 1, parts[2]);
            var myDateInMs = myDate.getTime();
            //gets the value using the key at index
            var value = parseFloat(
              response["Time Series (Daily)"][
                Object.keys(response["Time Series (Daily)"])[i]
              ]["1. open"]
            ).toFixed(3);
            //creating new array for time and values inside points
            dataTemp["points"].push(new Array());
            dataTemp["points"][i][0] = myDateInMs;
            dataTemp["points"][i][1] = value;
          }
          //data needs to start from earliest date in order to be accepted
          //as time series
          dataTemp["points"].reverse();

          //add to stocks state array so stock will be rendered
          var newArray = this.state.stocks.slice();

          var dict = {
            name: name,
            unitValue: unitValue,
            quantity: shareCount,
            totalValue: parseFloat((unitValue * shareCount).toFixed(3)),
            fullData: dataTemp
          };

          newArray.push(dict);

          this.setState({ stocks: newArray });
        })
        //catch any errors and report to user
        .catch(function(error) {
          console.log(error);
          alert("Error: Stock symbol is most likely not valid");
        });
    } else {
      alert("Maximum number of stock symbols (50) reached");
    }
  }
  //get total value of portfolio for rendering
  getTotalValue() {
    var totalVal = 0.0;
    for (var i in this.state.stocks) {
      //check if not null
      if (this.state.stocks[i]["totalValue"]) {
        totalVal += this.state.stocks[i]["totalValue"];
      }
    }
    // return totalVal.toFixed(3) + " " + currSymbol;
    return parseFloat(totalVal).toFixed(3) + this.getCurrencySymbol();
  }
  updateChartDimensions() {
    //set the chart width based on window size
    if (window.innerWidth > 700) {
      this.setState({ chartWidth: 650 });
    } else {
      this.setState({ chartWidth: window.innerWidth - 50 });
    }
  }
  componentDidMount() {
    //resize the chart to window width
    this.updateChartDimensions();
    window.addEventListener("resize", this.updateChartDimensions);
  }
  componentWillMount() {
    //when component mounts, add data from local storage to state
    if (localStorage.getItem(this.props.name + "Stocks")) {
      this.setState({
        stocks: JSON.parse(localStorage.getItem(this.props.name + "Stocks"))
      });
    }
  }

  componentWillUpdate(nextProps, nextState) {
    //save stocks in state to localstorage on update
    localStorage.setItem(
      this.props.name + "Stocks",
      JSON.stringify(nextState.stocks)
    );
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.updateWindowDimensions);
  }
  //return chart x axis elements based on selected stocks
  createSelectedXAxises = () => {
    let axises = [];
    for (var key in this.state.selectedStocks) {
      for (var key2 in this.state.stocks) {
        if (
          this.state.stocks[key2]["name"] ===
          this.state.selectedStocks[key]["name"]
        ) {
          //get name and color of selected stock and use it to style the graph
          var name = this.state.selectedStocks[key]["name"];
          var col = this.state.selectedStocks[key]["color"];
          var chartStyle = styler([{ key: name, color: col, width: 2 }]);

          //using the full data of the stock as the series for the graph
          timesrs = new TimeSeries(this.state.stocks[key2]["fullData"]);

          axises.push(
            <LineChart
              axis="axis1"
              columns={[name]}
              style={chartStyle}
              series={timesrs}
            />
          );
        }
      }
    }
    return axises;
  };
  //determine Y-axis scale for chart based on selected stocks
  createSelectedYAxises = () => {
    var maxVal = 0.1;
    var minVal = 2000.0;

    //loop through data of selected stocks to get the max/min values
    for (var i in this.state.stocks) {
      for (var k in this.state.selectedStocks) {
        if (
          this.state.stocks[i]["name"] === this.state.selectedStocks[k]["name"]
        ) {
          //for each stock, loop through the values
          for (var j in this.state.stocks[i]["fullData"]["points"]) {
            var value = parseFloat(
              this.state.stocks[i]["fullData"]["points"][j][1]
            );
            //if the value is larger than current max, set max to value
            if (value > maxVal) {
              maxVal = value;
            } //if value is lower than previous min, set min to value
            if (value < minVal) {
              minVal = value;
            }
          }
        }
      }
    }

    return (
      <YAxis
        id="axis1"
        label=""
        min={minVal}
        max={maxVal}
        width="60"
        type="linear"
        format="$,.2f"
      />
    );
  };
  //return legends for chart
  createLegends() {
    let legends = [];
    //make on legend for each selected stock
    for (var i in this.state.selectedStocks) {
      var name = this.state.selectedStocks[i]["name"];
      var col = this.state.selectedStocks[i]["color"];
      var categories = [];
      categories.push({ key: name, label: name });

      //style for colored line in legend
      var legendLineStyle = {
        backgroundcolor: col,
        width: "20px",
        marginLeft: "3px",
        marginRight: "3px",
        marginTop: "10px",
        height: "3px",
        backgroundColor: col,
        float: "left"
      };

      legends.push(
        <span className="legend">
          <hr style={legendLineStyle} />
          {name}
        </span>
      );
    }

    return legends;
  }
  getCurrencySymbol() {
    if (this.state.currency === "EUR") return " €";
    else return " $";
  }

  render() {
    return (
      <div className="portfolio shadow-sm">
        <ModalChart
          className="modal"
          name={this.props.name}
          show={this.state.isShowingChart}
          close={this.closeModalChartHandler}
        >
          <div>
            <ChartContainer
              timeAxisAngledLabels={true}
              timeAxisHeight={65}
              //get the time window from the state, which is set by the
              //date pickers
              timeRange={
                new TimeRange(this.state.startDate, this.state.endDate)
              }
              //if the chart is not showing, set width to 0
              width={this.state.isShowingChart ? this.state.chartWidth : 0}
            >
              <ChartRow height="250">
                {this.createSelectedYAxises()}

                <Charts>{this.createSelectedXAxises()}</Charts>
              </ChartRow>
            </ChartContainer>
            <div className="legend-container">{this.createLegends()}</div>
          </div>
          Start Date:{" "}
          <input
            className="input-date"
            type="date"
            onChange={evt => this.handleStockStartDateChange(evt)}
          />
          End Date:{" "}
          <input
            className="input-date"
            type="date"
            onChange={evt => this.handleStockEndDateChange(evt)}
          />
        </ModalChart>

        <div className="portfolio-header-grid">
          {this.props.name}
          <button
            onClick={this.handleChangeCurrencyToEUR.bind(this)}
            className="btn btn-light btn-sm"
          >
            Show in €
          </button>
          <button
            onClick={this.handleChangeCurrencyToUSD.bind(this)}
            className="btn btn-light btn-sm"
          >
            Show in $
          </button>

          <button
            type="button"
            class="close deleteButton"
            aria-label="Close"
            onClick={this.handleDelete.bind(this)}
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div className="stocks-container-full">
          <div className="stocks-header">
            <span className="stocks-info">Stock</span>
            <span className="stocks-info">Quantity</span>
            <span className="stocks-info">Unit value</span>
            <span className="stocks-info">Total value</span>
            <span className="stocks-info">Select</span>
          </div>

          <div className="stocks-container">
            {this.state.stocks.map(stock => (
              <Stock
                selectStockMethod={this.selectStockMethod.bind(this)}
                name={stock.name}
                unitValue={stock.unitValue + this.getCurrencySymbol()}
                quantity={stock.quantity}
                totalValue={stock.totalValue + this.getCurrencySymbol()}
              />
            ))}
          </div>
        </div>

        <div className="portfolio-total-value">
          Total value of Portfolio: {this.getTotalValue()}
        </div>
        <div className="portfolio-footer-buttons">
          <Modal
            className="modal"
            show={this.state.isShowing}
            close={this.closeModalHandler}
          >
            <div>
              <span className="add-stock-input">
                Stock symbol:{" "}
                <input
                  value={this.state.inputStockSymbol}
                  onChange={evt => this.handleStockSymbolChange(evt)}
                  type="text"
                />
              </span>
            </div>
            <div>
              <span className="add-stock-input">
                Number of shares:{" "}
                <input
                  value={this.state.inputShareAmount}
                  onChange={evt => this.handleShareAmountChange(evt)}
                  type="number"
                  min="0"
                  step="1"
                />
              </span>
            </div>
            <div>
              <button
                className="btn btn-primary"
                onClick={this.handleAddStock.bind(this)}
              >
                {" "}
                Add stock
              </button>
            </div>
          </Modal>
          <button
            className="btn btn-primary btn-sm button-addstock"
            onClick={this.openModalHandler}
          >
            Add Stock
          </button>

          <button
            className="btn btn-info btn-sm button-graph"
            onClick={this.openModalChartHandler.bind(this)}
          >
            Perf graph of selected
          </button>
          <button
            className="btn btn-danger btn-sm button-removestock"
            onClick={this.deleteSelectedStocks.bind(this)}
          >
            Remove selected
          </button>
        </div>
      </div>
    );
  }
}

export default Portfolio;
