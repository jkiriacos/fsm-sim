import useCanvas from "./useCanvas";
import {
  drawAll,
  drawNewArrow,
  findElement,
  getNode,
  drawNode,
} from "../FSM/Drawing";
import { fsmNode } from "../FSM/Node";
import { Transition } from "../FSM/Transition";
import ReactDOMServer from "react-dom/server";
import $ from "jquery";
import Table from "../TransitionTable";

export let nodes = [];
export let transitions = [];
export const NODESIZE = 30;
let nodeCtr = 0;

export let selectedItem;
let heldNode;
let heldTrans;
export let initialState;

const Canvas = (props) => {
  nodes[0] = new fsmNode(150, 150, nodeCtr.toString());
  nodeCtr = nodes.length - 1;
  nodes[0].setFinal(true);
  initialState = nodes[0];

  const { draw, x, y, fill, ...rest } = props;

  let ref = useCanvas(draw, x, y, fill);

  return <canvas ref={ref} {...rest} />;
};

export function onDblClick(e) {
  const { clientX, clientY } = e;

  let close = getNode(clientX, clientY);

  //if a node is at the click, toogle its finality
  if (close !== undefined) {
    close.setFinal(!close.getFinal());
    drawAll();
  }

  //create a new node if nothing is there
  else {
    nodeCtr++;
    nodes.push(new fsmNode(clientX, clientY, nodeCtr.toString()));
    drawNode(clientX, clientY, "grey", false, nodeCtr.toString());
  }
}

export function onMouseDown(e) {
  const { clientX, clientY } = e;

  let elem = findElement(clientX, clientY);

  selectedItem = elem;

  //selects a given item based on the click
  if (elem instanceof fsmNode) heldNode = elem;
  else if (elem instanceof Transition) heldTrans = elem;
}

export function onMouseMove(e) {
  const { clientX, clientY } = e;

  if (heldNode !== undefined) {
    //if an arrow is being drawn, draw a new arrow

    if (e.ctrlKey) {
      drawAll();
      drawNewArrow(heldNode.getX(), heldNode.getY(), clientX, clientY, false);
      return;
    }

    transitions.forEach((trans) => {
      //if a transition connects the node that is being moved, change the midpoint

      if (trans.getFrom() === heldNode || trans.getTo() === heldNode) {
        let theta = Math.atan2(
          trans.getFrom().getY() - trans.getTo().getY(),
          trans.getFrom().getX() - trans.getTo().getX(),
        );

        const fromX = trans.getFrom().getX();
        const fromY = trans.getFrom().getY();
        const toX = trans.getTo().getX();
        const toY = trans.getTo().getY();

        const midX = (fromX + toX) / 2;
        const midY = (fromY + toY) / 2;

        const dx = toX - fromX;
        const dy = toY - fromY;

        const distance = Math.sqrt(dx * dx + dy * dy);

        //set midpoint to middle of true line if the transition is linear

        if (trans.getFrom() === trans.getTo()) {
          trans.setMidX(trans.getMidX() - (trans.getFrom().getX() - clientX));
          trans.setMidY(trans.getMidY() - (trans.getFrom().getY() - clientY));
        } else if (trans.scale === 0) {
          let other = trans.getFrom();

          if (heldNode === trans.getFrom()) other = trans.getTo();

          if (trans.getFrom() === trans.getTo()) {
            trans.setMidX(trans.getMidX() - (trans.getFrom().getX() - clientX));
            trans.setMidY(trans.getMidY() - (trans.getFrom().getY() - clientY));
          } else {
            trans.setMidX((other.getX() + clientX) / 2);
            trans.setMidY((other.getY() + clientY) / 2);
          }
        }

        //adjust curvature of line while keeping correct scale if it is quadratic
        else {
          let xDir = 1;
          let yDir = 1;

          const controlPointX =
            midX - distance * trans.scale * Math.sin(theta) * xDir;
          const controlPointY =
            midY + distance * trans.scale * Math.cos(theta) * yDir;

          trans.setMidX(controlPointX);
          trans.setMidY(controlPointY);
        }
      }
    });

    //change the node coordinates to match the current mouse position
    drawAll();
    heldNode.setX(clientX);
    heldNode.setY(clientY);
    //TODO: prevent node stacking? add check
    
  }

  //if a transition midpoint is being moved
  else if (heldTrans !== undefined) {
    //calculates the distance between the start and end nodes
    let dist = Math.sqrt(
      Math.pow(heldTrans.getFrom().getX() - heldTrans.getTo().getX(), 2) +
        Math.pow(heldTrans.getFrom().getY() - heldTrans.getTo().getY(), 2),
    );

    //calculates the midpoint coordinates
    let midx = (heldTrans.getFrom().getX() + heldTrans.getTo().getX()) / 2;
    let midy = (heldTrans.getFrom().getY() + heldTrans.getTo().getY()) / 2;

    let theta = Math.atan2(
      heldTrans.getTo().getY() - heldTrans.getFrom().getY(),
      heldTrans.getTo().getX() - heldTrans.getFrom().getX(),
    );

    heldTrans.scale =
      Math.sqrt(
        Math.abs(Math.pow((clientX - midx) * Math.cos(theta), 2)) +
          Math.abs(Math.pow((clientY - midy) * Math.cos(theta), 2)),
      ) / dist;

    if (heldTrans.getFrom() === heldTrans.getTo()) {
      theta = Math.atan2(
        heldTrans.getTo().getY() - clientY,
        heldTrans.getTo().getX() - clientX,
      );
      console.log(theta);
      heldTrans.setMidX(heldTrans.getFrom().getX() - 60 * Math.cos(theta));
      heldTrans.setMidY(heldTrans.getFrom().getY() - 60 * Math.sin(theta));
      //  heldTrans.setMidX(100)
      // heldTrans.setMidY(100)
      console.log("here");
    }
    //if the arrow is a straight line, just set the midpoint to center
    else if (heldTrans.scale === 0) {
      let other = heldTrans.getFrom();

      if (heldNode === heldTrans.getFrom()) other = heldTrans.getTo();

      heldTrans.setMidX((other.getX() + clientX) / 2);
      heldTrans.setMidY((other.getY() + clientY) / 2);
    }

    //if the arrow is curved, clamp it to the tangent of the line between the start and end
    else {
      let { perpSlope, yIntercept } = genPerpLine(
        heldTrans.getFrom().getX(),
        heldTrans.getFrom().getY(),
        heldTrans.getTo().getX(),
        heldTrans.getTo().getY(),
      );

      let slope = 0;
      let realX = 0;
      let realY = 0;

      if (perpSlope !== 0) {
        slope =
          (heldTrans.getFrom().getY() - heldTrans.getTo().getY()) /
          (heldTrans.getFrom().getX() - heldTrans.getTo().getX());

        let yInt = clientY - slope * clientX;
        realX = (1 / (slope - perpSlope)) * (yIntercept - yInt);
        realY = slope * realX + yInt;
      } else {
        if (yIntercept === Math.min()) {
          realX = (heldTrans.getFrom().getX() + heldTrans.getTo().getX()) / 2;
          realY = clientY;
        } else {
          realX = heldTrans.getFrom().getX();
          realY = yIntercept;
        }
      }

      heldTrans.setMidX(realX);
      heldTrans.setMidY(realY);

      heldTrans.scale =
        Math.sqrt(
          Math.abs(Math.pow(realX - midx, 2)) +
            Math.abs(Math.pow(realY - midy, 2)),
        ) / dist;

      if (theta < 0) {
        theta += Math.PI * 2;
        theta = theta % (2 * Math.PI);
      }

      if (!(theta > Math.PI / 2 && theta < (3 * Math.PI) / 2)) {
        if (slope < 0) {
          if (realY > midy && realX > midx) heldTrans.scale *= -1;
        } else if (realY > midy && realX < midx) heldTrans.scale *= -1;
      } else if (slope < 0) {
        if (realY < midy && realX < midx) heldTrans.scale *= -1;
      } else if (realY < midy && realX > midx) heldTrans.scale *= -1;
    }
    drawAll();
  }
}

function genPerpLine(x1, y1, x2, y2) {
  // Calculate midpoint coordinates
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  let slope = 0;
  let perpSlope = 0;
  let yIntercept = 0;

  if (x1 - x2 === 0) yIntercept = midY;
  else if (y1 - y2 === 0) yIntercept = Math.min();
  else {
    slope = (y1 - y2) / (x1 - x2);
    perpSlope = -1 / slope;
    console.log("inHereToo");
    yIntercept = midY - perpSlope * midX;
  }

  return { perpSlope, yIntercept };
}

export function onMouseUp(e) {
  const { clientX, clientY } = e;

  if (e.ctrlKey && heldNode !== undefined) {
    let end = getNode(clientX, clientY);

    //draws the arrow if the end node its going to exists
    if (end !== undefined) {
      if (end === heldNode)
        drawNewArrow(heldNode.getX(), heldNode.getY(), clientX, clientY, true);
      else
        drawNewArrow(
          heldNode.getX(),
          heldNode.getY(),
          end.getX(),
          end.getY(),
          true,
        );

      // if(!alphabet.includes("a"))
      // alphabet.push("a");

      const table = document.getElementById("table");

      if (table !== null) {
        const row = document.createElement("tr");
        row.innerHTML = `<tr>
          <th>${heldNode.getLabel()}</th>
          <th contenteditable='true'>${transitions[
            transitions.length - 1
          ].getLabel()}</th>
          <th>${end.getLabel()}</th></tr>`;
        table.append(row);
      }
    }
  }
  drawAll();

  //nothing is held since the mouse is up
  heldTrans = undefined;
  heldNode = undefined;
}

//TODO: create deletion, need new global node variable, create selection first
export function onKeyPress(e) {
  if (selectedItem === undefined || e.key === "Control") return;

  //deletes a node and all of the transitions that connect it
  if (e.key === "Delete") {
    //if nothing is selected currently, return

    if (selectedItem instanceof fsmNode) {
      //filters out transitions that connect the deleted node
      transitions = transitions.filter(
        (trans) =>
          !(trans.getFrom() === selectedItem || trans.getTo() === selectedItem),
      );

      nodes.splice(nodes.indexOf(selectedItem), 1);
    }

    //just deletes the transition itself
    else if (selectedItem instanceof Transition) {
      transitions.splice(transitions.indexOf(selectedItem), 1);
      selectedItem.getTo().setOut(
        selectedItem
          .getTo()
          .getOut()
          .filter((trans) => trans !== selectedItem),
      );
    }

    // let newAlph = [];

    //   transitions.forEach(trans => {
    //     if(!newAlph.includes(trans.getLabel()))
    //       newAlph.push(trans.getLabel());
    //   });

    //   // alphabet = newAlph;

    // const alpha = document.getElementById("alpha");

    // // let toReplace = ReactDOMServer.renderToStaticMarkup(
    // //   <div id="alpha">&Sigma;: {alphabet.reduce((acc, cur)=>{
    // //     return cur +", " + acc;
    // //   },"")}</div>
    // // );

    // // if (alpha !== null) $(alpha).replaceWith(toReplace);

    //deselects the deleted item
    selectedItem = undefined;
  } else if (e.key === "Backspace") {
    selectedItem.setLabel(
      selectedItem.getLabel().substring(0, selectedItem.getLabel().length - 1),
    );
  } else {
    if (/^[a-z0-9+\\|]$/i.test(e.key))
      selectedItem?.setLabel(selectedItem.getLabel() + e.key);
    if (selectedItem.getLabel().includes("\\epsilon")) {
      selectedItem.setLabel(
        selectedItem
          .getLabel()
          .substring(0, selectedItem.getLabel().length - 8) + "\u03B5",
      );
    }
  }

  const table = document.getElementById("table");

  let newTable = ReactDOMServer.renderToStaticMarkup(
    <div id="table">{Table()}</div>,
  );

  if (table !== null) {
    $(table).replaceWith(newTable);
  }

  drawAll();
}

export default Canvas;
