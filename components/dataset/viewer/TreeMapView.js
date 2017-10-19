import React from 'react';
import PropTypes from 'prop-types';
import URIUtil from '../../utils/URIUtil';
import {Treemap, Tooltip, Legend, Cell, ResponsiveContainer} from 'recharts';
import chroma from 'chroma-js';
//----handling colors
let treemap_xCat = [];
let treemap_yCat = [];
let treemap_all_colors = [];
//------
class TreeMapView extends React.Component {
    componentDidMount() {}
    getXYZ(propsForAnalysis){
        let c = 0, x, y, xLabel, yLabel;
        for(let prop in propsForAnalysis){
            c++;
            if(c ==1){
                x = propsForAnalysis[prop];
                xLabel = prop;
            }
            if(c ==2){
                y = propsForAnalysis[prop];
                yLabel = prop;
            }
        }
        return {x: x, y: y, xLabel: xLabel, yLabel: yLabel};
    }
    prepareColors(l1, l2){
        //const colors = chroma.scale(['#fafa6e','#2A4858']).mode('lch').colors(l1);
        const colors = chroma.cubehelix().start(200).rotations(-0.35).gamma(0.7).lightness([0.7, 1]).scale().correctLightness().colors(l1);
        //const sub_colors = chroma.scale(['#1a75ff', 'grey']).mode('lch').colors(l2);
        //const sub_colors = chroma.scale('OrRd').colors(l2);
        //const sub_colors = chroma.cubehelix().start(200).rotations(-0.35).gamma(0.7).lightness([0.4, 0.85]).scale().correctLightness().colors(l2);
        //const sub_colors = chroma.scale(['green', 'yellow', 'teal', 'blue']).mode('lch').colors(l2)
        let rc, sub_colors = [];
        for(let i=1; i<= l2; i++){
            rc = chroma.random();
            sub_colors.push(rc);
        }
        return [colors, sub_colors];
    }
    renderTooltip(xLabel, yLabel, params){
        if(params.payload.length){
            return (
                <div className="ui compact info message">
                    {xLabel}: <b>{URIUtil.getURILabel(params.payload[0].payload.root.name)}</b>
                    <br/>
                    {yLabel}: <b>{URIUtil.getURILabel(params.payload[0].name)} ({params.payload[0].payload.size})</b>
                </div>
            );
        } else {
            return '';
        }
    }
    renderCustomizedLabel({ root, depth, x, y, width, height, index, payload, colors, rank, name })  {
        return  (
            <g>
                <rect x={x} y={y} width={width} height={height} style={{ opacity: depth < 2 ? 1 : 0.85, fill: depth < 2 ? '#000' : treemap_all_colors[1][treemap_yCat.indexOf(name)], stroke: '#000', strokeWidth: depth <2 ? 8 : 3 / (depth + 1e-10), strokeOpacity: 1 / (depth + 1e-10),}} />
                {
                    depth === 1 ?
                        <text x={x + width / 2} y={y + height / 2 + 7} textAnchor="middle" fill="#fff" fontSize={14} >
                            {URIUtil.getURILabel(name)}
                        </text>
                        : null
                }
                {
                    depth === 1 ?
                        <text x={x + 4} y={y + 18} fill="#fff" fontSize={12} fillOpacity={0.7} >
                            {index + 1}
                        </text>
                        : null
                }
            </g>
        );
    }
    render() {
        let self = this;
        let data = [];
        let title,
            instances =[],
            out, xyz;
        let xType, yType;
        let xLabel, yLabel;
        if (!this.props.resources.length) {
            out = <div className="ui warning message">
                <div className="header">
                    There was no resource in the selected dataset! This might be due to the connection problems or because the estimated query execution time exceeds the configured limit. Please check the connection parameters of your dataset&apos;s Sparql endpoint or add resources to your dataset...</div>
            </div>;
            return <div>{out}</div>;
        } else {
            this.props.resources.forEach((node, index) => {
                title = node.title
                    ? node.title
                    : (node.label
                        ? node.label
                        : URIUtil.getURILabel(node.v));
                xyz = self.getXYZ(node.propsForAnalysis) ;
                if(!xLabel){
                    xLabel = xyz.xLabel;
                }
                if(!yLabel){
                    yLabel = xyz.yLabel;
                }
                //2D
                instances.push({uri: node.v, title: title , x: xyz.x, y: xyz.y});
            });
            //group by variable x
            let tmp ={};
            treemap_xCat = [];
            treemap_yCat = [];
            instances.forEach((node, index) => {
                if(!tmp[node.x]){
                    treemap_xCat.push(node.x);
                    tmp[node.x]={};
                    tmp[node.x][node.y] = 1;
                }else{
                    if(tmp[node.x][node.y]){
                        tmp[node.x][node.y] = tmp[node.x][node.y] + 1;
                    }else{
                        tmp[node.x][node.y] = 1;
                    }
                }
                if(treemap_yCat.indexOf(node.y)=== -1){
                    treemap_yCat.push(node.y);
                }
            });
            //generate unique colors for each main and sub categories
            treemap_all_colors = this.prepareColors(treemap_xCat.length, treemap_yCat.length);
            //console.log(treemap_xCat, treemap_yCat);
            let children= [];
            for(let prop in tmp){
                children = [];
                for(let prop2 in tmp[prop]){
                    children.push({name: prop2, size: parseInt(tmp[prop][prop2])});
                }
                data.push({name: prop, children: children});
            }
        }
        //console.log(xType, yType);
        const minHeight = this.props.expanded ? 700 : 500;
        return (
            <div ref="treeMapView" style={{overflow: 'auto'}}>
                <ResponsiveContainer width="100%" height={minHeight}>
                    <Treemap data={data} dataKey="size" nameKey="name" ratio={4/3} stroke="#fff"  content={this.renderCustomizedLabel}>
                        <Tooltip content={this.renderTooltip.bind(this, xLabel, yLabel)}/>
                    </Treemap>
                </ResponsiveContainer>
            </div>
        );
    }
}
export default TreeMapView;
