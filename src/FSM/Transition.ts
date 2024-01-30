//Transition class with all necessary data, including label, scale, coordinates, etc
import { fsmNode } from "./Node";

export class Transition {
  private to;
  private from;
  private midx;
  private midy;
  private label;
  scale;

  constructor(from: fsmNode, to: fsmNode, midx: number, midy: number) {
    this.from = from;
    this.to = to;
    this.label = "";
    this.midx = midx;
    this.midy = midy;
    this.scale = 0;
  }

  public getFrom() {
    return this.from;
  }

  public getTo() {
    return this.to;
  }

  public getMidX() {
    return this.midx;
  }

  public getMidY() {
    return this.midy;
  }

  public setMidX(x: number) {
    this.midx = x;
  }

  public setMidY(y: number) {
    this.midy = y;
  }

  public getLabel() {
    return this.label;
  }

  public setLabel(label: string) {
    this.label = label;
  }
}
