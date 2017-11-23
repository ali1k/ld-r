import React from 'react';
import PropTypes from 'prop-types';
import URIUtil from '../../utils/URIUtil';
import chroma from 'chroma-js';

class NetworkView extends React.Component {
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
    render() {
        let self = this;
        let colorGroup = {};
        let Sigma, RandomizeNodePositions, RelativeSize, ForceAtlas2, SigmaEnableWebGL;
        if (process.env.BROWSER) {
            Sigma = require('react-sigma').Sigma;
            RandomizeNodePositions = require('react-sigma').RandomizeNodePositions;
            RelativeSize = require('react-sigma').RelativeSize;
            ForceAtlas2 = require('react-sigma').ForceAtlas2;
            SigmaEnableWebGL = require('react-sigma').SigmaEnableWebGL;
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
                if(xyz.z && !zLabel){
                    zLabel = xyz.zLabel;
                }
                //collect all other attributes
                if(Object.keys(xyz.others).length){
                    instances.push({uri: node.v, title: title , x: xyz.x, y: xyz.y, z: xyz.z, others: xyz.others});
                    //define
                    for(let prop in xyz.others){
                        if(!colorGroup[prop]){
                            colorGroup[prop] = chroma.random().hex();
                        }
                    }
                }else{
                    if(zLabel){
                        //3D
                        instances.push({uri: node.v, title: title , x: xyz.x, y: xyz.y, z: xyz.z});
                    }else{
                        //2D
                        instances.push({uri: node.v, title: title , x: xyz.x, y: xyz.y});
                    }
                }

            });
            let nodesObj = {}, edgesObj = {};
            let nodes = [], edges = [];
            instances.forEach((node, index) => {
                if(!nodesObj[node.uri]){
                    nodesObj[node.uri] = 1;
                    nodes.push({id: node.uri, label: node.title, color: '#1a75ff'});
                }
                if(!nodesObj[node.x]){
                    nodesObj[node.x] = 1;
                    nodes.push({id: node.x, label: URIUtil.getURILabel(node.x), color: '#329F5B'});
                }
                if(!edgesObj[node.uri+'_'+node.x]){
                    edgesObj[node.uri+'_'+node.x] = 1;
                    edges.push({id: node.uri+'_'+node.x, source: node.uri, target: node.x, label: xLabel, color: '#329F5B'});
                }
                //for y and z dimensions
                if(yLabel){
                    if(!nodesObj[node.y]){
                        nodesObj[node.y] = 1;
                        nodes.push({id: node.y, label: URIUtil.getURILabel(node.y), color: '#D9E228'});
                    }
                    if(!edgesObj[node.uri+'_'+node.y]){
                        edgesObj[node.uri+'_'+node.y] = 1;
                        edges.push({id: node.uri+'_'+node.y, source: node.uri, target: node.y, label: yLabel, color: '#D9E228'});
                    }
                }
                if(zLabel){
                    if(!nodesObj[node.z]){
                        nodesObj[node.z] = 1;
                        nodes.push({id: node.z, label: URIUtil.getURILabel(node.z), color: '#E9488C'});
                    }
                    if(!edgesObj[node.uri+'_'+node.z]){
                        edgesObj[node.uri+'_'+node.z] = 1;
                        edges.push({id: node.uri+'_'+node.z, source: node.uri, target: node.z, label: zLabel, color: '#E9488C'});
                    }
                }
                if(node.others){
                    for(let prop in node.others){
                        if(!nodesObj[node.others[prop]]){
                            nodesObj[node.others[prop]] = 1;
                            nodes.push({id: node.others[prop], label: URIUtil.getURILabel(node.others[prop]), color: colorGroup[prop]});
                        }
                        if(!edgesObj[node.uri+'_'+node.others[prop]]){
                            edgesObj[node.uri+'_'+node.others[prop]] = 1;
                            edges.push({id: node.uri+'_'+node.others[prop], source: node.uri, target: node.others[prop], label: prop, color: colorGroup[prop]});
                        }
                    }
                }
            });
            network = {nodes: nodes, edges: edges};
        }
        const minHeight = this.props.expanded ? 700 : 500;
        if (process.env.BROWSER) {
            return (
                <div ref="networkView" style={{overflow: 'auto', minHeight: minHeight+'px'}} key={Math.round(+new Date() / 1000)}>
                    <Sigma graph={network} settings={{drawEdges: true, clone: true}} key={Math.round(+new Date() / 1000)} style={{overflow: 'auto', minHeight: minHeight+'px'}}>
                        <ForceAtlas2 barnesHutOptimize barnesHutTheta={0.8} iterationsPerRender={2}/>
                        <RelativeSize initialSize={50}/>
                        <RandomizeNodePositions/>
                    </Sigma>
                </div>
            );
        }else{
            return (
                <div ref="networkView" style={{overflow: 'auto', minHeight: minHeight+'px'}} key={Math.round(+new Date() / 1000)}>
                    Server-side rendering might not work for this visualization. Wait a few seconds to refresh the visualization. Otherwise, choose another viewer for the results.
                </div>
            );
        }

    }
}
export default NetworkView;
