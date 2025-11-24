import React from 'react';
import styles from './styles.module.css';

function TableBody({ data }): JSX.Element {
  const rows = data.map((entry: {
      deprecated: Boolean;
      name: String;
      required: Boolean;
      description: JSX.Element;
      type: String;
      default: String;
      minLength: Number;
      maxLength: Number;
      minimum: Number;
      maximum: Number;
    }) => {
      let row = [];
      /* Param Name */
      row.push(
        <td>
          <code>
            { entry.name }
          </code>
	  { entry.deprecated ?
            <p className={styles.apiDeprecated}>(deprecated)</p> : null }
          { entry.required ?
            <p className={styles.apiRequired}>(required)</p> : null }
        </td>
      );

      /* Type */
      let constraints = [];
      if (entry.minLength !== undefined || entry.maxLength !== undefined) {
        constraints.push(
          <span>
            { (entry.minLength !== undefined && entry.maxLength !== undefined) ?
              <>[ {entry.minLength} .. {entry.maxLength} ] chars</>
            : (entry.minLength !== undefined) ?
              <>≥ {entry.minLength} chars</>
            : (entry.maxLength !== undefined) ?
              <>≤ {entry.maxLength} chars</>
            : null }
          </span>
        );
      }
      if (entry.minimum !== undefined || entry.maximum !== undefined) {
        if (constraints.length > 0) { constraints.push(<br/>) };
        constraints.push(
          <span>
            { (entry.minimum !== undefined && entry.maximum !== undefined) ?
              <>[ {entry.minimum} .. {entry.maximum} ]</>
            : (entry.minimum !== undefined) ?
              <>≥ {entry.minimum}</>
            : (entry.maximum !== undefined) ?
              <>≤ {entry.maximum}</>
            : null }
          </span>
        )
      }
      row.push(
        <td>
          { entry.type }
          { constraints.length > 0 ?
            <p className={styles.apiConstraints}>{ constraints }</p>
          : null }
        </td>
      );

      /* Description */
      row.push(
        <td>
          {entry.description}
          { entry.default !== undefined ?
            <p className={styles.apiDefault}>Default: <code>{entry.default.toString()}</code></p> : null
          }
        </td>
      );

      return (<tr>{row}</tr>);
    })
  return rows
}


export default function APITableComponent({ data }): JSX.Element {  
  return (
          <>
           {data ? 
            <table className={styles.apiParams}>
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
