import { Content, Divider, Split, SplitItem, Stack } from '@patternfly/react-core';
import { LabelHelp } from './LabelHelp';
import { AngleDownIcon, AngleLeftIcon } from '@patternfly/react-icons';
import React, { ReactNode } from 'react';

type SectionProps = {
  id?: string;
  label: string;
  description?: ReactNode;
  prompt?: string;
  children?: ReactNode;
  defaultExpanded?: boolean;
  labelHelpTitle?: string;
  labelHelp?: string;
  collapsable?: boolean;
  autohide?: boolean;
};

export const Section: React.FunctionComponent<SectionProps> = (props) => {
  const id = props.id ?? props.label?.toLowerCase().split(' ').join('-') ?? '';
  const [expanded, setExpanded] = React.useState(
    props.defaultExpanded === undefined ? true : props.defaultExpanded
  );

  return (
    <section id={id} className="pf-v6-c-form__group" role="group">
      <Split
        hasGutter
        onClick={() => {
          if (props.collapsable) setExpanded(!expanded);
        }}
      >
        <SplitItem isFilled>
          <Stack>
            <Split hasGutter>
              <div className="pf-v6-c-form__section-title">
                {props.label}
                {props.id && (
                  <LabelHelp
                    id={props.id}
                    labelHelp={props.labelHelp}
                    labelHelpTitle={props.labelHelpTitle}
                  />
                )}
              </div>
            </Split>
            {expanded && props.description && (
              <Content component="small" style={{ paddingTop: 8 }}>
                {props.description}
              </Content>
            )}
          </Stack>
        </SplitItem>
        {props.collapsable &&
          (expanded ? (
            <SplitItem>
              <div style={{ marginBottom: -5 }}>
                <AngleDownIcon />
              </div>
            </SplitItem>
          ) : (
            <SplitItem>
              <div style={{ marginBottom: -5 }}>
                <AngleLeftIcon />
              </div>
            </SplitItem>
          ))}
      </Split>
      {expanded ? props.children : <div style={{ display: 'none' }}>{props.children}</div>}
      {!expanded && <Divider />}
    </section>
  );
};
