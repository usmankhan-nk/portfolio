import { Fragment } from "react";

const COPIES = 6;

export default function InfiniteMarquee({
  items,
  renderItem,
  reverse = false,
  speed = 42,
  gap = 12,
  className = "",
}) {
  return (
    <div
      className={`marquee-row w-full overflow-hidden ${className}`}
      style={{ "--mq-gap": `${gap}px` }}
    >
      <div
        className={`marquee-track ${reverse ? "marquee-track-reverse" : ""}`}
        style={{ animationDuration: `${speed}s` }}
      >
        {Array.from({ length: COPIES }, (_, copy) => (
          <div
            key={copy}
            className={`marquee-set ${copy > 0 ? "marquee-duplicate" : ""}`}
            aria-hidden={copy > 0 || undefined}
          >
            {items.map((item, i) => (
              <Fragment key={i}>{renderItem(item, i)}</Fragment>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}