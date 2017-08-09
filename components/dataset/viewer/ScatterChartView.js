import React from 'react';
import PropTypes from 'prop-types';
import URIUtil from '../../utils/URIUtil';
import chroma from 'chroma-js';
import {ScatterChart, Scatter, Cell, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from 'recharts';

class ScatterChartView extends React.Component {
    componentDidMount() {}
    getXYZ(propsForAnalysis){
        let c = 0, x, y, z, xLabel, yLabel, zLabel;
        let others = {};
        for(let prop in propsForAnalysis){
            c++;
            if(c == 1){
                x = propsForAnalysis[prop];
                xLabel = prop;
            }
            if(c == 2){
                y = propsForAnalysis[prop];
                yLabel = prop;
            }
            if(c == 3){
                z = propsForAnalysis[prop];
                zLabel = prop;
            }
            if(c > 3){
                others[prop] = propsForAnalysis[prop];
            }
        }
        return {x: x, y: y, z: z, xLabel: xLabel, yLabel: yLabel, zLabel: zLabel, others: others};
    }
    handleNodeClick(params){
        console.log(params);
    }
    renderTooltip(params){
        let tmp, othersDIV = [];
        if(params.payload.length){
            tmp = params.payload[0].payload.others;
            if(tmp){
                for(let prop in tmp){
                    othersDIV.push(<div key={prop}>{prop}: {tmp[prop]}</div>);
                }
            }
            return (
                <div className="ui compact info message">
                    <b>{params.payload[0].payload.title}</b>
                    {params.payload[0].payload.z ? <span> (<i>{params.payload[0].payload.z}</i>)</span>:null}
                    <br/>
                    {params.payload[0].name}: {params.payload[0].value}
                    <br/>
                    {params.payload[1].name}: {params.payload[1].value}
                    {othersDIV}
                </div>
            );
        } else {
            return '';
        }
    }
    render() {
        let self = this;
        let colorGroup = {};
        let title,
            instances =[],
            out, xyz;
        let xType, yType, zType;
        let xLabel, yLabel, zLabel;
        if (!this.props.resources.length) {
            out = <div className="ui warning message">
                <div className="header">
                    There was no resource in the selected dataset! This might be due to the connection problems. Please check the connection parameters of your dataset&apos;s Sparql endpoint or add resources to your dataset...</div>
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
                if(!xType){
                    if (isNaN(xyz.x)){
                        xType = 'category';
                    }else{
                        xType = 'number';
                    }
                    xLabel = xyz.xLabel;
                }
                if(!yType){
                    if (isNaN(xyz.y)){
                        yType = 'category';
                    }else{
                        yType = 'number';
                    }
                    yLabel = xyz.yLabel;
                }
                if(xyz.z && !zType){
                    if (isNaN(xyz.z)){
                        zType = 'category';
                    }else{
                        zType = 'number';
                    }
                    zLabel = xyz.zLabel;
                }
                //collect all other attributes
                if(Object.keys(xyz.others).length){
                    instances.push({uri: node.v, title: title , x: Number(xyz.x), y: Number(xyz.y), z: xyz.z, others: xyz.others});
                    //define
                    if(!colorGroup[xyz.z]){
                        colorGroup[xyz.z] = chroma.random().hex();
                    }
                }else{
                    if(zLabel){
                        //3D
                        instances.push({uri: node.v, title: title , x: Number(xyz.x), y: Number(xyz.y), z: xyz.z});
                        //define
                        if(!colorGroup[xyz.z]){
                            colorGroup[xyz.z] = chroma.random().hex();
                        }
                    }else{
                        //2D
                        instances.push({uri: node.v, title: title , x: Number(xyz.x), y: Number(xyz.y)});
                    }
                }
            });
            //console.log(instances);
        }
        //console.log(xType, yType);
        let height = 400;
        return (
            <div ref="scatterChartView" style={{overflow: 'auto'}}>
                <ResponsiveContainer width="100%" height={height}>
                    <ScatterChart margin={{top: 0, right: 10, left: 0, bottom: 0}}>
                      	<XAxis dataKey={'x'} name={xLabel} type={xType} />
                      	<YAxis dataKey={'y'} name={yLabel} type={yType} />
                      	<Scatter name='Chart' data={instances} onClick={this.handleNodeClick.bind(this)}>
                            {
                                instances.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={zLabel ? colorGroup[entry.z]: '#1a75ff'}/>
                                ))
                            }
                        </Scatter>
                      	<CartesianGrid trokeDasharray="3 3"/>
                      	<Tooltip cursor={{strokeDasharray: '3 3'}} content={this.renderTooltip.bind(this)}/>
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
        );
    }
}
export default ScatterChartView;
