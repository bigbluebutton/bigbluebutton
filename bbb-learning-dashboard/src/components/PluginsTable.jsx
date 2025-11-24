import React from 'react';
import { injectIntl } from 'react-intl';
import { DataGrid } from '@mui/x-data-grid';
import ReactMarkdown from 'react-markdown';
import UserAvatar from './UserAvatar';

// Type of genericData is of the form: {
//  columnTitle: string;
//  value: string
// }
const PluginsTable = (props) => {
  const {
    genericDataColumnTitleList,
    allUsers, intl, genericDataCardTitle,
  } = props;

  const commonUserProps = {
    field: 'User',
    headerName: intl.formatMessage({ id: 'app.learningDashboard.pluginsTable.userLabel', defaultMessage: 'User' }),
    flex: 1,
    sortable: true,
  };

  const commonCountProps = {
    field: 'count',
    headerName: intl.formatMessage({ id: 'app.learningDashboard.pluginsTable.totalLabel', defaultMessage: 'Total' }),
    flex: 1,
    sortable: true,
  };

  const gridCols = [
    {
      ...commonUserProps,
      valueGetter: (params) => params?.row?.User?.name,
      renderCell: (params) => (
        <>
          <div className="relative hidden w-8 h-8 rounded-full md:block">
            <UserAvatar user={params?.row?.User} />
          </div>
          <div className="mx-2 font-semibold text-gray-700">{params?.value}</div>
        </>
      ),
    },
  ];

  gridCols.push({
    ...commonCountProps,
    valueGetter: (params) => Object.keys(
      params?.row?.User?.genericData?.[genericDataCardTitle],
    )?.length || 0,
    renderCell: (params) => params?.value,
  });

  genericDataColumnTitleList.map((pluginColumnTitle) => {
    const commonColProps = {
      field: pluginColumnTitle,
      headerName: pluginColumnTitle,
      flex: 1,
    };
    gridCols.push({
      ...commonColProps,
      valueGetter: (
        params,
      ) => params?.row?.[pluginColumnTitle],
      renderCell: (params) => params?.value,
    });
    return pluginColumnTitle;
  });

  const gridRows = [];
  Object.values(allUsers).map((u, i) => {
    if (Object.keys(u?.genericData)?.length === 0) return u;
    gridRows.push({
      id: i + 1,
      User: u,
      // This is going to be of the form:
      // [learningAnalyticsDashboardColumnTitle]: learningAnalyticsDashboardValue, for each entry
      ...u.genericData?.[genericDataCardTitle].reduce((acc, curr) => {
        const {
          columnTitle,
          value,
        } = curr;
        acc[columnTitle] = (
          <ReactMarkdown
            components={{
              a: ({ href, children }) => (
                <a href={href} className="text-blue-600 underline">
                  {children}
                </a>
              ),
              img: ({
                node, src, alt, ...restProps
              }) => (
                <a href={src} target="_blank" rel="noopener noreferrer" className="block border border-gray-300">
                  <img
                    src={src}
                    alt={alt}
                    {...restProps}
                    style={{
                      maxHeight: '120px',
                      height: 'auto',
                      maxWidth: '120px',
                      width: 'auto',
                      cursor: 'pointer',
                    }}
                  />
                </a>
              ),
            }}
          >
            {value}
          </ReactMarkdown>
        );
        return acc;
      }, {}),
    });
    return u;
  });

  const commonGridProps = {
    autoHeight: true,
    hideFooter: true,
    disableColumnMenu: true,
    disableColumnSelector: true,
    disableSelectionOnClick: true,
    rowHeight: 125,
  };

  return (
    <div className="bg-white" style={{ width: '100%' }}>
      <DataGrid
        {...commonGridProps}
        rows={gridRows}
        columns={gridCols}
        sortingOrder={['asc', 'desc']}
        sx={{
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: 'rgb(243 244 246/var(--tw-bg-opacity))',
            color: 'rgb(55 65 81/1)',
            textTransform: 'uppercase',
            letterSpacing: '.025em',
            minHeight: '40.5px !important',
            maxHeight: '40.5px !important',
            height: '40.5px !important',
          },
          '& .MuiDataGrid-virtualScroller': {
            marginTop: '40.5px !important',
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: '600',
            fontSize: 'smaller !important',
          },
        }}
      />
    </div>
  );
};

export default injectIntl(PluginsTable);
