import React from 'react';
import URIUtil from '../../utils/URIUtil';
//import TagListBrowser from './TagListBrowser';
import {PieChart, Pie, Sector, Tooltip, Legend, Cell, ResponsiveContainer} from 'recharts';

class PieChartBrowser extends React.Component {
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
        if(this.doesExist(data.ovalue)){
            this.props.onCheck(0, data.ovalue);
        }else{
            this.props.onCheck(1, data.ovalue);
        }
    }
    renderCustomizedLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, title })  {
        return  `${title}`;
        //return  `${title}: ${(percent * 100).toFixed(0)}%`;
    }
    render() {
        let self = this;
        let data=[];
        let title;
        self.props.instances.forEach((node)=> {
            title = node.value;
            if(self.props.shortenURI && !(self.props.config && self.props.config.shortenURI === 0)){
                title = URIUtil.getURILabel(title);
            }
            data.push({ovalue: node.value, title: title, total: parseFloat(node.total), isSelected: self.doesExist(node.value)});
        })
        //todo: change width/height on expansion
        let width = 230;
        let height = 180;
        if(this.props.expanded){
            width = 470;
            height = 540;
        }
        return (
            <div>
                <ResponsiveContainer width="97%" height={height}>
                    <PieChart>
                        <Tooltip />
                        <Pie data={data} dataKey="total" nameKey="title" labelLine={this.props.expanded ? true: false} label={this.props.expanded ? this.renderCustomizedLabel: false}
                            margin={{top: 0, right: 10, left: 0, bottom: 0}} fill="#1a75ff" onClick={this.selectItem.bind(this)}>
                            {
                                data.map((entry, index) => (
                                    <Cell cursor="pointer" fill={entry.isSelected ? '#82ca9d' : '#1a75ff' } key={`cell-${index}`}/>
                                ))
                            }
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                {/*<TagListBrowser selection={this.props.selection} expanded={this.props.expanded} datasetURI={this.props.datasetURI} propertyURI={this.props.propertyURI} shortenURI={this.props.shortenURI}  config={this.props.config} instances={this.props.instances} onCheck={this.props.onCheck.bind(this)}/>*/}
            </div>
        );
    }
}

export default PieChartBrowser;
