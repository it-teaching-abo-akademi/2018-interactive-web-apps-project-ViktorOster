import React from "react";

import "./modalChart.css";

const modalChart = props => {
  return (
    <div
      className="modal-wrapper"
      style={{
        transform: props.show ? "translateY(-10vh)" : "translateY(-80vh)",
        visibility: props.show ? "visible" : "hidden",

        opacity: props.show ? "1" : "0"
      }}
    >
      <div className="modal-header">
        <h3>{props.name} historic stock data</h3>
        <span className="close-modal-btn" onClick={props.close}>
          ×
        </span>
      </div>

      <div className="modal-body">{props.children}</div>
      {/* <div className="modal-footer">
          <button className="btn-cancel" onClick={props.close}>
            CLOSE
          </button>
          <button className="btn-continue">CONTINUE</button>
        </div> */}
    </div>
  );
};

export default modalChart;
