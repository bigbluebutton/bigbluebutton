import * as ReactDOM from 'react-dom/client';

export interface GenericContentItemProps {
    renderFunction: (element: HTMLElement) => ReactDOM.Root;
    width?: string;
}
