import React from 'react';

class Tree extends React.Component {
    constructor(props) {
        super(props);
    }
    handleNodeClick(value){
        this.props.onNodeClick(value);
    }
    makeNode(selected, value, label, count, derived){
        if(label!=='Thing'){
            let classes = 'ui basic label';
            if(selected){
                classes = 'ui blue label';
            }
            if(derived){
                classes = classes + ' disabled';
            }
            return (
                <a onClick={this.handleNodeClick.bind(this, value)} className={classes}>{label} <span className="ui small blue circular label">{count}</span></a>
            )
        }else{
            return '';
        }
    }
    render() {
        let self = this;
        let childNodes;
        if(this.props.tree.children){
            childNodes = this.props.tree.children.map((node, index) => {
                if(node.children){
                    return (
                        <div className="item" key={index}>
                            <Tree tree={node} onNodeClick={self.props.onNodeClick.bind(self)}/>
                        </div>
                    );
                }else{
                    return (
                        <div className="item" key={index}>
                            {self.makeNode(node.selected, node.value, node.id, node.count, node.derived)}
                        </div>
                    );
                }

            });
        }
        return (
            <div className="item">
                {this.makeNode(this.props.tree.selected, this.props.tree.value, this.props.tree.id, this.props.tree.count, this.props.tree.derived)}
                <div className="content">
                    <div className="compact list">
                        {childNodes}
                    </div>
                </div>
            </div>
        );
    }
}

export default Tree;
