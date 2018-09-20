import React from 'react';
import ReactDOM from 'react-dom';
import { Header, Table } from 'semantic-ui-react';

class CSVPreview extends React.Component {
    constructor() {
        super();
    }

    render() {
        let theaderDIV, dtableHeaders = [], dtableCells = [], list;
        let outDIV = '';
        if(this.props.spec.total){
            for(let prop in this.props.spec.rows[0]){
                dtableHeaders.push(<Table.HeaderCell key={prop}>{prop}</Table.HeaderCell>);
            }
            theaderDIV =
              <Table.Header>
                  <Table.Row>
                      {dtableHeaders}
                  </Table.Row>
              </Table.Header>;
            list = this.props.spec.rows.map((node, index) => {
                dtableCells =[];
                for(let prop in node){
                    dtableCells.push(<Table.Cell key={'c'+ index + prop}>{node[prop]}</Table.Cell>);
                }
                return <Table.Row key={index}>{dtableCells}</Table.Row>;
            });
            outDIV =
            <Table celled padded striped selectable compact>
                {theaderDIV}
                <Table.Body>
                    {list}
                </Table.Body>
            </Table>;

        }else{
            outDIV = <div className="ui warning message">
                <div className="header">
                    No records was found in the file!
                </div>
            </div>;
        }
        return (
            <div className="ui" ref="CSVPreview" style={{overflow: 'scroll'}}>
                {outDIV}
            </div>
        );
    }
}

module.exports = CSVPreview;
