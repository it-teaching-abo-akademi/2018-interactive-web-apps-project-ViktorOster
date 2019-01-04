import React, { Component } from "react";

class AddBtn extends Component {
  state = {
    stocks: 0
  };

  handleAddPortfolio = () => {
    console.log("Event call to add portfolio");
  }

  render() {
    return (
      <div>
        <button className="btn btn-primary btn-sm top">Add Portfolio</button>
        <span> {this.state.stocks} </span>
      </div>
    );
  }
}

export default AddBtn;
