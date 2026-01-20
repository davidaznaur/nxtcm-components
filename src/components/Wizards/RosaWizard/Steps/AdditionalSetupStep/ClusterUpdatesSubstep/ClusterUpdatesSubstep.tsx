import { Section, WizRadioGroup, Radio, WizSelect } from '@patternfly-labs/react-form-wizard';
import { Content, ContentVariants, Flex, FlexItem, Title } from '@patternfly/react-core';
import { useTranslation } from '../../../../../../context/TranslationContext';
import React from 'react';
import { useInput } from '@patternfly-labs/react-form-wizard/inputs/Input';

export const ClusterUpdatesSubstep = (props: any) => {
  const { t } = useTranslation();
  const { value } = useInput(props);
  const { cluster } = value;

  const generateHourlyTimesUTC = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      const formattedHour = hour.toString().padStart(2, '0');
      times.push(`${formattedHour}:00 UTC`);
    }
    return times;
  };

  const weekDays = [
    { label: 'Sunday', value: 0 },
    { label: 'Monday', value: 1 },
    { label: 'Tuesday', value: 2 },
    { label: 'Wednesday', value: 3 },
    { label: 'Thursday', value: 4 },
    { label: 'Friday', value: 5 },
    { label: 'Saturday', value: 6 },
  ];

  const onDaySelect = React.useCallback(
    (selection: number | string | undefined) => {
      const selectedHour = cluster?.upgrade_time;
      /* cron syntax:
      00 =  0th minute,
      ${}   selected hour (from current input value)
      * * = disregarding the day of month, every month
      ${}   newly selected day number
    */
      cluster.schedule = `00 ${selectedHour} * * ${selection}`;
    },
    [cluster]
  );

  const onHourSelect = React.useCallback(
    (selection: number | string | undefined) => {
      const selectedDay = cluster.upgrade_day?.value;
      /* cron syntax:
      00 =  0th minute,
      ${}   newly selected hour
      * * = disregarding the day of month, every month
      ${}   selected day number (from current input value)
    */
      cluster.schedule = `00 ${selection} * * ${selectedDay}`;
    },
    [cluster]
  );

  React.useEffect(() => {
    if (cluster.upgrade_policy === 'automatic') {
      // Remove recurring upgrade fields when individual updates is selected
      delete cluster.upgrade_day;
      delete cluster.upgrade_time;
      delete cluster.schedule;
    } else {
      const dayTimeArr = [cluster.upgrade_day, cluster.upgrade_time];
      onHourSelect(dayTimeArr[1]);
      onDaySelect(dayTimeArr[0]);
    }
  }, [
    cluster.upgrade_policy,
    onDaySelect,
    onHourSelect,
    cluster.schedule,
    cluster.upgrade_day,
    cluster.upgrade_time,
  ]);

  return (
    <Section
      id="cluster-updates-substep-section"
      key="cluster-updates-substep-section-key"
      label={t('Cluster update strategy')}
    >
      <Content component={ContentVariants.p}>
        {t(`The OpenShift version [4.14.6] that you selected in the &quot;HERE GOES LINK: Details
        step&quot; will apply to the managed control plane and the machine pools configured in the
        &quot;HERE GOES LINK: Networking and subnets step&quot;. After cluster creation, you can
        update the managed control plane and machine pools independently.`)}
      </Content>

      <Content component={ContentVariants.p}>
        {t(`In the event of &quot;HERE GOES LINK WITH EXTERNAL ICON: Critical security concerns&quot;
        (CVEs) that significantly impact the security or stability of the cluster, updates may be
        automatically scheduled by Red Hat SRE to the latest z-stream version not impacted by the
        CVE within 2 business days after customer notifications.`)}
      </Content>

      <WizRadioGroup path="cluster.upgrade_policy">
        <Radio
          id="cluster-upgrade-strategy-individual-radio-btn"
          label={t('Individual updates')}
          value="automatic"
          description={t(
            'Schedule each update individually. When planning updates, make sure to consider the end of life dates from the {HERE GOES LINK WITH EXTERNAL ICON: lifecycle policy'
          )}
        ></Radio>
        <Radio
          id="cluster-upgrade-strategy-recurring-radio-btn"
          label={t('Recurring updates')}
          value="manual"
          description={t(
            "The cluster control plan will be automatically updated based on your preferred day and start time when new patch updates ({HERE GOES LINK WITH EXTERNAL ICON: z-stream}) are available. When a new minor version is available, you'll be notified and must manually allow the cluster to update the next minor version. The compute nodes will need to be manually updated."
          )}
        >
          <Title headingLevel="h5">Select a day and start time</Title>
          <Flex>
            <FlexItem>
              <WizSelect
                label={t('Day')}
                path="cluster.upgrade_day"
                options={weekDays?.map((weekday: { label: string; value: number }) => {
                  return {
                    label: weekday.label,
                    value: weekday.value,
                  };
                })}
              />
            </FlexItem>
            <FlexItem>
              <WizSelect
                label={t('Time')}
                path="cluster.upgrade_time"
                options={generateHourlyTimesUTC().map((time: string, idx: number) => {
                  return {
                    label: time,
                    value: idx,
                  };
                })}
              />
            </FlexItem>
          </Flex>
        </Radio>
      </WizRadioGroup>
    </Section>
  );
};
