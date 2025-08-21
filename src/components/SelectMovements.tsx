import { MovementId } from "@/lib/movementId";
import movements from "@/lib/movementList";
import { X } from "lucide-react";
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
  DrawerClose,
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
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            Selected: {selectedMovements.length}
          </span>
        </div>
        <Input
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
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
                key={movement.id}
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
        <DrawerHeader className="relative mb-4">
          <DrawerTitle className="text-center"></DrawerTitle>
          <DrawerClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DrawerClose>
        </DrawerHeader>
        <ScrollArea className="overflow-y-auto px-4">
          {renderContent()}
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
};

export default SelectMovements;
