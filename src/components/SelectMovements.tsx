import { MovementId } from "@/lib/movementId";
import movements from "@/lib/movementList";
import { Dumbbell } from "lucide-react";
import * as React from "react";
import MovementList from "./MovementList";
import { Button } from "./ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import { ScrollArea } from "./ui/scroll-area";

interface SelectMovementsProps {
  selectedMovements: MovementId[];
  disabled: boolean;
  toggleMovement: (movement: MovementId) => void;
}

const SelectMovements: React.FunctionComponent<SelectMovementsProps> = ({
  selectedMovements,
  disabled,
  toggleMovement,
}) => {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          size="icon"
          disabled={disabled}
          variant="outline"
          className={disabled ? "" : "border-[#0ea5e9]"}
        >
          <Dumbbell />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-center">Movements</DrawerTitle>
        </DrawerHeader>
        <ScrollArea className="h-[80vh]">
          <MovementList
            movements={movements}
            selectedMovements={selectedMovements}
            handleToggleMovement={toggleMovement}
          />
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
};

export default SelectMovements;
