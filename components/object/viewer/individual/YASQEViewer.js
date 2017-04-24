import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';

if (process.env.BROWSER) {
    require('yasgui-yasqe/dist/yasqe.min.css');
}
/**
display SPARQL queries
*/
class YASQEViewer extends React.Component {
    constructor(props) {
        super(props);
        this.yasqe = {};
    }
    componentDidMount() {
        let self = this;
        self.yasqe = YASQE.fromTextArea(self.refs.YASQE_query, {
            createShareLink: false
        });
        self.yasqe.setValue(self.props.spec.value);
        self.yasqe.execCommand('selectAll');
        YASQE.doAutoFormat(self.yasqe);
        //self.yasqe.collapsePrefixes(true)
    }
    componentDidUpdate() {
        let self = this;
        self.yasqe.setValue(self.props.spec.value);
        self.yasqe.execCommand('selectAll');
        YASQE.doAutoFormat(self.yasqe);
        //self.yasqe.collapsePrefixes(true)
    }
    handleRunQuery(){
        let self = this;
        let query = self.yasqe.getValue();
        //todo: call the right action to run the query
    }
    render() {
        if(this.props.config){

        }
        let runDIV = '';
        //this property allows users to manually run a query
        if(this.props.allowRun){
            runDIV = <a onClick={this.handleRunQuery.bind(this)} className='ui icon primary fluid button'><i className='ui icon play'></i>Run</a>;
        }
        return (
            <div className='ui'>
                <textarea defaultValue={this.props.spec.value} ref='YASQE_query' className='sparql-query'></textarea>
                {runDIV}
            </div>
        );
    }
}
YASQEViewer.propTypes = {
    /**
    LD-R Configurations object
    */
    config: PropTypes.object,
    /**
    LD-R spec
    */
    spec: PropTypes.object
};
export default YASQEViewer;
