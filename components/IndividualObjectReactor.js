import React from 'react';
import IndividualDataView from './IndividualDataView';
import IndividualDataEdit from './IndividualDataEdit';
import AggregateDataView from './AggregateDataView';
import AggregateDataEdit from './AggregateDataEdit';

class IndividualObjectReactor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {isEditMode: 0};
    }
    render() {
        let dataViewType, dataEditType;
        switch(this.props.config? (this.props.config.dataViewType? this.props.config.dataViewType[0]:'') : ''){
            case 'IndividualDataView':
                dataViewType = <IndividualDataView spec={this.props.spec} config={this.props.config}/>;
            break;
            case 'AggregateDataView':
                dataViewType = <AggregateDataView spec={this.props.spec} config={this.props.config}/>;
            break;
            default:
                dataViewType = <IndividualDataView spec={this.props.spec} config={this.props.config}/>;
        }
        switch(this.props.config? (this.props.config.dataEditType? this.props.config.dataEditType[0]:'') : ''){
            case 'IndividualDataEdit':
                dataEditType = <IndividualDataEdit spec={this.props.spec} config={this.props.config}/>;
            break;
            case 'AggregateDataEdit':
                dataEditType = <AggregateDataEdit spec={this.props.spec} config={this.props.config}/>;
            break;
            default:
                dataEditType = <IndividualDataEdit spec={this.props.spec} config={this.props.config}/>;
        }
        if (this.state.isEditMode) {
            return (
                <div className="ui list">
                    <div className="item">
                        {dataEditType}
                    </div>
                </div>
            );
        }else{
            return (
                <div className="ui list">
                    <div className="item">
                        {dataViewType}
                    </div>
                </div>
            );
        }
    }
}

export default IndividualObjectReactor;
