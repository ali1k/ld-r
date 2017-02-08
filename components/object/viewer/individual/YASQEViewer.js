import React from 'react';
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
    render() {
        if(this.props.config){

        }
        return (
            <div className='ui'>
                <textarea defaultValue={this.props.spec.value} ref='YASQE_query' className='sparql-query'></textarea>
            </div>
        );
    }
}
YASQEViewer.propTypes = {
    /**
    LD-R Configurations object
    */
    config: React.PropTypes.object,
    /**
    LD-R spec
    */
    spec: React.PropTypes.object
};
export default YASQEViewer;
