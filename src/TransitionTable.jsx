//React comp that is a table with all transitions

import { transitions } from "./Canvas/Canvas";

export default function Table() {
  return (
    <table>
      <thead>
        <tr>
          <th>From</th>
          <th>Label</th>
          <th>To</th>
        </tr>
      </thead>
      <tbody>
        {transitions.map((trans) => (
          <tr>
            <th>{trans.getFrom().getLabel()}</th>
            <th>{trans.getLabel()}</th>
            <th>{trans.getTo().getLabel()}</th>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
