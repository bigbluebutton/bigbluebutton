import React from 'react';
import styles from './styles.module.css';

function TableBody({ data }): JSX.Element {
  const rows = data.map((entry: {deprecated: Boolean; name: String; 
    required: Boolean; description: JSX.Element; type: String; default: String;
    }) => {
    return (<>
      <tr>
        <td>
          { 
            entry.deprecated !== undefined ?
            <code className={styles.apiDeprecated}>{ entry.name }</code>
            : <code>{ entry.name }</code>
          }
          { entry.required !== undefined ?
            <>
            { entry?.required === true ?
              <p className={styles.apiRequired}>{"(required)"}</p> : null
            }
            </>
          : null}
        </td>
        <td>{ entry.type }</td>
        <td>
          {entry.description}
          { entry.default !== undefined ?
            <p className={styles.apiDefault}>Default: <code>{entry.default.toString()}</code></p> : null
          }
        </td>
      </tr>
    </>)
  }) 
  return rows
}


export default function APITableComponent({ data }): JSX.Element {  
  return (
          <>
           {data ? 
            <table className="api-params">
              <thead>
                <tr className="header">
                  <th>Param Name</th>
                  <th>Type</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <TableBody data={data} />
              </tbody>
            </table> : null
            }   
          </>
  );
}
