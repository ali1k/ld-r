import React from 'react';
import PropTypes from 'prop-types';
import URIUtil from '../../utils/URIUtil';

class TimelineView extends React.Component {
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

    render() {
        let self = this;
        let colorGroup = {};
        let title,
            instances =[],
            out, xyz;
        let xLabel, yLabel, zLabel;
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
                xLabel = xyz.xLabel;
                yLabel = xyz.yLabel;
                zLabel = xyz.zLabel;
                instances.push({id: node.v, title: title , start_time: Number(xyz.x), end_time: Number(xyz.y)});
                if(zLabel){
                    //3D

                }else{
                    //2D
                }
            });
            //console.log(instances);
        }
        const minHeight = this.props.expanded ? 700 : 500;
        return (
            <div ref="timelineView" style={{overflow: 'auto'}}>
                <div className="ui segment">Sorry! The timeline component is not yet implemented!</div>
            </div>
        );
    }
}
export default TimelineView;
