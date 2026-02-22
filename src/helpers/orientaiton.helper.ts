import { useEffect, useState } from "react";

export const useOrientation = (): "vertical" | "horizontal" => {
    const [orientation, setOrientation] = useState<"vertical" | "horizontal">(
        window.innerWidth >= 768 ? "vertical" : "horizontal"
    );

    useEffect(() => {
        const handleResize = () => {
            setOrientation(window.innerWidth >= 768 ? "vertical" : "horizontal");
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return orientation;
}