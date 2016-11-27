import React from 'react';
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend} from 'recharts';

class BarChartBrowser extends React.Component {
    constructor(props) {
        super(props);
    }
    doesExist(value){
        let selected=[];
        if(!this.props.propertyURI){
            for(let prop in this.props.selection){
                selected.push(prop);
            }
        }else{
            if(this.props.selection[this.props.propertyURI]){
                this.props.selection[this.props.propertyURI].forEach((node)=>{
                    selected.push(node.value);
                });
            }
        }
        let pos = selected.indexOf(value);
        if(pos === -1){
            return false;
        }else{
            return true;
        }
    }
    selectItem(value) {
        if(this.doesExist(value)){
            this.props.onCheck(0, value);
        }else{
            this.props.onCheck(1, value);
        }
    }
    render() {
        let self = this;
        let data=[];
        self.props.instances.forEach((node)=> {
            data.push({title: node.value, total: parseFloat(node.total)});
        })
        //todo: change width/height on expansion
        let width = 230;
        let height = 180;
        if(this.props.expanded){
            width = 430;
            height = 400;
        }
        return (
            <BarChart width={width} height={height} data={data}
                        margin={{top: 2, right: 5, left: 0, bottom: 2}}>
                   <XAxis dataKey="title"/>
                   <YAxis/>
                   <CartesianGrid strokeDasharray="3 3"/>
                   <Tooltip/>
                   <Bar dataKey="total" fill="#1a75ff" />
                  </BarChart>
        );
    }
}

export default BarChartBrowser;
