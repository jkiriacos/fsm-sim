import { useRef, useEffect } from "react";
import {
  onDblClick,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onKeyPress,
} from "./Canvas";

export let context;

const useCanvas = (draw) => {
  const _ref = useRef(null);

  useEffect(() => {
    let canv = _ref.current;
    context = canv.getContext("2d");
    canv.setAttribute("tabindex", 0);

    canv.addEventListener("dblclick", onDblClick);
    canv.addEventListener("mousedown", onMouseDown);
    canv.addEventListener("mousemove", onMouseMove);
    canv.addEventListener("mouseup", onMouseUp);
    canv.addEventListener("keydown", onKeyPress);
    context.font = "12px Arial";
    context.textAlign = "center";
    draw();
    //draw(context,x,y, fill)

    // Clean up function
    return () => {
      canv.removeEventListener("dblclick", onDblClick);
      canv.removeEventListener("mousedown", onMouseDown);
      canv.removeEventListener("mousemove", onMouseMove);
      canv.removeEventListener("mouseup", onMouseUp);
      canv.removeEventListener("keydown", onKeyPress);
    };
  }, [draw]);

  return _ref;
};

export default useCanvas;
