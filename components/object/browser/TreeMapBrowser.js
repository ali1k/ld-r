import React from 'react';
import URIUtil from '../../utils/URIUtil';
//import chroma from 'chroma-js';
//import TagListBrowser from './TagListBrowser';
import {Treemap, Tooltip, Legend, Cell, ResponsiveContainer} from 'recharts';

class TreeMapBrowser extends React.Component {
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
    renderCustomizedLabel({ root, depth, x, y, width, height, index, payload, colors, rank, title })  {
        return  (
            <g>
                <rect x={x} y={y} width={width} height={height} />
                <text x={x + width / 2} y={y + height / 2 + 7} textAnchor="middle" fill="#fff" >
                    {title}
                </text>
            </g>
        );
    }
    renderCustomizedLabel({ root, depth, x, y, width, height, index, payload, colors, rank, title, isSelected})  {
        let expanded = this.props.expanded ? 1 : 0;
        return  (
            <g>
                <rect x={x} y={y} width={width} height={height} style={{ opacity: depth < 2 ? 1 : 0.85, fill: isSelected ? '#82ca9d' : '#1a75ff', stroke: '#fff', strokeWidth:  2 / (1 + 1e-10), strokeOpacity: 1 / (1 + 1e-10),}} />
                {
                    expanded === 1 ?
                        <text x={x + width / 2} y={y + height / 2 + 7} textAnchor="middle" fill="#fff" fontSize={14} >
                            {title}
                        </text>
                        : null
                }
            </g>
        );
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
                    <Treemap data={data} dataKey="total" nameKey="title" ratio={4/3} stroke="#fff"  fill="#1a75ff" content={this.renderCustomizedLabel.bind(this)} onClick={this.selectItem.bind(this)}>
                        <Tooltip />
                    </Treemap>
                </ResponsiveContainer>
                {/*<TagListBrowser selection={this.props.selection} expanded={this.props.expanded} datasetURI={this.props.datasetURI} propertyURI={this.props.propertyURI} shortenURI={this.props.shortenURI}  config={this.props.config} instances={this.props.instances} onCheck={this.props.onCheck.bind(this)}/>*/}
            </div>
        );
    }
}

export default TreeMapBrowser;
