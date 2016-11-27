import React from 'react';
import {BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Cell} from 'recharts';

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
    selectItem(data, index) {
        if(this.doesExist(data.title)){
            this.props.onCheck(0, data.title);
        }else{
            this.props.onCheck(1, data.title);
        }
    }
    render() {
        let self = this;
        let data=[];
        self.props.instances.forEach((node)=> {
            data.push({title: node.value, total: parseFloat(node.total), isSelected: self.doesExist(node.value)});
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
                        margin={{top: 0, right: 0, left: 0, bottom: 0}}>
                <XAxis dataKey="title"/>
                <YAxis/>
                <Tooltip/>
                <Bar dataKey="total" fill="#1a75ff" onClick={this.selectItem.bind(this)}>
                    {
                        data.map((entry, index) => (
                            <Cell cursor="pointer" fill={entry.isSelected ? '#82ca9d' : '#1a75ff' } key={`cell-${index}`}/>
                        ))
                    }
                </Bar>
            </BarChart>
        );
    }
}

export default BarChartBrowser;
