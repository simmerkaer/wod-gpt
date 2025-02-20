import * as React from "react";
import { Badge } from "./ui/badge";

interface SelectedMovementsProps {
  selectedMovements: string[];
}

const SelectedMovements: React.FunctionComponent<SelectedMovementsProps> = ({
  selectedMovements,
}) => {
  return (
    <div className="flex flex-row gap-2 justify-center">
      {selectedMovements.map((x) => (
        <Badge variant="secondary">{x}</Badge>
      ))}
    </div>
  );
};

export default SelectedMovements;
