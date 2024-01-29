//Provides all methods for drawing to the canvas

import {
  NODESIZE,
  initialState,
  nodes,
  selectedItem,
  transitions,
} from "../Canvas/Canvas";
import { context } from "../Canvas/useCanvas";
import { fsmNode } from "./Node";
import { Transition } from "./Transition";

export const drawNode = (
  x: number,
  y: number,
  fill: string,
  final: boolean,
  label: string
) => {
  //draws the circle of the node
  context.beginPath();
  context.arc(x, y, NODESIZE, 0, 2 * Math.PI);

  context.moveTo(x + NODESIZE * 0.85, y);

  //if the node is final, add an inner circle
  if (final) context.arc(x, y, NODESIZE * 0.85, 0, 2 * Math.PI);

  context.fillStyle = fill;
  context.fill();
  context.lineWidth = 1;
  context.strokeStyle = "black";
  context.stroke();
  context.fillStyle = "black";
  context.fillText(label, x, y + 5);
};

//draws a new arrow
export const drawNewArrow = (
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  push: boolean
) => {
  let theta = Math.atan2(startY - endY, startX - endX);
  let startNode = getNode(startX, startY);
  let endNode = getNode(endX, endY);

  let midX = (startX - NODESIZE * Math.cos(theta) + endX) / 2;
  let midY = (startY - NODESIZE * Math.sin(theta) + endY) / 2;

  if (endNode) {
    if (endNode === startNode) {
      midX = startNode.getX() - 60 * Math.cos(theta);
      midY = startNode.getY() - 60 * Math.sin(theta);
    } else {
      endX = endNode.getX();
      endY = endNode.getY();

      midX = (startX + endX) / 2;
      midY = (startY + endY) / 2;
    }
  }

  if (push) {
    //creates a new transition now that the node is valid
    let toAdd = new Transition(startNode!, endNode!, midX, midY);

    transitions.push(toAdd);
    startNode!.getOut().push(toAdd);
  }

  drawArrow(context, startX, startY, midX, midY, endX, endY, "black");
};

export const drawArrow = (
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  midX: number,
  midY: number,
  endX: number,
  endY: number,
  color: String
) => {
  ctx.beginPath();
  ctx.fillStyle = color.toString();
  ctx.strokeStyle = color.toString();

  //only draw a line if the arrow is a little outside of the node

  let theta = Math.atan2(startY - endY, startX - endX);
  let theta2 = Math.atan2(startY - midY, startX - midX);

  let endNode = getNode(endX, endY);
  let startNode = getNode(startX, startY);

  ctx.arc(midX, midY, 3, 0, 2 * Math.PI);
  ctx.fill();

  startX = startX - NODESIZE * Math.cos(theta2);
  startY = startY - NODESIZE * Math.sin(theta2);

  //if the endnode of the arrow exists, draw it
  if (endNode !== undefined) {
    const dist = Math.sqrt(
      Math.pow(startX - endX, 2) + Math.pow(startY - endY, 2)
    );

    let controlXOffset = 0.2 * dist * Math.cos(theta);
    let controlYOffset = 0.2 * dist * Math.sin(theta);

    //handles circular transitions
    if (endNode === startNode) {
      theta = Math.atan2(startNode.getY() - midY, startNode.getX() - midX);
      endX = endNode.getX() - NODESIZE * Math.cos(theta + 0.75);
      endY = endNode.getY() - NODESIZE * Math.sin(theta + 0.75);
      startX = startNode.getX() - NODESIZE * Math.sin(theta + 0.75);
      startY = startNode.getY() + NODESIZE * Math.cos(theta + 0.75);
      ctx.moveTo(startX, startY);
      ctx.arc(
        midX + Math.cos(theta) * 25,
        midY + Math.sin(theta) * 25,
        25,
        theta + 1,
        theta - 1
      );
    } else {
      //handles regular transitions
      theta2 = Math.atan2(midY - endY, midX - endX);
      endX = endX + NODESIZE * Math.cos(theta2);
      endY = endY + NODESIZE * Math.sin(theta2);
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(
        midX + controlXOffset,
        midY + controlYOffset,
        midX,
        midY
      );
      ctx.moveTo(midX, midY);
      ctx.quadraticCurveTo(
        midX - controlXOffset,
        midY - controlYOffset,
        endX,
        endY
      );
    }
  } else {
    //if there is no endnode, draw a straight line
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo((startX + endX) / 2, (startY + endY) / 2, endX, endY);
  }

  //draws the ending arrow itself
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(endX, endY);

  theta = Math.atan2(midY - endY, midX - endX);
  if (endNode === startNode) theta += 0.9;

  ctx.lineTo(
    endX + 8 * Math.cos(theta + 0.6),
    endY + 8 * Math.sin(theta + 0.6)
  );
  ctx.lineTo(
    endX + 8 * Math.cos(theta - 0.6),
    endY + 8 * Math.sin(theta - 0.6)
  );
  ctx.moveTo(endX, endY);
  ctx.lineTo(
    endX + 8 * Math.cos(theta - 0.6),
    endY + 8 * Math.sin(theta - 0.6)
  );
  ctx.fill();

  ctx.stroke();
};

//finds the closest element that to a click
export function findElement(
  x: number,
  y: number
): fsmNode | Transition | undefined {
  let min = Number.MAX_VALUE;
  let element: fsmNode | Transition | undefined = undefined;

  //goes through all transitions to find the closest element
  transitions.forEach((trans: Transition) => {
    let distance = Math.sqrt(
      Math.pow(trans.getMidX() - x, 2) + Math.pow(trans.getMidY() - y, 2)
    );
    if (distance < min && distance <= 10) {
      min = distance;
      element = trans;
    }
  });

  //goes through all nodes to find the closest element
  nodes.forEach((node: fsmNode) => {
    let distance = Math.sqrt(
      Math.pow(node.getX() - x, 2) + Math.pow(node.getY() - y, 2)
    );
    if (distance < min && distance <= NODESIZE) {
      min = distance;
      element = node;
    }
  });

  return element;
}

//finds a node based on the input coordinates if it exists
export function getNode(x: number, y: number) {
  return nodes.find((node: fsmNode) => {
    if (
      Math.sqrt(Math.pow(x - node.getX(), 2) + Math.pow(y - node.getY(), 2)) <=
      NODESIZE
    ) {
      return node;
    }
    return undefined;
  });
}

//draws all nodes and transitions and refreshes the canvas
export const drawAll = () => {
  const canvas = document.getElementById("Canvas") as HTMLCanvasElement;

  context.clearRect(0, 0, canvas.width, canvas.height);

  //draws all nodes
  nodes.forEach((node: fsmNode) => {
    let color = "grey";

    if (node === initialState) {
      drawArrow(
        context,
        node.getX() - 31,
        node.getY(),
        node.getX() - 75,
        node.getY(),
        node.getX() - 0,
        node.getY(),
        "black"
      );
    }

    if (node === selectedItem)
      //if the node is selected, make it blue
      color = "lightblue";

    drawNode(node.getX(), node.getY(), color, node.getFinal(), node.getLabel());
  });

  //draws all transitions
  transitions.forEach((trans: Transition) => {
    let from = trans.getFrom();
    let to = trans.getTo();
    let color = "black";

    //if the transition is selected, make it blue
    if (trans === selectedItem) color = "lightblue";

    drawArrow(
      context,
      from.getX(),
      from.getY(),
      trans.getMidX(),
      trans.getMidY(),
      to.getX(),
      to.getY(),
      color
    );

    context.fillText(trans.getLabel(), trans.getMidX(), trans.getMidY() - 10);
  });
};
