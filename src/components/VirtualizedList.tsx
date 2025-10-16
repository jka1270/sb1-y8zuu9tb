import { useVirtualization } from '../hooks/useVirtualization';

interface VirtualizedListProps {
  items: any[];
  itemHeight: number;
  height: number;
  renderItem: (item: any, index: number) => React.ReactNode;
  className?: string;
}

export default function VirtualizedList({
  items,
  itemHeight,
  height,
  renderItem,
  className = ''
}: VirtualizedListProps) {
  const { visibleItems, totalHeight, handleScroll } = useVirtualization({
    items,
    itemHeight,
    containerHeight: height
  });

  return (
    <div
      className={`overflow-auto ${className}`}
      style={{ height }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map((item) => (
          <div
            key={item.index}
            style={{
              position: 'absolute',
              top: item.offsetY,
              left: 0,
              right: 0,
              height: itemHeight
            }}
          >
            {renderItem(item, item.index)}
          </div>
        ))}
      </div>
    </div>
  );
}