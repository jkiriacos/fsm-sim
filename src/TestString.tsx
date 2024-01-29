//React component that allows for inputting and testing strings

import { initialState } from "./Canvas/Canvas";
import { context } from "./Canvas/useCanvas";
import { drawAll, drawArrow, drawNode } from "./FSM/Drawing";
import { fsmNode } from "./FSM/Node";

export default function TestString(){

  return <div id="test">
    <button type="button" onClick={testHelper}>Test String</button>
  <input type="text" id="testString" onChange={updateInput}/>
  </div>
}

//timer function
function timeout(delay: number) {
  return new Promise( res => setTimeout(res, delay) );
}

//helper for testing a string
async function testHelper(){

  await test(initialState, input);
   await timeout(750);
   drawAll()
}

//tests an input string with the created graph
async function test(curState: fsmNode, input: string): Promise<boolean>{

  drawNode(curState.getX(), curState.getY(), "lightblue", curState.getFinal(), curState.getLabel());
  await timeout(150);
  
  //if the string has been searched through, check if the current state is final
  if(input.length === 0){
    if(curState.getFinal()){
     
      drawNode(curState.getX(), curState.getY(), "lightgreen", curState.getFinal(), curState.getLabel());
      return true;
    }

    drawNode(curState.getX(), curState.getY(), "pink", curState.getFinal(), curState.getLabel());
    await timeout(150);
    drawNode(curState.getX(), curState.getY(), "grey", curState.getFinal(), curState.getLabel());

    return false;
  }

  drawNode(curState.getX(), curState.getY(), "grey", curState.getFinal(), curState.getLabel());

  //checks and explores valid paths
  for(let i = 0; i < curState.getOut().length; i ++){
    
    let from = curState.getOut()[i].getFrom();
    let to = curState.getOut()[i].getTo()

    if(input.startsWith(curState.getOut()[i].getLabel())){

      drawArrow(context,from.getX(),from.getY(),curState.getOut()[i].getMidX(), curState.getOut()[i].getMidY(), to.getX(), to.getY(), "lightblue")
      await timeout(150);
      drawArrow(context,from.getX(),from.getY(),curState.getOut()[i].getMidX(), curState.getOut()[i].getMidY(), to.getX(), to.getY(), "black")

      if(await test(to, input.substring(curState.getOut()[i].getLabel().length, input.length))){
        
        drawArrow(context,curState.getOut()[i].getFrom().getX(),curState.getOut()[i].getFrom().getY(),curState.getOut()[i].getMidX(), curState.getOut()[i].getMidY(), curState.getOut()[i].getTo().getX(), curState.getOut()[i].getTo().getY(), "lightgreen")
        await timeout(150);    
        drawNode(curState.getX(), curState.getY(), "lightgreen", curState.getFinal(), curState.getLabel());
        await timeout(150);

        return true;
        
      }
      else{
        drawArrow(context,from.getX(),from.getY(),curState.getOut()[i].getMidX(), curState.getOut()[i].getMidY(), to.getX(), to.getY(), "pink")
        await timeout(150);
        drawArrow(context,from.getX(), from.getY(),curState.getOut()[i].getMidX(), curState.getOut()[i].getMidY(), to.getX(), to.getY(), "black")
        drawNode(curState.getX(), curState.getY(), "pink", curState.getFinal(), curState.getLabel());
        await timeout(150);
        drawNode(curState.getX(), curState.getY(), "grey", curState.getFinal(), curState.getLabel());
      }
    }
  }

  return false;
}


let input = "";
function updateInput(e: { target: { value: string; }; }){
  input = e.target.value;
}
