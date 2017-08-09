import React from 'react';
import PropTypes from 'prop-types';
import URIUtil from '../../utils/URIUtil';

class NetworkView extends React.Component {
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
        let Sigma, RandomizeNodePositions, RelativeSize, ForceAtlas2;
        if (process.env.BROWSER) {
            Sigma = require('react-sigma').Sigma;
            RandomizeNodePositions = require('react-sigma').RandomizeNodePositions;
            RelativeSize = require('react-sigma').RelativeSize;
            ForceAtlas2 = require('react-sigma').ForceAtlas2;
        }
        let network = {nodes: [], edges: []};
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
                    instances.push({uri: node.v, title: title , x: xyz.x, y: xyz.y, z: xyz.z});
                }else{
                    if(xyz.y){
                        //2D
                        instances.push({uri: node.v, title: title , x: xyz.x, y: xyz.y});
                    }else{
                        //1D
                        instances.push({uri: node.v, title: title , x: xyz.x});
                    }

                }
            });
            let nodesObj = {}, edgesObj = {};
            let nodes = [], edges = [];
            instances.forEach((node, index) => {
                if(!nodesObj[node.uri]){
                    nodesObj[node.uri] = 1;
                    nodes.push({id: node.uri, label: node.title, color: '#8884d8'});
                }
                if(!nodesObj[node.x]){
                    nodesObj[node.x] = 1;
                    nodes.push({id: node.x, label: URIUtil.getURILabel(node.x), color: '#82ca9d'});
                }
                if(!edgesObj[node.uri+'_'+node.x]){
                    edgesObj[node.uri+'_'+node.x] = 1;
                    edges.push({id: node.uri+'_'+node.x, source: node.uri, target: node.x, label: xLabel});
                }
                //for y and z dimensions
                if(yLabel){
                    if(!nodesObj[node.y]){
                        nodesObj[node.y] = 1;
                        nodes.push({id: node.y, label: URIUtil.getURILabel(node.y), color: '#ff3399'});
                    }
                    if(!edgesObj[node.uri+'_'+node.y]){
                        edgesObj[node.uri+'_'+node.y] = 1;
                        edges.push({id: node.uri+'_'+node.y, source: node.uri, target: node.y, label: yLabel});
                    }
                }
                if(zLabel){
                    if(!nodesObj[node.z]){
                        nodesObj[node.z] = 1;
                        nodes.push({id: node.z, label: URIUtil.getURILabel(node.z), color: '#caaf8f'});
                    }
                    if(!edgesObj[node.uri+'_'+node.z]){
                        edgesObj[node.uri+'_'+node.z] = 1;
                        edges.push({id: node.uri+'_'+node.z, source: node.uri, target: node.z, label: zLabel});
                    }
                }
            });
            network = {nodes: nodes, edges: edges};
        }
        const height = 500;
        return (
            <div ref="networkView" style={{overflow: 'auto'}}>
                <Sigma graph={network} settings={{drawEdges: true, clone: true}} key={Math.round(+new Date() / 1000)}>
                    <ForceAtlas2 barnesHutOptimize barnesHutTheta={0.8} iterationsPerRender={2}/>
                    <RelativeSize initialSize={50}/>
                    <RandomizeNodePositions/>
                </Sigma>
            </div>
        );
    }
}
export default NetworkView;
