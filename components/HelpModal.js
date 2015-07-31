import React from 'react';

class HelpModal extends React.Component {
    render() {
        return (
            <div className="ui modal">
              <i className="close icon"></i>
              <div className="header">
                Help
              </div>
              <div className="content">
                <div className="description">
                  <div className="ui divided list">
                      <div className="item">
                        <h3> About Icons </h3>
                      </div>
                      <div className="item">
                        <i className="big circle info icon"></i>
                        <div className="content">
                          <a className="header">More information on properties</a>
                          <div className="description">Mouseover on this icon allows you to see what values are expected for the property.</div>
                        </div>
                      </div>
                      <div className="item">
                        <i className="big blue edit icon"></i>
                        <div className="content">
                          <a className="header">Edit value</a>
                          <div className="description">Clicking on this icon allows you to edit the current value of the property.</div>
                        </div>
                      </div>
                      <div className="item">
                        <i className="big green save icon"></i>
                        <div className="content">
                          <a className="header">Save value</a>
                          <div className="description">Clicking on this icon will save the inserted value for property.</div>
                        </div>
                      </div>
                      <div className="item">
                        <i className="big blue undo icon"></i>
                        <div className="content">
                          <a className="header">Undo value</a>
                          <div className="description">Clicking on this icon will undo the value of a property.</div>
                        </div>
                      </div>
                      <div className="item">
                        <i className="big red trash outline icon"></i>
                        <div className="content">
                          <a className="header">Delete a value</a>
                          <div className="description"> If a property has multiple values, you can use this icon to delete a value.</div>
                        </div>
                      </div>
                      <div className="item">
                        <i className="big blue unhide icon"></i>
                        <div className="content">
                          <a className="header">See more details</a>
                          <div className="description"> Clicking on this icon allows you to see and edit other sub-properties of a value (if existed).</div>
                        </div>
                      </div>
                      <div className="item">
                        <i className="big blue hide icon"></i>
                        <div className="content">
                          <a className="header">Hide details</a>
                          <div className="description"> Clicking on this icon hides the sub-properties of a value (if existed).</div>
                        </div>
                      </div>
                      <div className="item">
                        <i className="big blue icon add circle"></i>
                        <div className="content">
                          <a className="header">Add details</a>
                          <div className="description"> If a property value allows value extension, clicking on this icon will enable users to add more details on the value.</div>
                        </div>
                      </div>
                      <div className="item">
                        <i className="big blue icon add square"></i>
                        <div className="content">
                          <a className="header">Add another value</a>
                          <div className="description"> If a property allows multiple values, you can use this icon to add another values to the property. The system automatically generates a default value for the property. You then need to change the inserted default value.</div>
                        </div>
                      </div>
                      <div className="item">
                        <i className="big red icon cancel square"></i>
                        <div className="content">
                          <a className="header"> Cancel value</a>
                          <div className="description"> Clicking on this icon cancels adding new values to a property.</div>
                        </div>
                      </div>
                      <div className="item">
                        <div className="content">
                            <a className="header"> Resource </a>
                          <div className="description"> <i className="big icon black cube"></i> Read Only Access <i className="big icon green cube"></i> Write Access <i className="big icon yellow cube"></i> Partial Write Access </div>
                        </div>
                      </div>
                    </div>
                </div>
              </div>
            </div>
        );
    }
}

export default HelpModal;
