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
        let countDIV = '';
        if(parseInt(this.props.spec.total)){
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
            countDIV = 'Displaying ' + this.props.spec.total + ' rows as preview:'
        }else{
            outDIV = <div className="ui red segment">
                <div className="header">
                    No records was found in the file! It might be a parsing issue, please check your file and the delimiter used. It could also occur because you have not set the right permission on your upload folder!
                </div>
            </div>;
        }
        return (
            <div className="ui segment" ref="CSVPreview" style={{overflow: 'scroll'}}>
                <center>{countDIV}</center>
                {outDIV}
            </div>
        );
    }
}

module.exports = CSVPreview;
