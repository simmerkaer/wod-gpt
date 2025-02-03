import React from "react";

interface GeneratedWodProps {
  wod: string | null;
}

const GeneratedWod: React.FunctionComponent<GeneratedWodProps> = ({ wod }) => {
  if (wod) return <pre className="text-left mt-4 text-wrap">{wod}</pre>;
};

export default GeneratedWod;
