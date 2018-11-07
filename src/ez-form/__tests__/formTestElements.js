import React from "react";
import ReactSelect from "react-select";
import { InputTypes } from "../index";

function TextInput({ label, error, fontSize, ...restProps }) {
  return (
    <div className="TestTextInput">
      {label && <div>Label: {label}</div>}
      {error && <div>Error: {error}</div>}
      <input
        type="text"
        {...restProps}
        title={error}
        style={{
          background: error ? "coral" : "white",
          fontSize: fontSize || 16
        }}
      />
    </div>
  );
}

function Select({ label, error, value, options, onChange, ...restProps }) {
  if (typeof value === "string" && options) {
    value = options.find(option => option.value === value);
  }

  return (
    <div className="TestSelect" onClick={onChange}>
      {label && <div>Label: {label}</div>}
      {error && <div>Error: {error}</div>}
      <ReactSelect
        value={value}
        options={options}
        onChange={onChange}
        {...restProps}
      />
    </div>
  );
}

let formElements = {
  textInput: { type: InputTypes.TEXT, Component: TextInput },
  select: { type: InputTypes.SELECT, Component: Select }
};

export default formElements;
