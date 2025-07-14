import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { gsap } from "gsap";

const useMedia = (
  queries: string[],
  values: number[],
  defaultValue: number
) => {
  const get = () =>
    values[queries.findIndex((q) => matchMedia(q).matches)] ?? defaultValue;

  const [value, setValue] = useState(get);

  useEffect(() => {
    const handler = () => setValue(get);
    queries.forEach((q) => matchMedia(q).addEventListener("change", handler));
    return () =>
      queries.forEach((q) =>
        matchMedia(q).removeEventListener("change", handler)
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queries]);

  return value;
};

const useMeasure = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  return [ref, size] as const;
};

interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: number;
}

const getImageDimensions = (url: string): Promise<ImageDimensions> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = url;
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
        aspectRatio: img.width / img.height
      });
    };
    img.onerror = () => {
      // Default dimensions if image fails to load
      resolve({
        width: 600,
        height: 400,
        aspectRatio: 1.5
      });
    };
  });
};

const preloadImages = async (items: MasonryItem[]) => {
  const dimensions = await Promise.all(
    items.map(async (item) => {
      const dims = await getImageDimensions(item.img);
      return { ...item, dimensions: dims };
    })
  );
  return dimensions;
};

interface MasonryItem {
  id: string | number;
  img: string;
  url?: string;
  height?: number; // Optional now as we'll detect it
}

interface MasonryProps {
  items: MasonryItem[];
  ease?: string;
  duration?: number;
  stagger?: number;
  animateFrom?: "top" | "bottom" | "left" | "right" | "center" | "random";
  scaleOnHover?: boolean;
  hoverScale?: number;
  blurToFocus?: boolean;
  colorShiftOnHover?: boolean;
}

interface LayoutItem extends MasonryItem {
  x: number;
  y: number;
  w: number;
  h: number;
  dimensions?: ImageDimensions;
}

interface LayoutResult {
  items: LayoutItem[];
  containerHeight: number;
}

const Masonry = ({
  items,
  ease = "power3.out",
  duration = 0.6,
  stagger = 0.05,
  animateFrom = "bottom",
  scaleOnHover = true,
  hoverScale = 0.95,
  blurToFocus = true,
  colorShiftOnHover = false,
}: MasonryProps) => {
  const columns = useMedia(
    [
      "(min-width:1200px)",
      "(min-width:800px)",
      "(min-width:600px)",
      "(min-width:400px)",
    ],
    [3, 2, 2, 1],
    1
  );

  const [containerRef, { width }] = useMeasure();
  const [imagesReady, setImagesReady] = useState(false);
  const [itemsWithDimensions, setItemsWithDimensions] = useState<(MasonryItem & { dimensions?: ImageDimensions })[]>([]);

  const getInitialPosition = (item: any) => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return { x: item.x, y: item.y };

    let direction = animateFrom;
    if (animateFrom === "random") {
      const dirs = ["top", "bottom", "left", "right"] as const;
      direction = dirs[
        Math.floor(Math.random() * dirs.length)
      ];
    }

    switch (direction) {
      case "top":
        return { x: item.x, y: -200 };
      case "bottom":
        return { x: item.x, y: window.innerHeight + 200 };
      case "left":
        return { x: -200, y: item.y };
      case "right":
        return { x: window.innerWidth + 200, y: item.y };
      case "center":
        return {
          x: containerRect.width / 2 - item.w / 2,
          y: containerRect.height / 2 - item.h / 2,
        };
      default:
        return { x: item.x, y: item.y + 100 };
    }
  };

  useEffect(() => {
    preloadImages(items).then((itemsWithDims) => {
      setItemsWithDimensions(itemsWithDims);
      setImagesReady(true);
    });
  }, [items]);

  const calculateLayout = (items: (MasonryItem & { dimensions?: ImageDimensions })[], containerWidth: number, cols: number): LayoutResult => {
    if (!containerWidth) return { items: [], containerHeight: 0 };
    const gap = containerWidth > 1000 ? 32 : 24;
    const totalGaps = (cols - 1) * gap;
    const columnWidth = (containerWidth - totalGaps) / cols;
    const columns = Array.from({ length: cols }, () => ({ height: 0, items: [] as any[] }));

    items.forEach((item: MasonryItem & { dimensions?: ImageDimensions }) => {
      // Find the shortest column
      const shortestCol = columns.reduce((acc, col, i) => 
        col.height < columns[acc].height ? i : acc, 0);

      const height = item.dimensions
        ? (columnWidth * item.dimensions.height) / item.dimensions.width
        : columnWidth;

      columns[shortestCol].items.push({
        ...item,
        x: shortestCol * (columnWidth + gap),
        y: columns[shortestCol].height,
        w: columnWidth,
        h: height
      });

      columns[shortestCol].height += height + gap;
    });

    // Find the tallest column to set container height
    const containerHeight = Math.max(...columns.map(col => col.height));

    return {
      items: columns.flatMap(col => col.items),
      containerHeight
    };
  };

  const grid = useMemo((): LayoutResult => {
    if (!width || !itemsWithDimensions.length) return { items: [], containerHeight: 0 };

    return calculateLayout(itemsWithDimensions, width, columns);
  }, [columns, items, width]);

  const hasMounted = useRef(false);

  useLayoutEffect(() => {
    if (!grid.items.length || !imagesReady) return;

    grid.items.forEach((item: LayoutItem, index: number) => {
      const selector = `[data-key="${String(item.id)}"]`;
      const animProps = { x: item.x, y: item.y, width: item.w, height: item.h };

      if (!hasMounted.current) {
        const start = getInitialPosition(item);
        gsap.fromTo(
          selector,
          {
            opacity: 0,
            x: start.x,
            y: start.y,
            width: item.w,
            height: item.h,
            ...(blurToFocus && { filter: "blur(10px)" }),
          },
          {
            opacity: 1,
            ...animProps,
            ...(blurToFocus && { filter: "blur(0px)" }),
            duration: 0.8,
            ease: "power3.out",
            delay: index * stagger,
          }
        );
      } else {
        gsap.to(selector, {
          ...animProps,
          duration,
          ease,
          overwrite: "auto",
        });
      }
    });

    hasMounted.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grid.items, imagesReady, ease, duration, stagger, animateFrom, blurToFocus]);

  const handleMouseEnter = (id: string | number, element: HTMLElement) => {
    if (scaleOnHover) {
      gsap.to(`[data-key="${id}"]`, {
        scale: hoverScale,
        duration: 0.3,
        ease: "power2.out"
      });
    }
    if (colorShiftOnHover) {
      const overlay = element.querySelector(".color-overlay");
      if (overlay) gsap.to(overlay, { opacity: 0.3, duration: 0.3 });
    }
  };

  const handleMouseLeave = (id: string | number, element: HTMLElement) => {
    if (scaleOnHover) {
      gsap.to(`[data-key="${id}"]`, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out"
      });
    }
    if (colorShiftOnHover) {
      const overlay = element.querySelector(".color-overlay");
      if (overlay) gsap.to(overlay, { opacity: 0, duration: 0.3 });
    }
  };

  return (
    <div ref={containerRef} className="relative w-full overflow-x-hidden">
      <div className="relative py-6" style={{ minHeight: Math.max(400, grid.containerHeight + 48) }}>
        <div className="absolute inset-0 px-6">
      {grid.items.map((item) => (
        <div
          key={item.id}
          data-key={String(item.id)}
          className="absolute box-content transition-transform duration-300 ease-out"
          style={{ willChange: "transform, width, height, opacity" }}
          onClick={() => window.open(item.url, "_blank", "noopener")}
          onMouseEnter={(e) => handleMouseEnter(item.id, e.currentTarget)}
          onMouseLeave={(e) => handleMouseLeave(item.id, e.currentTarget)}
        >
          <div
            className="relative w-full h-full rounded-[16px] shadow-[0px_10px_50px_-10px_rgba(0,0,0,0.2)] overflow-hidden hover:shadow-[0px_20px_70px_-10px_rgba(0,0,0,0.3)] transition-all duration-300 hover:scale-[1.02]"
          >
            <img 
              src={item.img} 
              alt={`gallery-${String(item.id)}`}
              className="w-full h-full object-contain"
            />
            {colorShiftOnHover && (
              <div className="color-overlay absolute inset-0 rounded-[10px] bg-gradient-to-tr from-pink-500/50 to-sky-500/50 opacity-0 pointer-events-none" />
            )}
          </div>
        </div>
      ))}
        </div>
      </div>
    </div>
  );
};

export default Masonry;
