import React from 'react';
import PropTypes from 'prop-types';
import URIUtil from '../../utils/URIUtil';
import {ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from 'recharts';

class ScatterChartView extends React.Component {
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
    handleNodeClick(params){
        console.log(params);
    }
    renderTooltip(params){
        if(params.payload.length){
            return (
                <div className="ui compact info message">
                    <b>{params.payload[0].payload.title}</b>
                    <br/>
                    {params.payload[0].name}: {params.payload[0].value}
                    <br/>
                    {params.payload[1].name}: {params.payload[1].value}
                </div>
            );
        } else {
            return '';
        }
    }
    render() {
        let self = this;

        let title,
            instances =[],
            out, xyz;
        let xType, yType;
        let xLabel, yLabel;
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
                //2D
                instances.push({title: title , x: Number(xyz.x), y: Number(xyz.y)});
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
                      	<Scatter name='Chart' data={instances} fill='#1a75ff' onClick={this.handleNodeClick.bind(this)}/>
                      	<CartesianGrid trokeDasharray="3 3"/>
                      	<Tooltip cursor={{strokeDasharray: '3 3'}} content={this.renderTooltip.bind(this)}/>
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
        );
    }
}
export default ScatterChartView;
