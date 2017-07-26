import React from 'react';
//import TagListBrowser from './TagListBrowser';
import {BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Cell, ResponsiveContainer} from 'recharts';

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
    comparePropsFloat(a,b) {
        if (parseFloat(a.title) < parseFloat(b.title))
            return -1;
        if (parseFloat(a.title) > parseFloat(b.title))
            return 1;
        return 0;
    }
    comparePropsString(a,b) {
        if (a.title < b.title)
            return -1;
        if (a.title > b.title)
            return 1;
        return 0;
    }
    render() {
        let self = this;
        let data=[];
        self.props.instances.forEach((node)=> {
            data.push({title: node.value, total: parseFloat(node.total), isSelected: self.doesExist(node.value)});
        })
        if(self.props.config && self.props.config.hasNumericValues){
            data.sort(this.comparePropsFloat);
        }else{
            data.sort(this.comparePropsString);
        }
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
                    <BarChart data={data}
                        margin={{top: 0, right: 10, left: 0, bottom: 0}}>
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
                </ResponsiveContainer>
                {/*<TagListBrowser selection={this.props.selection} expanded={this.props.expanded} datasetURI={this.props.datasetURI} propertyURI={this.props.propertyURI} shortenURI={this.props.shortenURI}  config={this.props.config} instances={this.props.instances} onCheck={this.props.onCheck.bind(this)}/>*/}
            </div>
        );
    }
}

export default BarChartBrowser;
