import React from 'react';
import {defaultGraphName, authGraphName} from '../configs/general';
import {config} from '../configs/reactor';
import {facets} from '../configs/facets';

class Datasets extends React.Component {
    componentDidMount() {

    }
    render() {
        let sources = ['dataset', 'dataset_resource', 'dataset_property', 'dataset_object', 'dataset_resource_property', 'dataset_resource_object', 'dataset_property_object', 'dataset_resource_property_object'];
        let dss = [], dfl, brws, output = [];
        sources.forEach(function(s){
            for(let graph in config[s]){
                if(graph !== authGraphName[0] && graph !== 'generic'){
                    dfl = '';
                    brws = '';
                    if(graph === defaultGraphName[0]){
                        dfl = <i className="ui green flag icon" title="default dataset"></i>;
                    }
                    if(dss.indexOf(graph) === -1){
                        if(facets[graph]){
                            brws = <a className="ui label" href={'/browse/' + encodeURIComponent(graph)} title="browse"><i className="zoom icon"></i>browse</a>;
                        }
                        dss.push(graph);
                        output.push(<div className="ui item" key={graph}> <div className="content"> <i className="ui blue icon cubes"></i> <a href={'/dataset/1/' + encodeURIComponent(graph)} title="go to resource list">{graph}</a> {brws} {dfl}</div> </div>);
                    }
                }
            }
        });
        let info = <div className="ui blue message">
                        The list contains only the datasets for which at least one <b>config scope</b> is found!
                   </div>;
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
                    {dss.length ? <div>{info}</div> : ''}
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
