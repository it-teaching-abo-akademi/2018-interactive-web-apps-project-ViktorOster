import React, { Component } from "react";
import { FaPlus } from "react-icons/fa";

class Stock extends Component {
  constructor(props) {
    super(props);
    this.handleSelect = this.handleSelect.bind(this);
    this.isSelected = false;
  }
  //call select stock in parent
  handleSelect() {
    if (this.isSelected) {
      this.isSelected = false;
    } else {
      this.isSelected = true;
    }

    //force update render to register select value
    this.forceUpdate();
    this.props.selectStockMethod(this.props.name, this.isSelected);
  }
  returnTotalValue() {
    //return totalValue;
  }
  getIsSelected(val) {
    return val;
  }

  render() {
    return (
      <div className={"stock " + (this.isSelected ? "selected" : "")}>
        <span className="stockInfo">{this.props.name}</span>
        <span className="stockInfo">{this.props.quantity}</span>
        <span className="stockInfo">{this.props.unitValue}</span>
        <span className="stockInfo">{this.props.totalValue}</span>
        <button onClick={this.handleSelect} className="btn btn-light btn-sm">
          <FaPlus />
        </button>
      </div>
    );
  }
}
export default Stock;
