import React from 'react';
import {defaultGraphName, authGraphName, propertiesConfig, facetsConfig} from '../configs/reactor';

class Datasets extends React.Component {
    componentDidMount() {

    }
    render() {
        let dss = [], dfl, brws, output = [];
        for(let graph in propertiesConfig){
            if(graph !== authGraphName[0] && graph !== 'generic'){
                brws = '';
                dfl = '';
                if(facetsConfig[graph]){
                    brws = <a className="ui label" href={'/browse/' + encodeURIComponent(graph)} title="browse"><i className="zoom icon"></i>browse</a>;
                }
                if(graph === defaultGraphName[0]){
                    dfl = <i className="ui green flag icon" title="default dataset"></i>;
                }
                dss.push(graph);
                output.push(<div className="ui item" key={graph}> <div className="content"> <i className="ui blue icon cubes"></i> <a href={'/dataset/1/' + encodeURIComponent(graph)} title="go to resource list">{graph}</a> {brws} {dfl}</div> </div>);
            }
        }
        //if only facet is set
        for(let graph in facetsConfig){
            if(graph !== authGraphName[0] && graph !== 'generic'){
                if(dss.indexOf(graph) === -1){
                    brws = '';
                    dfl = '';
                    if(graph === defaultGraphName[0]){
                        dfl = <i className="ui green flag icon" title="default dataset"></i>;
                    }
                    brws = <a className="ui label" href={'/browse/' + encodeURIComponent(graph)} title="browse"><i className="zoom icon"></i>browse</a>;
                    dss.push(graph);
                    output.push(<div className="ui item" key={graph}> <div className="content"> <i className="ui blue icon cubes"></i> <a href={'/dataset/1/' + encodeURIComponent(graph)} title="go to resource list">{graph}</a> {brws} {dfl}</div> </div>);
                }
            }
        }
        if(!dss.length){
            if(defaultGraphName[0]){
                output.push(<div className="ui item" key={defaultGraphName[0]}> <div className="content"> <i className="ui blue icon cubes"></i> <a href={'/dataset/1/' + encodeURIComponent(defaultGraphName[0])} title="go to resource list">{defaultGraphName[0]}</a> </div> </div>);
            }else{
                //no graph name is specified
                output.push(<div className="ui big item" key="empty" > <div className="content">  Your config is empty!<a href={'/dataset/'}> <span className="ui big blue label">See all resources in all local datasets</span></a></div> </div>);
            }
        }
        return (
            <div className="ui page grid" ref="datasets">
                <div className="ui column">
                    <div className="ui segment">
                        <h1>Datasets</h1>
                        <div className="ui big divided list">
                            {output}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Datasets;
