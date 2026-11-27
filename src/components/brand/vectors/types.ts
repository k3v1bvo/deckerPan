import React from "react";
import { SVGMotionProps } from "framer-motion";

export interface MascotVectorProps extends SVGMotionProps<SVGSVGElement> {
  className?: string;
  color?: string;
  title?: string;
}
