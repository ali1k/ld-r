import React from 'react';
import PropertyHeader from './PropertyHeader';
import DataBrowseReactor from './DataBrowseReactor';

class Facet extends React.Component {
    constructor(props){
        super(props);
    }
    checkItem(status, value) {
        this.props.onCheck(status, value, this.props.spec.propertyURI);
    }
    //used for custom sorting
    compare(a, b) {
        return (parseInt(b.total) - parseInt(a.total));
    }
    render() {
        let self = this;
        let cardClasses = 'ui card ' + (this.props.color ? this.props.color : 'blue');
        let descStyle = {
            minHeight: this.props.minHeight ? this.props.minHeight : 150,
            maxHeight: this.props.maxHeight ? this.props.maxHeight : 200,
            overflow: 'scroll'
        };
        //order by total count: for performance is done on client-side
        if(self.props.spec.propertyURI){
            this.props.spec.instances.sort(this.compare);
        }
        return (
            <div className={cardClasses} ref="facet">
                <div className="content">
                    <div className="ui horizontal list">
                        <div className="item">
                            <PropertyHeader spec={{property: this.props.spec.property, propertyURI: this.props.spec.propertyURI}} config={this.props.config} size="3" />
                        </div>
                    </div>
                    <div className="ui dividing header"></div>
                    <div className="meta">

                    </div>
                    <div className="description">
                        <div className="ui form" style={descStyle}>
                            <DataBrowseReactor shortenURI={true} spec={this.props.spec} config={this.props.config} onSelect={this.checkItem.bind(this)} graphName={this.props.graphName}/>
                        </div>
                    </div>
                  </div>
                  <div className="extra content">
                  </div>
            </div>
        );
    }
}

export default Facet;
