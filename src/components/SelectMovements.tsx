import { MovementId } from "@/lib/movementId";
import movements from "@/lib/movementList";
import * as React from "react";
import { useState } from "react";
import { useMediaQuery } from "usehooks-ts";
import MovementList from "./MovementList";
import ToggableMovement from "./ToggableMovement";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "./ui/dialog";
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
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const renderContent = () => (
    <>
      <Input
        className="mb-2"
        placeholder="Search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {search === "" ? (
        <div>
          <MovementList
            selectedMovements={selectedMovements}
            handleToggleMovement={toggleMovement}
          />
        </div>
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
    </>
  );

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="min-w-[80vw]">
          <DialogHeader></DialogHeader>
          <ScrollArea className="overflow-y-auto h-[80vh] px-4">
            {renderContent()}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-center"></DrawerTitle>
        </DrawerHeader>
        <ScrollArea className="overflow-y-auto px-4">
          {renderContent()}
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
};

export default SelectMovements;
