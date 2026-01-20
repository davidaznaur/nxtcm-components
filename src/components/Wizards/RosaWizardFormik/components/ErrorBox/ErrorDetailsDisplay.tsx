import React, { FunctionComponent } from 'react';

import { formatErrorDetails } from '~/common/errors';
import MarkdownParser from '~/common/MarkdownParser';
import { ErrorState } from './types';

type Props = {
  response: Pick<ErrorState, 'errorDetails' | 'errorMessage' | 'operationID' | 'errorCode'>;
  itemWrapper?: FunctionComponent | keyof React.JSX.IntrinsicElements;
  showErrorCode?: boolean;
  renderLinks?: boolean;
  hideOperationID?: boolean;
};

const ErrorDetailsDisplay = ({
  response,
  itemWrapper: ItemWrapper = 'p',
  showErrorCode,
  renderLinks,
  hideOperationID,
}: Props) => {
  const { errorMessage } = response;
  const errorDetails = formatErrorDetails(response.errorDetails);
  return (
    <>
      {showErrorCode && <ItemWrapper>{`Error code: ${response.errorCode}`}</ItemWrapper>}
      {errorMessage &&
        (renderLinks ? (
          <MarkdownParser>{errorMessage}</MarkdownParser>
        ) : (
          <ItemWrapper>{errorMessage}</ItemWrapper>
        ))}
      {errorDetails?.map((detail) => {
        if (Array.isArray(detail)) {
          return (
            <ul key={`${detail}`}>
              {detail.map((detailItem) => (
                <li key={`${detail}-${detailItem}`}>
                  {renderLinks ? <MarkdownParser>{detailItem}</MarkdownParser> : detailItem}
                </li>
              ))}
            </ul>
          );
        }
        if (renderLinks) {
          return <MarkdownParser key={`${detail}`}>{detail}</MarkdownParser>;
        }
        return <pre key={`${detail}`}>{detail}</pre>;
      })}
      {hideOperationID ? null : (
        <ItemWrapper>{`Operation ID: ${response.operationID || 'N/A'}`}</ItemWrapper>
      )}
    </>
  );
};

export default ErrorDetailsDisplay;
