import { Component } from "react";
import "./App.css";
import Canvas from "./Canvas/Canvas";
import { drawAll } from "./FSM/Drawing";
import Table from "./TransitionTable";
import TestString from "./TestString";

//TODO: delete works w/ test
//TODO: make site look half decent...
//TODO: instructions

class App extends Component {
  render() {
    return (
      <div id="wrapper">
        <div id="canvas">
          <Canvas
            draw={drawAll}
            fill={"grey"}
            width="800"
            height="525"
            id="Canvas"
            style={{ border: "2px solid black" }}
          />
        </div>
        <div id="tableContainer">
          <div id="table">{Table()}</div>
        </div>
        <TestString />
      </div>
    );
  }
}

export default App;
