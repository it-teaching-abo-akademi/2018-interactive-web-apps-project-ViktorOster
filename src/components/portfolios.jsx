import React, { Component } from "react";
import Portfolio from "./portfolio";

class Portfolios extends Component {
  constructor(props) {
    super(props);
    // Assign state itself, and a default value for items
    this.state = {
      portfolios: [],
      inputValue: ""
    };
    //bind functions so they can be used
    this.isEmpty = this.isEmpty.bind(this);
    this.clearEmpties = this.clearEmpties.bind(this);
  }
  //checks for empty objects
  isEmpty(obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) return false;
    }
    return true;
  }
  //removes empties in object
  clearEmpties(obj) {
    let newObj = [];
    Object.keys(obj).forEach(prop => {
      if (obj[prop]) {
        newObj[prop] = obj[prop];
      }
    });
    return newObj;
  }

  deleteMethod(val) {
    var newArray = this.state.portfolios.slice();

    for (var o in newArray) {
      if (newArray[o]["name"] == val) {
        newArray.splice(o, 1);
        //remove portfolio stocks from local storage
        localStorage.removeItem(val + "Stocks");
      }
    }
    newArray = this.clearEmpties(newArray);
    this.setState({ portfolios: newArray });
  }

  handleAddPortfolio() {
    if (this.state.portfolios.length < 10) {
      var portfolioName = prompt("Please enter portfolio name");

      if (portfolioName != null) {
        for (var i in this.state.portfolios) {
          if (this.state.portfolios[i]["name"] === portfolioName) {
            alert(
              "Portfolio " +
                portfolioName +
                " already exists. Please provide a unique portfolio name"
            );
            return;
          }
        }
        var newArray = this.state.portfolios.slice();
        var dict = {
          name: portfolioName
        };
        newArray.push(dict);
        this.setState({ portfolios: newArray });
        this.state.inputValue = "";
      }
    } else {
      alert("Maximum amount of portfolios (10) has been reached");
    }
  }
  componentWillMount() {
    document.body.style = "background: #f2f2f2;";
    localStorage.getItem("portfolios") &&
      this.setState({
        portfolios: JSON.parse(localStorage.getItem("portfolios"))
      });
  }

  componentWillUpdate(nextProps, nextState) {
    //if there are no portfolios, clear local storage
    //(since that means there is nothing to be stored)
    //to prevent null values from being stored
    if (!this.isEmpty(nextState.portfolios)) {
      localStorage.setItem("portfolios", JSON.stringify(nextState.portfolios));
    } else {
      localStorage.clear();
    }
  }

  render() {
    return (
      <div className="portfolios-wrapper">
        <div class="page-header">
          <h1>Stock Portfolio Management System</h1>
        </div>
        <button
          className="button-add-portfolio btn btn-primary"
          onClick={this.handleAddPortfolio.bind(this)}
        >
          Add Portfolio
        </button>

        {/* only render portfolios if atleast one exists */}
        {this.state.portfolios.length
          ? this.state.portfolios.map(portfolio => (
              <Portfolio
                name={portfolio.name}
                deleteMethod={this.deleteMethod.bind(this)}
              />
            ))
          : console.log("no portfolios found")}
      </div>
    );
  }
}

export default Portfolios;
