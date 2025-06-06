import { MovementId } from "@/lib/movementId";
import movements from "@/lib/movementList";
import { AnimatePresence, motion } from "framer-motion";
import { XIcon } from "lucide-react";
import * as React from "react";
import { Badge } from "./ui/badge";

interface SelectedMovementsProps {
  show: boolean;
  selectedMovements: MovementId[];
  addMoreMovementsButton: React.ReactNode;
  onRemoveMovement: (movement: MovementId) => void;
}

const itemVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

const SelectedMovements: React.FunctionComponent<SelectedMovementsProps> = ({
  show,
  selectedMovements,
  addMoreMovementsButton,
  onRemoveMovement,
}) => {
  if (!show) return null;
  return (
    <motion.div
      className="flex flex-row flex-wrap gap-2 justify-center my-2"
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence>
        {selectedMovements.map((x, index) => (
          <motion.div
            key={x}
            variants={itemVariants}
            custom={index}
            initial="hidden"
            animate="visible"
          >
            <Badge
              className="rounded-full pr-2 pl-3 py-1.5 gap-1.5 cursor-pointer text-sm"
              variant={"secondary"}
              onClick={() => onRemoveMovement(x)}
            >
              {movements.find((y) => y.id === x)?.name ??
                "invalid movement name"}
              <XIcon className="h-3 w-3" />
            </Badge>
          </motion.div>
        ))}
        {addMoreMovementsButton}
      </AnimatePresence>
    </motion.div>
  );
};

export default SelectedMovements;
