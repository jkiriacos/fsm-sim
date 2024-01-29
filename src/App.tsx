import { Component } from "react";
import "./App.css";
import Canvas from "./Canvas/Canvas";
import { drawAll } from "./FSM/Drawing";
import Table from "./TransitionTable";
import TestString from "./TestString";

//TODO: make site look half decent...

class App extends Component {
  render() {
    return (
      <div id="wrapper">
        <div id="canvas">
          <Canvas
            draw={drawAll}
            fill={"grey"}
            width="900"
            height="510"
            id="Canvas"
            style={{ border: "2px solid black" }}
          />
        </div>
        <div id="tableContainer">
          <div id="table">{Table()}</div>
        </div>
        <TestString />
        <div id="credit">
        <p>Made by <a href="https://github.com/jkiriacos/fsm-sim.git" rel="noreferrer" target="_blank">Joseph Kiriacos</a></p>
        </div>
        <p>
          Controls: 
          <pre>
            - Double click to create a new node.{'\n'}
            - Ctrl+drag to create a new transition.{'\n'}
            - Drag a transition midpoint to change the curve.{'\n'}
            - While a transition or node is selected, {'\n  '}type to change its label.{'\n'}
            - Press delete to delete a node or transition.{'\n'}
            - Double click an existing node to toggle {'\n'}  if it is final.{'\n'}
            </pre>
          </p>
      </div>
      
    );
  }
}

export default App;
