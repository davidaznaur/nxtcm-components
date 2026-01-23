import { useRef, useState, useEffect } from 'react';
import {
  Chart,
  ChartAxis,
  ChartBar,
  ChartGroup,
  ChartThemeColor,
  ChartTooltip,
} from '@patternfly/react-charts/victory';

interface PetData {
  name: string;
  x: string;
  y: number;
  label: ({ datum }: any) => string;
}

export const BarChart: React.FunctionComponent = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 250, height: 175 });

  useEffect(() => {
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

  const label = ({ datum }: any) => `${datum.name}: ${datum.y}`;

  const catsData: PetData[] = [
    { name: 'Cats', x: '2015', y: 1, label },
    { name: 'Cats', x: '2016', y: 2, label },
    { name: 'Cats', x: '2017', y: 5, label },
    { name: 'Cats', x: '2018', y: 3, label },
  ];

  const dogsData: PetData[] = [
    { name: 'Dogs', x: '2015', y: 2, label },
    { name: 'Dogs', x: '2016', y: 1, label },
    { name: 'Dogs', x: '2017', y: 7, label },
    { name: 'Dogs', x: '2018', y: 4, label },
  ];

  const birdsData: PetData[] = [
    { name: 'Birds', x: '2015', y: 4, label },
    { name: 'Birds', x: '2016', y: 4, label },
    { name: 'Birds', x: '2017', y: 9, label },
    { name: 'Birds', x: '2018', y: 7, label },
  ];

  const miceData: PetData[] = [
    { name: 'Mice', x: '2015', y: 3, label },
    { name: 'Mice', x: '2016', y: 3, label },
    { name: 'Mice', x: '2017', y: 8, label },
    { name: 'Mice', x: '2018', y: 5, label },
  ];

  const legendData = [{ name: 'Cats' }, { name: 'Dogs' }, { name: 'Birds' }, { name: 'Mice' }];

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <Chart
        ariaDesc="Average number of pets"
        ariaTitle="Bar chart example"
        domainPadding={{ x: [30, 25] }}
        legendData={legendData}
        legendPosition="bottom"
        height={dimensions.height}
        width={dimensions.width}
        name="chart2"
        padding={{
          bottom: 75,
          left: 50,
          right: 50,
          top: 50,
        }}
        themeColor={ChartThemeColor.purple}
      >
        <ChartAxis />
        <ChartAxis dependentAxis showGrid />
        <ChartGroup offset={11}>
          <ChartBar data={catsData} labelComponent={<ChartTooltip constrainToVisibleArea />} />
          <ChartBar data={dogsData} labelComponent={<ChartTooltip constrainToVisibleArea />} />
          <ChartBar data={birdsData} labelComponent={<ChartTooltip constrainToVisibleArea />} />
          <ChartBar data={miceData} labelComponent={<ChartTooltip constrainToVisibleArea />} />
        </ChartGroup>
      </Chart>
    </div>
  );
};
