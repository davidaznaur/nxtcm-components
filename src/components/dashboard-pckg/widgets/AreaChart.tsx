import React from 'react';
import {
  Chart,
  ChartArea,
  ChartAxis,
  ChartGroup,
  ChartVoronoiContainer,
} from '@patternfly/react-charts/victory';

interface PetData {
  name: string;
  x: string;
  y: number;
}

export const AreaChart: React.FunctionComponent = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = React.useState({ width: 450, height: 275 });

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
  const catsData: PetData[] = [
    { name: 'Cats', x: '2015', y: 3 },
    { name: 'Cats', x: '2016', y: 4 },
    { name: 'Cats', x: '2017', y: 8 },
    { name: 'Cats', x: '2018', y: 6 },
  ];

  const dogsData: PetData[] = [
    { name: 'Dogs', x: '2015', y: 2 },
    { name: 'Dogs', x: '2016', y: 3 },
    { name: 'Dogs', x: '2017', y: 4 },
    { name: 'Dogs', x: '2018', y: 5 },
    { name: 'Dogs', x: '2019', y: 6 },
  ];

  const birdsData: PetData[] = [
    { name: 'Birds', x: '2015', y: 1 },
    { name: 'Birds', x: '2016', y: 2 },
    { name: 'Birds', x: '2017', y: 3 },
    { name: 'Birds', x: '2018', y: 2 },
    { name: 'Birds', x: '2019', y: 4 },
  ];

  const legendData = [{ name: 'Cats' }, { name: 'Dogs' }, { name: 'Birds' }];

  return (
    <div ref={containerRef} style={{ height: '100%', width: '100%' }}>
      <Chart
        ariaDesc="Average number of pets"
        ariaTitle="Area chart example"
        containerComponent={
          <ChartVoronoiContainer
            labels={({ datum }) => `${datum.name}: ${datum.y}`}
            constrainToVisibleArea
          />
        }
        legendData={legendData}
        legendOrientation="vertical"
        legendPosition="right"
        height={dimensions.height}
        width={dimensions.width}
        maxDomain={{ y: 9 }}
        name="chart1"
        padding={{
          bottom: 50,
          left: 50,
          right: 200, // Adjusted to accommodate legend
          top: 50,
        }}
      >
        <ChartAxis />
        <ChartAxis dependentAxis showGrid />
        <ChartGroup>
          <ChartArea data={catsData} interpolation="monotoneX" />
          <ChartArea data={dogsData} interpolation="monotoneX" />
          <ChartArea data={birdsData} interpolation="monotoneX" />
        </ChartGroup>
      </Chart>
    </div>
  );
};
