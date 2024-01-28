import { Transition } from "./Transition";

export class fsmNode {
  private x;
  private y;
  private isFinal;
  private label: string;
  private out: Transition[];

  constructor(x: number, y: number, label: string) {
    this.x = x;
    this.y = y;
    this.isFinal = false;
    this.label = label;
    this.out = [];
  }

  public getX() {
    return this.x;
  }

  public getY() {
    return this.y;
  }

  public setFinal(final: boolean) {
    this.isFinal = final;
  }

  public getFinal() {
    return this.isFinal;
  }

  public setX(x: number) {
    this.x = x;
  }

  public setY(y: number) {
    this.y = y;
  }

  public getLabel() {
    return this.label;
  }

  public setLabel(label: string) {
    this.label = label;
  }

  public setOut(out: Transition[]) {
    this.out = out;
  }

  public getOut() {
    return this.out;
  }
}
