import { MovementId } from "@/lib/movementId";
import * as React from "react";
import MovementList from "./MovementList";
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
  trigger: React.ReactNode;
  toggleMovement: (movement: MovementId) => void;
}

const SelectMovements: React.FunctionComponent<SelectMovementsProps> = ({
  selectedMovements,
  trigger,
  toggleMovement,
}) => {
  return (
    <Drawer>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-center">Movements</DrawerTitle>
        </DrawerHeader>
        <ScrollArea className="overflow-y-auto">
          <MovementList
            selectedMovements={selectedMovements}
            handleToggleMovement={toggleMovement}
          />
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
};

export default SelectMovements;
