import React from "react";

import "./modal.css";

const modal = props => {
  return (
    <div
      className="modal-wrapper"
      style={{
        transform: props.show ? "translateY(-20vh)" : "translateY(-80vh)",

        visibility: props.show ? "visible" : "hidden",
        opacity: props.show ? "1" : "0"
      }}
    >
      <div className="modal-header">
        <h3>Add Stock</h3>
        <span className="close-modal-btn" onClick={props.close}>
          ×
        </span>
      </div>
      <div className="modal-body">{props.children}</div>
    </div>
  );
};

export default modal;
