import React from 'react';
import IndividualDataView from './IndividualDataView';
import IndividualDataEdit from './IndividualDataEdit';

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
            default:
                dataViewType = <IndividualDataView spec={this.props.spec} config={this.props.config}/>;
        }
        switch(this.props.config? (this.props.config.dataEditType? this.props.config.dataEditType[0]:'') : ''){
            case 'IndividualDataEdit':
                dataEditType = <IndividualDataEdit spec={this.props.spec} config={this.props.config}/>;
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
                        <div className="ui form grid">
                                <div className="twelve wide column field">
                                        {dataViewType}
                                </div>
                                <div className="four wide column field">
                                    <div className="medium ui circular basic icon button">
                                        <i className="edit large blue icon link "></i>
                                    </div>
                                </div>
                        </div>
                    </div>
                </div>
            );
        }
    }
}

export default IndividualObjectReactor;
