import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { DataGrid } from '@mui/x-data-grid';
import UserAvatar from './UserAvatar';

// Type of a plugins.genericDataForLearningAnalyticsDashboard is of the form: {
//  columnTitle: string;
//  value: string
// }
const PluginsTable = (props) => {
  const {
    pluginsColumnTitle,
    allUsers, intl,
  } = props;

  if (pluginsColumnTitle.length <= 0) {
    return (
      <div className="flex flex-col items-center py-24 bg-white">
        <div className="mb-1 p-3 rounded-full bg-red-100 text-red-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
        </div>
        <p className="text-lg font-semibold text-gray-700">
          <FormattedMessage
            id="app.learningDashboard.pluginsTable.noPluginsCreatedHeading"
            defaultMessage="No plugin yet for this meeting"
          />
        </p>
        <p className="mb-2 text-sm font-medium text-gray-600">
          <FormattedMessage
            id="app.learningDashboard.pluginsTable.noPluginsCreatedMessage"
            defaultMessage="Once a plugin stores its data into learning-analytics-dashboard, it will appear in this list."
          />
        </p>
      </div>
    );
  }

  const commonUserProps = {
    field: 'User',
    headerName: intl.formatMessage({ id: 'app.learningDashboard.pluginsTable.userLabel', defaultMessage: 'User' }),
    flex: 1,
    sortable: true,
  };

  const commonCountProps = {
    field: 'count',
    headerName: intl.formatMessage({ id: 'app.learningDashboard.pluginsTable.answerTotal', defaultMessage: 'Total' }),
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
    valueGetter: (params) => Object.keys(params?.row?.User?.plugins)?.length || 0,
    renderCell: (params) => params?.value,
  });

  pluginsColumnTitle.map((pluginColumnTitle) => {
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
    if (u?.isModerator && Object.keys(u?.plugins)?.length === 0) return u;
    gridRows.push({
      id: i + 1,
      User: u,
      // This is going to be of the form:
      // [learningAnalyticsDashboardColumnTitle]: learningAnalyticsDashboardValue, for each entry
      ...u.plugins.reduce((acc, curr) => {
        const {
          columnTitle,
          value,
        } = curr.genericDataForLearningAnalyticsDashboard;
        acc[columnTitle] = value;
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
    rowHeight: 45,
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
