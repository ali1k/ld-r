import React from 'react';
import URIUtil from '../../utils/URIUtil';

class TagListBrowser extends React.Component {
    constructor(props) {
        super(props);
        this.state = {selected: []};
    }
    selectTag(value) {
        let pos = this.state.selected.indexOf(value);
        if(pos === -1){
            this.props.onCheck(1, value);
            this.state.selected.push(value);
        }else{
            this.props.onCheck(0, value);
            this.state.selected.splice(pos, 1);
        }
    }
    render() {
        let self = this;
        let title, cls, selected = 0;
        let tagsDIV = self.props.instances.map((node)=>{
            if(self.state.selected.indexOf(node.value) !== -1){
                selected = 1;
                cls = 'ui label blue';
            }else{
                selected = 0;
                cls = 'ui label basic';
            }
            title = node.value;
            title = URIUtil.getURILabel(title);
            return (<a style={{marginTop: 1}} key={node.value} className={cls} onClick={self.selectTag.bind(this, node.value)}>{title} <span className="ui small blue circular label">{node.total}</span></a>);
        });
        return (
            <div className="ui" ref="tagListBrowser">
                {tagsDIV}
            </div>
        );
    }
}

export default TagListBrowser;
