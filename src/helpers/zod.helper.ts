import { z } from "zod";

export const requiredNumberSelect = z.preprocess(
  (val) => {
    if (val === "" || val === undefined || val === null) return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  },
  z
    .number({
      message: "This field is required",
    })
    .min(1, "This field is required")
);
