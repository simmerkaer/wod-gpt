import { MovementId } from "@/lib/movementId";
import movements from "@/lib/movementList";
import * as React from "react";
import MovementList from "./MovementList";
import ToggableMovement from "./ToggableMovement";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import { Input } from "./ui/input";
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
  const [search, setSearch] = React.useState("");

  return (
    <Drawer>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-center"></DrawerTitle>
        </DrawerHeader>
        <ScrollArea className="overflow-y-auto px-4">
          <Input
            className="mb-2"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search === "" ? (
            <MovementList
              selectedMovements={selectedMovements}
              handleToggleMovement={toggleMovement}
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 w-full mt-4">
              {movements
                .filter((movement) =>
                  movement.name.toLowerCase().startsWith(search.toLowerCase()),
                )
                .map((movement) => (
                  <ToggableMovement
                    movement={movement}
                    selectedMovements={selectedMovements}
                    handleToggleMovement={toggleMovement}
                  />
                ))}
            </div>
          )}
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
};

export default SelectMovements;
