import React from "react";

interface GeneratedWodProps {
  wod: string | null;
}

const GeneratedWod: React.FunctionComponent<GeneratedWodProps> = ({ wod }) => {
  return <pre className="text-left p-10 xl:w-300">{wod}</pre>;
};

export default GeneratedWod;
