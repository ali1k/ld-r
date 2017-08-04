import React from 'react';
import PropTypes from 'prop-types';
import URIUtil from '../../utils/URIUtil';
import {Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, Legend, ResponsiveContainer} from 'recharts';
class RadarChartView extends React.Component {
    componentDidMount() {}
    getXYZ(propsForAnalysis){
        let c = 0, x, y, z, xLabel, yLabel, zLabel;
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
            if(c ==3){
                z = propsForAnalysis[prop];
                zLabel = prop;
            }
        }
        return {x: x, y: y, z: z, xLabel: xLabel, yLabel: yLabel, zLabel: zLabel};
    }
    render() {
        let self = this;
        let data = [];
        let title,
            instances =[],
            out, xyz;
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
                if(!xLabel){
                    xLabel = xyz.xLabel;
                }
                if(!yLabel){
                    yLabel = xyz.yLabel;
                }
                if(xyz.z){
                    //3D
                    if(!zLabel){
                        zLabel = xyz.zLabel;
                    }
                    instances.push({uri: node.v, title: title , x: xyz.x, y: Number(xyz.y), z: Number(xyz.z)});
                }else{
                    //2D
                    instances.push({uri: node.v, title: title , x: xyz.x, y: Number(xyz.y)});
                }
            });
            //group by variable x
            let tmp ={};
            instances.forEach((node, index) => {
                if(!tmp[node.x]){
                    tmp[node.x]={};
                    tmp[node.x][yLabel] = node.y;
                    if(zLabel){
                        tmp[node.x][zLabel] = node.z;
                    }
                }else{
                    //aggregate the numbers in terms of multiple instance
                    tmp[node.x][yLabel] = tmp[node.x][yLabel] + node.y;
                    if(zLabel){
                        tmp[node.x][zLabel] = tmp[node.x][zLabel] + node.z;
                    }
                }
            });
            let data2 = [];
            for(let prop in tmp){
                if(zLabel){
                    data2.push({x: prop, y: tmp[prop][yLabel], z: tmp[prop][zLabel]});
                }else{
                    data2.push({x: prop, y: tmp[prop][yLabel]});
                }

            }
            instances = data2;
        }
        //console.log(xType, yType);
        let height = 500;
        return (
            <div ref="radarChartView" style={{overflow: 'auto'}}>
                <ResponsiveContainer width="100%" height={height}>
                    <RadarChart cx={300} cy={250} outerRadius={200} data={instances}>
                        <Radar name={yLabel} dataKey="y" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6}/>
                        {zLabel ?
                            <Radar name={zLabel} dataKey="z" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6}/>
                            : null}
                        <PolarGrid />
                        <PolarAngleAxis dataKey="x" />
                        <PolarRadiusAxis/>
                        <PolarGrid />
                        <PolarRadiusAxis angle={30}/>
                        <Tooltip />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        );
    }
}
export default RadarChartView;
