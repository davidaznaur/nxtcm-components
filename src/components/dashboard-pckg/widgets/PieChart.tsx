import React from 'react';
import { ChartPie, ChartThemeColor } from '@patternfly/react-charts/victory';

interface PetData {
  x?: string;
  y?: number;
  name?: string;
}

export const PieChart: React.FunctionComponent = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = React.useState({ width: 250, height: 175 });

  React.useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width: width || 250, height: height || 175 });
      }
    };

    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    return () => resizeObserver.disconnect();
  }, []);
  const data: PetData[] = [
    { x: 'Cats', y: 35 },
    { x: 'Dogs', y: 55 },
    { x: 'Birds', y: 10 },
  ];
  const legendData: PetData[] = [{ name: 'Cats: 35' }, { name: 'Dogs: 55' }, { name: 'Birds: 10' }];

  return (
    <div ref={containerRef} style={{ height: '100%', width: '100%' }}>
      <ChartPie
        ariaDesc="Average number of pets"
        ariaTitle="Pie chart example"
        constrainToVisibleArea
        data={data}
        height={dimensions.height}
        width={dimensions.width}
        labels={({ datum }) => `${datum.x}: ${datum.y}`}
        legendData={legendData}
        legendPosition="bottom"
        name="chart3"
        padding={{
          bottom: 65,
          left: 20,
          right: 20,
          top: 20,
        }}
        themeColor={ChartThemeColor.multiOrdered}
      />
    </div>
  );
};
