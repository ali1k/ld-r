import React from 'react';
import FacetItem from './FacetItem';

class Facet extends React.Component {
    checkItem(status, value) {
        this.props.onCheck(status, value, this.props.property);
    }
    //used for custom sorting
    compare(a, b) {
        return (parseInt(b.total) - parseInt(a.total));
    }
    render() {
        let self = this;
        let cardClasses = 'ui card ' + (this.props.color ? this.props.color : 'blue');
        //order by total count: for performance is done on client-side
        if(self.props.property !== 'master'){
            this.props.items.sort(this.compare);
        }
        let list = this.props.items.map(function(node, index) {
            return (
                <FacetItem label={node.label} value={node.value} total={self.props.property === 'master' ? 0 : node.total} key={index} onCheck={self.checkItem.bind(self)}/>
            );
        });
        let descStyle = {
            minHeight: this.props.minHeight ? this.props.minHeight : 150,
            maxHeight: this.props.maxHeight ? this.props.maxHeight : 200,
            overflow: 'scroll'
        };
        return (
            <div className={cardClasses} ref="facet">
                <div className="content">
                    <a className="ui dividing header"> {this.props.title} </a>
                    <div className="meta">

                    </div>
                    <div className="description">
                        <div className="ui form" style={descStyle}>
                            {list}
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
